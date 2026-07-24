/* POST /api/stripe-webhook — Web-API handler so the raw request bytes are
   available for Stripe HMAC verification. (Vercel's Node helpers pre-parse
   req.body on classic (req,res) handlers, which destroys the signed payload —
   the Next.js-style bodyParser config export is ignored for plain functions.)
   Ingests checkout.session.completed + invoice.paid into a Donation event
   (idempotent on stripe_<id>), projects to Donations, fires Meta Purchase.
   Inert until STRIPE_WEBHOOK_SECRET + Airtable env vars are set. */
import crypto from "node:crypto";
import U from "./_util.js";
import AT from "./_airtable.js";
import M from "./_meta.js";

export async function POST(request) {
  const raw = await request.text();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || !U.configured()) return json({ skipped: "not_configured" });

  const sig = request.headers.get("stripe-signature") || "";
  if (!verify(raw, sig, secret)) return json({ error: "bad signature" }, 400);

  let evt;
  try { evt = JSON.parse(raw); } catch (e) { return json({ error: "bad json" }, 400); }
  try {
    const type = evt.type, obj = evt.data && evt.data.object;
    if (type === "checkout.session.completed") {
      if (obj.mode === "subscription") return json({ ok: true, skipped: "subscription" });
      await ingest(obj, "checkout.session", request);
    } else if (type === "invoice.paid") {
      await ingest(obj, "invoice", request);
    }
    return json({ ok: true });
  } catch (e) {
    // 200 so Stripe doesn't storm retries on a transient store error; surfaced in logs.
    return json({ ok: false, error: String(e.message || e) });
  }
}

function json(body, status) {
  return new Response(JSON.stringify(body), {
    status: status || 200,
    headers: { "Content-Type": "application/json" }
  });
}

function verify(raw, header, secret) {
  const parts = {};
  String(header).split(",").forEach(function (kv) { const i = kv.indexOf("="); if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1); });
  const t = parts.t, v1 = parts.v1;
  if (!t || !v1) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > 300) return false; // 5-min skew
  const expected = crypto.createHmac("sha256", secret).update(t + "." + raw).digest("hex");
  try { return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(v1)); } catch (e) { return false; }
}

async function ingest(obj, objType, request) {
  let email = (obj.customer_details && obj.customer_details.email) || obj.customer_email;
  let name = (obj.customer_details && obj.customer_details.name) || "";
  let phone = (obj.customer_details && obj.customer_details.phone) || "";
  if (!email && obj.customer) {
    try { const c = await U.stripeGet("customers/" + obj.customer); email = c.email; name = name || c.name || ""; phone = phone || c.phone || ""; } catch (e) {}
  }
  const amount_cents = obj.amount_total != null ? obj.amount_total : (obj.amount_paid != null ? obj.amount_paid : 0);
  const currency = obj.currency || "aud";
  // Sessions carry metadata directly; invoices carry the subscription's copy.
  const md = obj.metadata && Object.keys(obj.metadata).length ? obj.metadata
    : ((obj.subscription_details && obj.subscription_details.metadata) || {});
  const petition_slug = obj.client_reference_id || md.petition_slug || "";
  const contact = await AT.matchOrCreateContact({ email: email, first_name: (name || "").split(" ")[0], last_name: (name || "").split(" ").slice(1).join(" "), mobile: phone });

  const meta_event_id = "stripe_" + obj.id;
  const payload = {
    amount_cents: amount_cents, amount: amount_cents / 100, currency: currency,
    email: email, name: name, phone: phone,
    stripe_object_type: objType, stripe_object_id: obj.id, stripe_payment_intent: obj.payment_intent || "",
    petition_slug: petition_slug, source_url: md.source_url || "", content_name: md.content_name || "donation",
    fbclid: md.fbclid || "", fbp: md.fbp || "", raw: obj
  };
  const r = await AT.logEventIdempotent({
    event_type: "Donation", contactRecId: contact.id, payload: payload,
    meta_event_id: meta_event_id, referral_code_used: md.ref ? String(md.ref).toUpperCase() : ""
  });
  if (!r.duplicate) {
    const reqShim = { headers: {
      "x-forwarded-for": request.headers.get("x-forwarded-for") || "",
      "user-agent": request.headers.get("user-agent") || ""
    } };
    M.sendMetaEvent({ event_name: "Purchase", event_id: meta_event_id, value: amount_cents / 100, currency: String(currency).toUpperCase(), req: reqShim,
      user: { email: email, first_name: (name || "").split(" ")[0], phone: phone, external_id: contact.contact_id } }).catch(function () {});
  }
}
