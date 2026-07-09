# Don't Divide Us — first-party data backend

Dependency-free Vercel serverless functions (Node built-ins only: `crypto` +
global `fetch`). No `package.json`, no build step. Files prefixed `_` are shared
libraries, not routes.

**These functions are inert until configured.** With no env vars set, every
endpoint returns `200 { skipped: "not_configured" }` and writes nothing — the
static site and its fire-and-forget front-end calls are unaffected. They only
start storing data once you add the env vars below and redeploy.

## Endpoints (core — spec phases 1–6)

| Route | Purpose |
|-------|---------|
| `POST /api/petition-signup` | Match-or-create Contact → Petition Signed event → Petition Signatures → Meta `Lead`. Handles `?ref=` referral attribution. |
| `POST /api/event-log` | Generic match-or-create + event capture. |
| `POST /api/checkout` · `GET ?session_id=` | Create a Stripe Checkout Session (carries `client_reference_id`); GET returns a thank-you summary. |
| `POST /api/stripe-webhook` | Manual-HMAC-verified; ingests `checkout.session.completed` + `invoice.paid` → Donation (idempotent) → Donations → Meta `Purchase`. |
| `POST /api/share-click` | Beacon on `?ref=` page loads → Share Click on referrer. |
| `POST /api/share-issued` | Share-button press → Share Issued. |
| `POST /api/share-signup` | Unknown-user form on /share → returns a referral code. |
| `GET /api/share-context` | Resolve a donor by `session_id` (Stripe) or `email` for the /share page. |

The **front-end already calls these** (fire-and-forget): the pledge form posts
`petition-signup`, every page beacons `share-click` when `?ref=` is present,
`share.html` uses `share-signup` / `share-context` / `share-issued`, and the
donate CTA appends `client_reference_id`.

## Airtable schema (create before wiring)

Create the typed projection tables **before** the link fields that point at
them. All writes use `typecast: true`, so `singleSelect` choices auto-create.

- **Contacts** (primary `contact_id`): first_name, last_name, email, mobile,
  postcode, fbclid, fbp, `referral_code` (unique), `referred_by` (link→Contacts,
  self), first_source_channel (singleSelect), status (singleSelect: Signatory
  Only | Donor Only | Signatory + Donor | Inactive), date_first_seen,
  last_updated.
- **Events** (primary `event_id`): contact (link), event_type (singleSelect),
  timestamp, payload (long text), fbclid, referral_code_used, source_channel,
  meta_event_id, `fanout_status` (singleSelect: Fanned Out | No Typed Table |
  Failed), `fanout_error`.
- **Donations** (primary `donation_id`): contact + event (links), amount_cents,
  amount, currency, stripe_object_type, stripe_object_id, stripe_payment_intent,
  email, name, phone, postcode, country, content_name, source_url, fbclid, fbp,
  petition_slug, timestamp, payload.
- **Petition Signatures** (primary `signature_id`): contact + event (links),
  first_name, last_name, email, mobile, postcode, country, campaign, consent,
  fbclid, fbp, ref_used, utm_source/medium/campaign/term/content, timestamp,
  payload.

## Environment variables (Vercel → Preview + Production; redeploy after adding)

**Required (core):**
```
AIRTABLE_API_KEY          # PAT, scopes: data:read, data:write, schema:read
AIRTABLE_BASE_ID          # appXXXXXXXX
STRIPE_SECRET_KEY         # for /api/checkout + webhook customer lookups
STRIPE_WEBHOOK_SECRET     # whsec_… — register the webhook in Stripe first
```
**Optional table-name overrides:** `AIRTABLE_CONTACTS_TABLE` (Contacts),
`AIRTABLE_EVENTS_TABLE` (Events), `AIRTABLE_DONATIONS_TABLE` (Donations),
`AIRTABLE_PETITION_SIGNATURES_TABLE` (Petition Signatures).

**Optional Meta CAPI:** `META_PIXEL_ID`, `META_CAPI_TOKEN`,
`META_TEST_EVENT_CODE`. Unset = Meta calls are skipped; everything else works.

## Setup checklist

1. Create the four Airtable tables above (typed tables first, then link fields).
2. Add `AIRTABLE_API_KEY` + `AIRTABLE_BASE_ID` in Vercel → **redeploy**. Submit
   the live pledge form → a Contact + Events + Petition Signatures row should land.
3. Create a Stripe webhook → `https://<domain>/api/stripe-webhook`, subscribe
   `checkout.session.completed` + `invoice.paid`; set `STRIPE_WEBHOOK_SECRET` +
   `STRIPE_SECRET_KEY` → redeploy. A test donation should land a Donations row.
4. (Optional) To move the donate page off the static Stripe payment link and
   onto dynamic sessions, POST `/api/checkout` and redirect to the returned
   `url` (it sets `client_reference_id` and the success/cancel URLs for you).
5. (Optional) Add `META_PIXEL_ID` + `META_CAPI_TOKEN` for ad attribution.

## Not included (optional bolt-ons from the pipeline spec)

Cellcast SMS thank-you/lapse texts, Campaign Nucleus lapse-recovery email,
Rally ticketing, cron sweeps, and the admin/leaderboard endpoints are **not**
built here — each needs additional third-party accounts. Ask to add any of them.
