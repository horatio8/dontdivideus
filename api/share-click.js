/* POST /api/share-click — beacon on a page load carrying ?ref=.
   Logs a Share Click on the referrer's contact. */
const U = require("./_util");
const AT = require("./_airtable");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  if (!U.configured()) return res.status(200).json({ success: false, skipped: "not_configured" });
  try {
    var referrer = await AT.findContactByCode(body.ref);
    if (!referrer) return res.status(200).json({ success: false, reason: "unknown_ref" });
    var ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    await AT.logEvent({
      event_type: "Share Click", contactRecId: referrer.id,
      payload: { source_url: body.source_url || "", ip: ip, ua: req.headers["user-agent"] || "" },
      fbclid: body.fbclid || "", referral_code_used: String(body.ref).toUpperCase()
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
};
