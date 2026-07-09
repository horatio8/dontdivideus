/* POST /api/stripe-webhook — manual HMAC verify (no SDK), ingest
   checkout.session.completed + invoice.paid into a Donation event
   (idempotent on stripe_<id>), project to Donations, fire Meta Purchase.
   Needs the RAW body: bodyParser disabled below. Inert until configured. */
const crypto = require("crypto");
const U = require("./_util");
const AT = require("./_airtable");
const M = require("./_meta");

module.exports = async function (req, res) {
  if (req.method !== "POST") return res.status(405).end();
  var raw = await U.readRaw(req);
  var secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !U.configured()) return res.status(200).json({ skipped: "not_configured" });

  var sig = req.headers["stripe-signature"] || "";
  if (!verify(raw, sig, secret)) return res.status(400).json({ error: "bad signature" });

  var evt;
  try { evt = JSON.parse(raw); } catch (e) { return res.status(400).json({ error: "bad json" }); }
  try {
    var type = evt.type, obj = evt.data && evt.data.object;
    if (type === "checkout.session.completed") {
      if (obj.mode === "subscription") return res.status(200).json({ ok: true, skipped: "subscription" });
      await ingest(obj, "checkout.session", req);
    } else if (type === "invoice.paid") {
      await ingest(obj, "invoice", req);
    }
    return res.status(200).json({ ok: true });
  } catch (e) {
    // 200 so Stripe doesn't storm retries on a transient store error; surfaced in logs.
    return res.status(200).json({ ok: false, error: String(e.message || e) });
  }
};

function verify(raw, header, secret) {
  var parts = {};
  String(header).split(",").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1); });
  var t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // 5-min skew
  var expected = crypto.createHmac("sha256", secret).update(t + "." + raw).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)); } catch (e) { return false; }
}

async function ingest(obj, objType, req) {
  var email = (obj.customer_details && obj.customer_details.email) || obj.customer_email;
  var name = (obj.customer_details && obj.customer_details.name) || "";
  var phone = (obj.customer_details && obj.customer_details.phone) || "";
  if (!email && obj.customer) {
    try { var c = await U.stripeGet("customers/" + obj.customer); email = c.email; name = name || c.name || ""; phone = phone || c.phone || ""; } catch (e) {}
  }
  var amount_cents = obj.amount_total != null ? obj.amount_total : (obj.amount_paid != null ? obj.amount_paid : 0);
  var currency = obj.currency || "aud";
  var petition_slug = obj.client_reference_id || (obj.metadata && obj.metadata.petition_slug) || "";
  var md = obj.metadata || {};
  var contact = await AT.matchOrCreateContact({ email: email, first_name: (name || "").split(" ")[0], last_name: (name || "").split(" ").slice(1).join(" "), mobile: phone });

  var meta_event_id = "stripe_" + obj.id;
  var payload = {
    amount_cents: amount_cents, amount: amount_cents / 100, currency: currency,
    email: email, name: name, phone: phone,
    stripe_object_type: objType, stripe_object_id: obj.id, stripe_payment_intent: obj.payment_intent || "",
    petition_slug: petition_slug, source_url: md.source_url || "", content_name: md.content_name || "donation",
    fbclid: md.fbclid || "", fbp: md.fbp || "", raw: obj
  };
  var r = await AT.logEventIdempotent({
    event_type: "Donation", contactRecId: contact.id, payload: payload,
    meta_event_id: meta_event_id, referral_code_used: md.ref ? String(md.ref).toUpperCase() : ""
  });
  if (!r.duplicate) {
    M.sendMetaEvent({ event_name: "Purchase", event_id: meta_event_id, value: amount_cents / 100, currency: String(currency).toUpperCase(), req: req,
      user: { email: email, first_name: (name || "").split(" ")[0], phone: phone, external_id: contact.contact_id } }).catch(function () {});
  }
}

// Stripe signature verification needs the unparsed bytes.
module.exports.config = { api: { bodyParser: false } };
