/* /api/checkout
   POST → create a Stripe Checkout Session (AUD; subscription for monthly),
          carrying client_reference_id = petition slug. Returns {url,id}.
   GET ?session_id=cs_… → thank-you summary.
   Inert (200 skipped) until STRIPE_SECRET_KEY is set. */
const U = require("./_util");

function qp(req, k) {
  if (req.query && req.query[k]) return req.query[k];
  try { return new URL(req.url, "http://x").searchParams.get(k); } catch (e) { return null; }
}

module.exports = async function (req, res) {
  U.setCors(req, res);
  if (req.method === "OPTIONS") return res.status(204).end();

  if (req.method === "GET") {
    var sid = qp(req, "session_id") || qp(req, "cs");
    if (!sid) return res.status(400).json({ error: "session_id required" });
    if (!process.env.STRIPE_SECRET_KEY) return res.status(200).json({ skipped: "not_configured" });
    try {
      var s = await U.stripeGet("checkout/sessions/" + encodeURIComponent(sid));
      return res.status(200).json({ session: {
        amount_total: s.amount_total, currency: s.currency,
        frequency: (s.metadata && s.metadata.frequency) || "oneoff",
        email: (s.customer_details && s.customer_details.email) || s.customer_email,
        paid: s.payment_status === "paid"
      } });
    } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
  }

  if (req.method !== "POST") return res.status(405).json({ error: "POST only" });
  var body = await U.readJson(req);
  var amount = Math.round(parseFloat(body.amount) * 100) / 100;
  if (!(amount >= 2 && amount <= 50000)) return res.status(400).json({ error: "amount out of range ($2–$50,000)" });
  if (!process.env.STRIPE_SECRET_KEY) return res.status(200).json({ skipped: "not_configured" });

  var origin = req.headers.origin || ("https://" + (req.headers.host || "dontdivideus.vercel.app"));
  var monthly = body.frequency === "monthly";
  var params = {
    mode: monthly ? "subscription" : "payment",
    success_url: origin + "/donate-success.html?cs={CHECKOUT_SESSION_ID}",
    cancel_url: origin + "/donate-cancelled.html",
    client_reference_id: body.slug || "pledge",
    line_items: [{
      quantity: 1,
      price_data: {
        currency: "aud",
        unit_amount: Math.round(amount * 100),
        product_data: { name: "Donation to Don't Divide Us" },
        recurring: monthly ? { interval: "month" } : undefined
      }
    }],
    metadata: {
      org: "dontdivideus", frequency: monthly ? "monthly" : "oneoff",
      content_name: body.content_name || "donation", source_url: body.source_url || "",
      ref: body.ref || "", contact_id: body.contact_id || "", sms_variant: body.sms_variant || "",
      petition_slug: body.slug || "pledge", fbclid: body.fbclid || "", fbp: body.fbp || ""
    }
  };
  // Invoices don't inherit session metadata; copying it onto the subscription
  // makes it reachable via invoice.subscription_details.metadata in the webhook.
  if (monthly) params.subscription_data = { metadata: params.metadata };
  if (body.email) params.customer_email = body.email;
  try {
    var s2 = await U.stripePost("checkout/sessions", params);
    if (s2.error) return res.status(500).json({ error: s2.error.message || "stripe error" });
    return res.status(200).json({ url: s2.url, id: s2.id });
  } catch (e) { return res.status(500).json({ error: String(e.message || e) }); }
};
