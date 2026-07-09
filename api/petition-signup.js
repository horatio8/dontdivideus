/* POST /api/petition-signup — match-or-create a Contact, log Petition
   Signed, attribute a referrer, project to Petition Signatures, fire
   Meta CAPI Lead. Inert (200 skipped) until Airtable is configured. */
const U = require("./_util");
const AT = require("./_airtable");
const M = require("./_meta");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  if (!U.configured()) return res.status(200).json({ success: false, skipped: "not_configured" });

  try {
    var contact = await AT.matchOrCreateContact(body);
    var referral_code = contact.referral_code || await AT.ensureReferralCode({ id: contact.id, fields: contact.fields });

    var referrerCode = "";
    if (body.ref) {
      var referrer = await AT.findContactByCode(body.ref);
      if (referrer) {
        referrerCode = String(body.ref).toUpperCase();
        try { await AT.at("PATCH", AT.T.contacts(), { recordId: contact.id, body: { fields: { referred_by: [referrer.id] }, typecast: true } }); } catch (e) {}
        try { await AT.logEvent({ event_type: "Share Conversion", contactRecId: referrer.id, payload: { ref: referrerCode, converted_contact: contact.contact_id }, referral_code_used: referrerCode }); } catch (e) {}
      }
    }

    var meta_event_id = "petition_" + contact.contact_id + "_" + Date.now();
    await AT.logEvent({ event_type: "Petition Signed", contactRecId: contact.id, payload: body, fbclid: body.fbclid || "", referral_code_used: referrerCode, meta_event_id: meta_event_id });

    M.sendMetaEvent({ event_name: "Lead", event_id: meta_event_id, req: req, user: {
      email: body.email, first_name: body.first_name, last_name: body.last_name, phone: body.mobile,
      postcode: body.postcode, country: "Australia", external_id: contact.contact_id, fbp: body.fbp, fbclid: body.fbclid
    } }).catch(function () {});

    return res.status(200).json({ success: true, contact_id: contact.contact_id, referral_code: referral_code, meta_event_id: meta_event_id, is_new_contact: contact.isNew });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
};
