/* GET /api/petition-count — live signature total for the pledge/share pages.
   Counts Petition Signatures rows; CDN-cached for 2 minutes so bursts don't
   hammer Airtable. Returns {count:null} until Airtable is configured. */
const U = require("./_util");
const AT = require("./_airtable");

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "GET") return res.status(405).json({ error: "GET only" });
  res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=600");
  if (!U.configured()) return res.status(200).json({ count: null, skipped: "not_configured" });
  try {
    var count = 0, offset = "", pages = 0;
    do {
      var q = "pageSize=100&fields%5B%5D=signature_id" + (offset ? "&offset=" + encodeURIComponent(offset) : "");
      var j = await AT.at("GET", AT.T.signatures(), { query: q });
      count += (j.records || []).length;
      offset = j.offset || "";
      pages++;
    } while (offset && pages < 100); // 10k rows/request cap; revisit at scale
    return res.status(200).json({ count: count });
  } catch (e) {
    return res.status(200).json({ count: null, error: String(e.message || e) });
  }
};
