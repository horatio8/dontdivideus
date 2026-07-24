/* Airtable client + identity ladder + event log + fan-out projections.
   Single source of truth for the Contacts / Events / Donations /
   Petition Signatures data model (see api/README.md). */
const U = require("./_util");

const API = "https://api.airtable.com/v0";
function baseId() { return process.env.AIRTABLE_BASE_ID; }
function apiKey() { return process.env.AIRTABLE_API_KEY; }
function tbl(env, def) { return process.env[env] || def; }

const T = {
  contacts: function () { return tbl("AIRTABLE_CONTACTS_TABLE", "Contacts"); },
  events: function () { return tbl("AIRTABLE_EVENTS_TABLE", "Events"); },
  donations: function () { return tbl("AIRTABLE_DONATIONS_TABLE", "Donations"); },
  signatures: function () { return tbl("AIRTABLE_PETITION_SIGNATURES_TABLE", "Petition Signatures"); }
};

async function at(method, table, opts) {
  opts = opts || {};
  var url = API + "/" + encodeURIComponent(baseId()) + "/" + encodeURIComponent(table);
  if (opts.recordId) url += "/" + opts.recordId;
  if (opts.query) url += "?" + opts.query;
  var r = await fetch(url, {
    method: method,
    headers: { Authorization: "Bearer " + apiKey(), "Content-Type": "application/json" },
    body: opts.body ? JSON.stringify(opts.body) : undefined
  });
  var j = await r.json();
  if (!r.ok) { var e = new Error("airtable " + r.status + ": " + JSON.stringify(j)); e.status = r.status; throw e; }
  return j;
}
function esc(s) { return String(s == null ? "" : s).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }
async function findOne(table, formula) {
  var j = await at("GET", table, { query: "maxRecords=1&filterByFormula=" + encodeURIComponent(formula) });
  return (j.records && j.records[0]) || null;
}

async function ensureUniqueCode() {
  var lens = [6, 6, 8];
  for (var i = 0; i < lens.length; i++) {
    var c = U.referralCode(lens[i]);
    var exists = await findOne(T.contacts(), "{referral_code}='" + esc(c) + "'");
    if (!exists) return c;
  }
  return U.referralCode(10);
}
async function ensureReferralCode(rec) {
  if (rec.fields && rec.fields.referral_code) return rec.fields.referral_code;
  var c = await ensureUniqueCode();
  await at("PATCH", T.contacts(), { recordId: rec.id, body: { fields: { referral_code: c }, typecast: true } });
  return c;
}
async function findContactByCode(code) {
  if (!code) return null;
  return await findOne(T.contacts(), "{referral_code}='" + esc(String(code).toUpperCase()) + "'");
}
async function findContactByEmail(email) {
  var e = U.normEmail(email);
  if (!e) return null;
  return await findOne(T.contacts(), "LOWER({email})='" + esc(e) + "'");
}

// Identity ladder: email → E.164 mobile → first+last+postcode → CREATE.
async function matchOrCreateContact(fields) {
  var email = U.normEmail(fields.email);
  var phone = U.normPhone(fields.mobile || fields.phone);
  var first = (fields.first_name || "").trim();
  var last = (fields.last_name || "").trim();
  var postcode = (fields.postcode || "").trim();

  var rec = null;
  if (email) rec = await findOne(T.contacts(), "LOWER({email})='" + esc(email) + "'");
  if (!rec && phone) rec = await findOne(T.contacts(), "{mobile}='" + esc(phone) + "'");
  if (!rec && first && last && postcode) {
    rec = await findOne(T.contacts(),
      "AND(LOWER({first_name})='" + esc(first.toLowerCase()) + "',LOWER({last_name})='" +
      esc(last.toLowerCase()) + "',{postcode}='" + esc(postcode) + "')");
  }

  var now = new Date().toISOString();
  if (rec) {
    var f = rec.fields || {}, patch = {};
    if (!f.first_name && first) patch.first_name = first;
    if (!f.last_name && last) patch.last_name = last;
    if (!f.email && email) patch.email = email;
    if (!f.mobile && phone) patch.mobile = phone;
    if (!f.postcode && postcode) patch.postcode = postcode;
    if (!f.fbclid && fields.fbclid) patch.fbclid = fields.fbclid; // preserve first-touch
    if (!f.fbp && fields.fbp) patch.fbp = fields.fbp;
    patch.last_updated = now;
    var upd = await at("PATCH", T.contacts(), { recordId: rec.id, body: { fields: patch, typecast: true } });
    return { id: upd.id, fields: upd.fields, contact_id: upd.fields.contact_id, referral_code: upd.fields.referral_code, isNew: false };
  }

  var contact_id = U.uuid();
  var referral_code = await ensureUniqueCode();
  var created = await at("POST", T.contacts(), { body: { typecast: true, fields: {
    contact_id: contact_id, first_name: first, last_name: last, email: email, mobile: phone, postcode: postcode,
    fbclid: fields.fbclid || "", fbp: fields.fbp || "", referral_code: referral_code,
    first_source_channel: fields.source_channel || "Direct", status: "Signatory Only",
    date_first_seen: now, last_updated: now
  } } });
  return { id: created.id, fields: created.fields, contact_id: contact_id, referral_code: referral_code, isNew: true };
}

// Fan-out: mapped type → projection table; unmapped → "No Typed Table".
var PROJECTION = { "Petition Signed": projectSignature, "Donation": projectDonation };

async function patchEvent(id, fields) { await at("PATCH", T.events(), { recordId: id, body: { fields: fields, typecast: true } }); }

async function fanout(eventRec, ev) {
  var proj = PROJECTION[ev.event_type];
  try {
    if (!proj) { await patchEvent(eventRec.id, { fanout_status: "No Typed Table" }); return; }
    await proj(eventRec, ev);
    await patchEvent(eventRec.id, { fanout_status: "Fanned Out" });
  } catch (e) {
    try { await patchEvent(eventRec.id, { fanout_status: "Failed", fanout_error: String(e.message || e).slice(0, 240) }); } catch (_) {}
  }
}

async function logEvent(ev) {
  var event_id = U.uuid();
  var rec = await at("POST", T.events(), { body: { typecast: true, fields: {
    event_id: event_id,
    contact: ev.contactRecId ? [ev.contactRecId] : undefined,
    event_type: ev.event_type,
    timestamp: new Date().toISOString(),
    payload: JSON.stringify(ev.payload || {}, null, 2),
    fbclid: ev.fbclid || "",
    referral_code_used: ev.referral_code_used || "",
    source_channel: ev.source_channel || "",
    meta_event_id: ev.meta_event_id || ""
  } } });
  await fanout(rec, ev);
  return { event_id: event_id, id: rec.id };
}
async function logEventIdempotent(ev) {
  if (ev.meta_event_id) {
    var existing = await findOne(T.events(), "{meta_event_id}='" + esc(ev.meta_event_id) + "'");
    if (existing) return { event_id: existing.fields.event_id, id: existing.id, duplicate: true };
  }
  return await logEvent(ev);
}

async function projectSignature(eventRec, ev) {
  var p = ev.payload || {};
  await at("POST", T.signatures(), { body: { typecast: true, fields: {
    signature_id: U.uuid(),
    contact: ev.contactRecId ? [ev.contactRecId] : undefined,
    event: [eventRec.id],
    first_name: p.first_name || "", last_name: p.last_name || "", email: U.normEmail(p.email),
    mobile: U.normPhone(p.mobile), postcode: p.postcode || "", country: p.country || "Australia",
    campaign: p.campaign || "", consent: p.consent !== false,
    fbclid: p.fbclid || "", fbp: p.fbp || "", ref_used: ev.referral_code_used || "",
    utm_source: p.utm_source || "", utm_medium: p.utm_medium || "", utm_campaign: p.utm_campaign || "",
    utm_term: p.utm_term || "", utm_content: p.utm_content || "",
    timestamp: new Date().toISOString(), payload: JSON.stringify(p, null, 2)
  } } });
}
async function projectDonation(eventRec, ev) {
  var p = ev.payload || {};
  await at("POST", T.donations(), { body: { typecast: true, fields: {
    donation_id: U.uuid(),
    contact: ev.contactRecId ? [ev.contactRecId] : undefined,
    event: [eventRec.id],
    amount_cents: p.amount_cents || 0, amount: (p.amount_cents || 0) / 100, currency: p.currency || "aud",
    stripe_object_type: p.stripe_object_type || "", stripe_object_id: p.stripe_object_id || "",
    stripe_payment_intent: p.stripe_payment_intent || "",
    email: U.normEmail(p.email), name: p.name || "", phone: U.normPhone(p.phone),
    postcode: p.postcode || "", country: p.country || "", content_name: p.content_name || "",
    source_url: p.source_url || "", fbclid: p.fbclid || "", fbp: p.fbp || "",
    petition_slug: p.petition_slug || "",
    timestamp: new Date().toISOString(), payload: JSON.stringify(p.raw || p, null, 2)
  } } });
}

module.exports = {
  at, findOne, T, matchOrCreateContact, ensureReferralCode,
  findContactByCode, findContactByEmail, logEvent, logEventIdempotent
};
