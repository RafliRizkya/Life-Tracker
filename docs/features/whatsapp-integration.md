# WhatsApp → Finance Transaction Sync

**Status: Paused — Planned / Phase 2**

## Why paused

The feature needs a WhatsApp sender number to allowlist and a Meta App to receive real webhook traffic from. Rafli doesn't want to use his personal number and plans to buy a dedicated WhatsApp Business number first. All code is built, tested end-to-end against a real webhook simulation, and safe to leave in the codebase inert — resuming needs no re-architecture, just credentials and a public URL.

Original spec: `docs/prompt/feature-whatsapp.md`. Full original implementation plan (architecture rationale, decisions, verification log): `C:\Users\rafli\.claude\plans\linear-dancing-sundae.md` (local to the machine that built this — not in the repo).

---

## What "done" means

Send a WhatsApp message like `"beli kopi 4000 pake BCA"`, `"gaji 5 juta"`, or `"transfer 200 ribu ke DANA"` to a WhatsApp Business number, and it shows up as a parsed transaction on the `/finance` page — rule-based parsing only, no AI/LLM (matches this app's Phase 1 "no AI" rule).

## What's already implemented (all present, all tested)

| File | Purpose |
|---|---|
| `supabase/migrations/0002_whatsapp_transactions.sql` | Adds `source`, `raw_message`, `wa_message_id` columns + idempotency index to `public.transactions`. **Already applied to the live Supabase project** (migration `0001` had never been applied either — it was applied at the same time). |
| `frontend/src/lib/whatsapp/parser.js` | Rule-based Indonesian message parser. Handles `ribu`/`rb`/`k` (×1,000) and `juta`/`jt` (×1,000,000) amount shorthand, infers income/expense type, category (via keyword match against `TX_CATEGORIES`), title, and payment-method/destination notes. Pure functions, no I/O. |
| `frontend/src/lib/whatsapp/verify.js` | `verifySignature` (HMAC-SHA256 of the raw body against Meta's `X-Hub-Signature-256` header) and `isAllowedSender` (single-number allowlist). |
| `frontend/src/lib/supabase/admin.js` | Server-only Supabase service-role client (`getSupabaseAdmin()`), bypasses RLS for the webhook's trusted server-to-server insert. |
| `frontend/src/app/api/whatsapp/route.js` | The webhook. `GET` handles Meta's verification handshake; `POST` verifies signature + sender, parses the message, inserts into Supabase, always returns `200` once past the security checks (per Meta's retry semantics). `export const dynamic = "force-dynamic"` — required, see Known Issue below. |
| `frontend/src/app/api/whatsapp/pull/route.js` | Lets the browser read WhatsApp-sourced transactions without ever shipping the service-role key client-side. Also `force-dynamic`. |
| `frontend/src/lib/store.js` | `normalizeTransaction()` (shared defaulting logic between manual add and WhatsApp sync — no duplicated logic), `syncWhatsAppTransactions()` action (pulls + dedupes by `id` into local state). |
| `frontend/src/app/providers.jsx` | Calls `syncWhatsAppTransactions()` once on mount, after hydration. |
| `frontend/.env.example` | Documents the required env vars (safe to commit — the root `.gitignore` has an explicit `!.env.example` exception since `.env.*` would otherwise swallow it too). |

**Confirmed field-inference behavior** (tested against real simulated Meta payloads):

| Message | type | category | amount | title | notes |
|---|---|---|---|---|---|
| "beli kopi 4000 pake BCA" | expense | `food` | 4,000 | "Kopi" | "via BCA" |
| "gaji 5 juta" | income | `salary` | 5,000,000 | "Gaji" | "" |
| "transfer 200 ribu ke DANA" | expense | `other_out` | 200,000 | "Transfer" | "ke DANA" |

**Also verified**: bad HMAC signature → `401`; disallowed sender → silent `200`, no insert; duplicate `wa_message_id` (Meta's at-least-once delivery) → no duplicate row; Finance page correctly reflects synced transactions in totals/charts/budgets; existing manual add/edit/delete flows are unaffected (the `normalizeTransaction` refactor is behavior-preserving).

## Known issue fixed during this build — read before resuming

Next.js App Router caches GET route handlers by default. Both webhook routes were initially missing `export const dynamic = "force-dynamic"`, which caused `/api/whatsapp/pull` to serve a **stale cached response** even after the underlying Supabase rows were deleted. This is fixed (both routes now have the export) — if you ever see stale data from these routes again, this is the first thing to check, and confirm with a full dev-server restart (route segment config didn't reliably hot-reload in testing — `.next/cache` may need clearing too).

## What's still missing to go live

1. **A dedicated WhatsApp Business number** (Rafli's blocker — buy this first).
2. **Real values for the placeholder env vars** in `frontend/.env.local` (currently commented out — see below).
3. **Subscribe the Meta App's webhook to the `messages` field** — in the Meta dashboard: WhatsApp → Configuration → Webhook → Manage → toggle `messages` on. Verification alone (step 4) does not do this.
4. **A public callback URL** — for local dev, `ngrok http 3000` and use the printed `https://*.ngrok-free.app/api/whatsapp` URL (ngrok free-tier URLs are ephemeral and change on every restart — the Meta dashboard config must be re-entered each time unless upgraded to a static domain). For production, whatever your real deployment URL is.
5. **Send a real test message and confirm it lands** on `/finance`.

## Env vars — current state

`frontend/.env.local` (gitignored, not committed) currently has the 3 WhatsApp vars **commented out** with a pointer back to this doc:

```
# WHATSAPP_VERIFY_TOKEN=local-dev-verify-token
# WHATSAPP_APP_SECRET=local-dev-app-secret-change-me
# WHATSAPP_ALLOWED_NUMBER=6281200000000
```

These were placeholder/test values used to verify the webhook end-to-end with a fake HMAC signature during development — **not real Meta credentials**. Do not uncomment them as-is.

`SUPABASE_SERVICE_ROLE_KEY` is left active (real, working value) — it's a general Phase-2 Supabase capability, not WhatsApp-specific, and is harmless while unused (the webhook routes simply return empty/no-op results when the WhatsApp-specific vars are absent, which is what the "works normally without WhatsApp config" verification below confirmed).

## Exact steps to resume

1. Buy the WhatsApp Business number, add it to the existing Meta App (Rafli already created the Meta App itself — that part is done).
2. In `frontend/.env.local`, uncomment and fill in:
   - `WHATSAPP_VERIFY_TOKEN` — any string you choose, must match what you enter in the Meta dashboard.
   - `WHATSAPP_APP_SECRET` — from Meta dashboard: App settings → Basic → App Secret → Show.
   - `WHATSAPP_ALLOWED_NUMBER` — your new WhatsApp Business number, digits only, country code, no `+` (e.g. `62812xxxxxxx`).
3. Start the dev server (`npm run dev` in `frontend/`), then `ngrok http 3000` (or deploy for a permanent URL).
4. In the Meta dashboard (WhatsApp → Configuration → Webhook → Edit): Callback URL = `<your-url>/api/whatsapp`, Verify token = your `WHATSAPP_VERIFY_TOKEN` value → Verify and Save.
5. Manage → subscribe to `messages`.
6. Send a real WhatsApp message to the number, confirm it appears on `/finance`.

No code changes should be needed for this — only configuration.

## Verified: app works normally with WhatsApp fully unconfigured

Re-tested with the 3 WhatsApp env vars absent: webhook `GET` degrades to `403` (no crash), `/api/whatsapp/pull` returns `[]`, `/finance` loads and functions identically to before this feature existed, `syncWhatsAppTransactions()` is a silent no-op. Confirmed via a clean dev-server restart with cache cleared.
