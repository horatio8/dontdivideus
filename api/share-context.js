/* GET /api/share-context?session_id=cs_… | ?email=…
   Resolves a donor/signer for the /share page. Returns
   { contact_id, referral_code, first_name, petition_slug } or 404. */
const U = require("./_util");
const AT = require("./_airtable");

function qp(req, k) {
  if (req.query && req.query[k]) return req.query[k];
  try { return new URL(req.url, "http://x").searchParams.get(k); } catch (e) { return null; }
}

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  if (!U.configured()) return res.status(200).json({ found: false, skipped: "not_configured" });

  var email = qp(req, "email"), petition_slug = "";
  var sid = qp(req, "session_id") || qp(req, "cs");
  try {
    if (sid && process.env.STRIPE_SECRET_KEY) {
      var s = await U.stripeGet("checkout/sessions/" + encodeURIComponent(sid));
      email = (s.customer_details && s.customer_details.email) || s.customer_email || email;
      petition_slug = s.client_reference_id || "";
    }
    if (!email) return res.status(404).json({ found: false });
    var contact = await AT.findContactByEmail(email);
    if (!contact) return res.status(404).json({ found: false });
    var f = contact.fields || {};
    return res.status(200).json({
      found: true, contact_id: f.contact_id, referral_code: f.referral_code,
      first_name: f.first_name || "", petition_slug: petition_slug
    });
  } catch (e) {
    return res.status(500).json({ found: false, error: String(e.message || e) });
  }
};
