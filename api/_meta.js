/* Meta Conversions API poster. SHA-256 hashes all PII. No-ops when
   META_PIXEL_ID / META_CAPI_TOKEN are unset. The shared event_id is
   reused by the browser Pixel for Events Manager dedup. */
const crypto = require("crypto");

function h(v) {
  if (v === undefined || v === null || v === "") return undefined;
  return crypto.createHash("sha256").update(String(v).trim().toLowerCase()).digest("hex");
}
function hphone(v) {
  if (!v) return undefined;
  return crypto.createHash("sha256").update(String(v).replace(/[^\d]/g, "")).digest("hex");
}

async function sendMetaEvent(opts) {
  var pid = process.env.META_PIXEL_ID, tok = process.env.META_CAPI_TOKEN;
  if (!pid || !tok) return { skipped: true };
  var user = opts.user || {}, req = opts.req;
  var ud = {};
  if (user.email) ud.em = [h(user.email)];
  if (user.first_name) ud.fn = [h(user.first_name)];
  if (user.last_name) ud.ln = [h(user.last_name)];
  if (user.phone) ud.ph = [hphone(user.phone)];
  if (user.postcode) ud.zp = [h(user.postcode)];
  if (user.city) ud.ct = [h(user.city)];
  if (user.state) ud.st = [h(user.state)];
  if (user.country) ud.country = [h(user.country)];
  if (user.external_id) ud.external_id = [h(user.external_id)];
  if (user.fbp) ud.fbp = user.fbp;
  if (user.fbclid) ud.fbc = "fb.1." + Date.now() + "." + user.fbclid;
  if (req) {
    ud.client_ip_address = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim();
    ud.client_user_agent = req.headers["user-agent"] || "";
  }
  var custom = Object.assign({}, opts.custom || {});
  if (opts.value != null) { custom.value = opts.value; custom.currency = opts.currency || "AUD"; }
  var body = { data: [{
    event_name: opts.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: opts.event_id,
    action_source: "website",
    user_data: ud,
    custom_data: custom
  }] };
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE;
  try {
    var r = await fetch("https://graph.facebook.com/v19.0/" + pid + "/events?access_token=" + encodeURIComponent(tok), {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body)
    });
    return await r.json();
  } catch (e) { return { error: String(e.message || e) }; }
}

module.exports = { sendMetaEvent };
