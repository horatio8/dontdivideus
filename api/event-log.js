/* POST /api/event-log — generic match-or-create + event capture. No Meta fire. */
const U = require("./_util");
const AT = require("./_airtable");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  if (!U.configured()) return res.status(200).json({ success: false, skipped: "not_configured" });

  try {
    var email = body.email || (body.payload && body.payload.email);
    var mobile = body.mobile || (body.payload && body.payload.mobile);
    var contact = await AT.matchOrCreateContact({
      email: email, mobile: mobile, first_name: body.first_name, last_name: body.last_name,
      postcode: body.postcode, source_channel: body.source_channel
    });
    await AT.logEvent({
      event_type: body.event_type || "Other", contactRecId: contact.id,
      payload: body.payload || body, fbclid: body.fbclid || "",
      referral_code_used: body.ref ? String(body.ref).toUpperCase() : "", source_channel: body.source_channel || ""
    });
    return res.status(200).json({ success: true, contact_id: contact.contact_id });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
};
