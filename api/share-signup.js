/* POST /api/share-signup — unknown-user form on /share. Match-or-create,
   ensure a referral_code, return it. No event (contact creation IS the event). */
const U = require("./_util");
const AT = require("./_airtable");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  if (!U.configured()) return res.status(200).json({ success: false, skipped: "not_configured" });
  try {
    var contact = await AT.matchOrCreateContact(body);
    var referral_code = contact.referral_code || await AT.ensureReferralCode({ id: contact.id, fields: contact.fields });
    return res.status(200).json({ success: true, contact_id: contact.contact_id, referral_code: referral_code });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
};
