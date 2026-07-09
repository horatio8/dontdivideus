/* POST /api/share-issued — a donor/signer pressed a share button on /share. */
const U = require("./_util");
const AT = require("./_airtable");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  if (!U.configured()) return res.status(200).json({ success: false, skipped: "not_configured" });
  try {
    var sharer = await AT.findContactByCode(body.referral_code);
    if (!sharer) return res.status(200).json({ success: false, reason: "unknown_code" });
    await AT.logEvent({
      event_type: "Share Issued", contactRecId: sharer.id,
      payload: { platform: body.platform || "", share_url: body.share_url || "" },
      referral_code_used: String(body.referral_code).toUpperCase()
    });
    return res.status(200).json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: String(e.message || e) });
  }
};
