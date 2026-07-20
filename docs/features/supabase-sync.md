# Cross-Device Sync (Supabase)

**Status: Live** — shipped 2026-07-19. **Reliability hardened 2026-07-20** after a real data-loss incident — see below, the original last-write-wins design in "How it works" §1/§4 was replaced.

## Why

Persistence was `localStorage`-only, so laptop and phone had completely independent data — anything added on one device never appeared on the other. Rafli caught this directly ("data di hp dan di laptop itu berbeda... tidak sinkron") and asked for real cross-device sync using the Supabase project that was already provisioned (`backend/.env` / `frontend/.env.local` both had live credentials — Supabase was configured, just never wired into the app beyond the paused WhatsApp webhook).

## What "done" means

Add/edit/delete anything in the app on one device, and it shows up on another device within a couple of seconds — no login, no manual export/import.

## Architecture decision: whole-state JSONB blob, not per-table CRUD

`supabase/migrations/0001_initial_schema.sql` already scaffolds 11 relational tables (`goals`, `skills`, `transactions`, etc.) with per-row RLS policies gated on `auth.uid()`. That schema is **not usable from the browser as-is**: this app has no login system (`CLAUDE.md`: "No authentication"), so `auth.uid()` is always null for the anon-key client, and every one of those RLS policies denies access unconditionally. Only server-side code holding the service-role key (`frontend/src/lib/supabase/admin.js`) can touch those tables — which is exactly how the WhatsApp webhook already worked before this change.

Wiring real CRUD against 11+ tables (create/update/delete per entity, through new API routes, with conflict handling per row) would have been a multi-day rebuild of every store action. Instead, this ships a single new table:

```sql
-- supabase/migrations/0003_app_state_sync.sql
create table public.app_state (
    user_id     text primary key,
    state       jsonb not null,
    updated_at  timestamptz not null default now()
);
```

One row per user, holding the exact same shape `persistableSlice()` already produces for `localStorage`. RLS is enabled with **zero policies** — that denies the anon/authenticated roles entirely and lets only the service-role key (server-only, never shipped to the browser) reach the table. No auth migration needed, no per-row policy design needed.

This covers *all* app data, including Life Compass reflections/letters — confirmed with Rafli that "private" in this app means "never shown to anyone else," not "never leaves this device," so nothing is excluded from sync.

**Trade-off accepted**: no server-side SQL querying per entity (e.g. can't do `select * from transactions where amount > x` directly in Supabase — everything is computed client-side from the full blob, same as today). Fine for a single-user app with no reporting/analytics surface outside the app itself. If that need ever shows up, `0001_initial_schema.sql`'s relational tables are still there, unused, ready for a real migration — nothing about this change makes that harder later.

## How it works

1. **Pull, local-first**: `hydrate()` in `frontend/src/lib/store.js` renders from `localStorage` immediately (offline-first, no flicker), then fetches `/api/sync` in the background. If the remote copy's `updated_at` is newer than the local copy's `savedAt`, the store swaps to the remote state and re-saves it locally. If nothing has synced yet for this account, or if the local copy is newer/equal, it pushes local state up instead (covers "first ever sync" and "a previous push failed while offline").
2. **Push, debounced**: `persist()` (called after every mutation, same as before) now also calls `schedulePush()` — an 800ms-debounced push of the full state blob to `/api/sync`, so rapid successive edits (e.g. typing in a form) collapse into one network write instead of one per keystroke.
3. **Server routes** (`frontend/src/app/api/sync/route.js`): `GET` returns `{ state, updatedAt }` for the fixed seed user; `POST` upserts `{ state }`. Both use `getSupabaseAdmin()` (service-role key, bypasses RLS) and `export const dynamic = "force-dynamic"` (Next.js caches GET handlers by default — same fix already applied to `/api/whatsapp/pull`, see that doc's "Known issue" for why this matters). Both no-op gracefully (`{ state: null }` / `{ ok: false }`) if Supabase env vars are absent, so the app keeps working `localStorage`-only in any environment without Supabase configured.
4. **Conflict resolution**: last-write-wins by wall-clock timestamp (`savedAt` on the local envelope, `updated_at` on the Supabase row). No merge, no CRDT. Acceptable for a single person editing from one device at a time; two devices editing concurrently within the same debounce window could lose one side's change. Not addressed — flag if it ever becomes a real problem in practice.

## Reliability hardening (2026-07-20) — the incident, root cause, and the fix

**What happened**: Rafli's real transactions/goals/skills — entered over time on his actual device — were never showing up in the `app_state` table. Direct queries against Supabase confirmed it repeatedly held only the original seed data (transaction IDs literally matching `generateTransactionHistory()`'s `tx-0-in`, `tx-5-ex-6`, etc., `source: null`, never anything the user had typed).

**Root cause #1 — a push-before-check race in `hydrate()`.** The original `hydrate()` (see git history) called `persist()` immediately for a fresh/no-`localStorage` device *before* it had checked whether Supabase already held real synced data. `persist()`'s push was debounced 800ms; the "check what Supabase has" fetch usually — but not always — resolved faster than that. On a slow/cold request, the debounced push fired first and silently overwrote the real cloud copy with a brand-new device's blank seed state, with no error surfaced anywhere. Reproduced directly: artificially delayed the `/api/sync` GET past 800ms and confirmed the old code path would push before the check completed.

**Root cause #2 — "whichever timestamp is newer wins" is unsafe when either copy might be wrong.** Even after fixing #1, a second incident happened the same session: a *different* device/browser (one that had never held the user's real data, only its own stale local seed) was opened after Supabase had been reset — it correctly saw "remote is empty" and pushed *its own* seed data, because nothing in the design distinguished "a device with real synced history" from "a device that's never synced anything real." Comparing `savedAt` vs `updated_at` can't fix this — a wrong device's timestamp is just as fresh as a right device's.

**The fix — replace timestamp comparison with an explicit dirty flag, make Supabase authoritative:**
- `pendingSync` (persisted alongside the state blob in `localStorage`, not sent to Supabase) means "this device has writes Supabase hasn't confirmed yet." Set `true` synchronously the moment `persist()` is called, cleared only by a confirmed-successful push (`markSynced()`).
- `hydrate()` no longer compares `savedAt`/`updated_at` at all. Once Supabase is configured: if this device has `pendingSync` writes, push them (they win, they're real edits Supabase hasn't seen). Otherwise, **trust Supabase's copy unconditionally** — no guessing.
- A failed push is never silent: `markSyncFailed()` keeps `pendingSync: true`, persists that to `localStorage`, and shows a dismissable-once-fixed notification ("Gagal sync ke server"). Retried automatically on the next app open (`hydrate()` sees `pendingSync: true`) and the moment the browser's `online` event fires (listener in `providers.jsx`) — not only on the next unrelated mutation.
- `loadFromStorage()`'s `parsed.version !== 1 → return null` reject-and-reseed check was also a real (if not-yet-triggered) landmine: any future `version` bump in `seed.js` would have silently discarded a user's entire saved state on next load. Replaced with `migrateState()` — spreads the current default shape under whatever the stored blob already has, so existing fields are always preserved and only missing/new fields get backfilled; non-array corruption on a list field falls back to empty instead of crashing every `.map()`/`.filter()` downstream. Logs a `console.warn` when a migration actually changes something, and if it does, the corrected shape is pushed back to Supabase rather than only living in this device's memory.
- If `NEXT_PUBLIC_SUPABASE_URL`/`NEXT_PUBLIC_SUPABASE_ANON_KEY` are missing from a build (e.g. not set in a Vercel environment), `warnSupabaseNotConfigured()` now surfaces a persistent in-app notification — previously this degraded silently to local-only storage with no visible sign anywhere.

**Recovery for the already-corrupted production row**: the `app_state` row for `rafli-akbar` was deleted directly via the service-role REST API (it held zero real value — confirmed via direct query before deletion) so the next real hydrate would see "nothing synced yet" and correctly push the real device's local data up, rather than a timestamp comparison risking pulling the wrong data down over it.

## Files touched

| File | Change |
|---|---|
| `supabase/migrations/0003_app_state_sync.sql` | New table, applied to the live project. |
| `frontend/src/app/api/sync/route.js` | New — GET pull / POST push. |
| `frontend/src/lib/store.js` | `migrateState()` (replaces the version-reject check), `pendingSync` tracking, `markSynced`/`markSyncFailed`/`retryPendingSync`/`warnSupabaseNotConfigured` actions, `hydrate()` rewritten to trust-flag-based reconciliation instead of timestamp comparison. |
| `frontend/src/app/providers.jsx` | `online` event listener calls `retryPendingSync()`. |

## Verified

**2026-07-19, initial ship** — Playwright, two isolated browser contexts (no shared storage — simulates two physical devices): Device A adds a transaction → confirmed present via `GET /api/sync` after the debounce window → Device B (fresh context, zero localStorage) loads `/finance` and sees the transaction within ~1.5s of hydrate. Deleted it on Device A, confirmed it disappeared from `/api/sync` too. Final `app_state` row confirmed via direct SQL: one row for `rafli-akbar`, no leftover test data.

**2026-07-20, reliability hardening** — all tests run against mocked `/api/sync` responses (Playwright route interception), deliberately never touching the real Supabase project again mid-incident:
- Injected a `{version: 999, transactions: [...one dummy transaction...]}` blob directly into `localStorage`, reloaded — confirmed the dummy transaction survived, `version` normalized to 1, missing fields (goals, etc.) backfilled from defaults, and the migration `console.warn` fired.
- Mocked a failed `POST /api/sync` (500) — confirmed `pendingSync: true` persisted to `localStorage` (not just in-memory — a real bug caught during this exact test: `markSyncFailed()` initially only updated Zustand state, not `localStorage`, fixed same pass) and the "Gagal sync ke server" notification appeared. Fired a synthetic `online` event with the mock flipped to succeed — confirmed automatic retry cleared `pendingSync` and the notification.
- Mocked a clean, complete remote state with no local `pendingSync` — confirmed it's adopted unconditionally with zero pushes back (only pushes when the remote genuinely needed migrating, verified separately by deliberately mocking an incomplete remote shape).
- Full page smoke test (`/`, `/goals`, `/finance`, `/career`, `/skills`, `/ai`) against a mocked sync endpoint — no console errors.

## Known limitations / not built

- No real-time push between open tabs/devices — sync happens on mutation (debounced) and on page load, not via a live subscription. A second device already open won't see a change until it reloads or makes its own edit.
- No merge for two devices editing concurrently within the same debounce window — Supabase-authoritative-when-no-local-pending resolves the *correctness* bug (never silently prefer a stale/wrong copy) but two genuinely-concurrent edits from two different devices can still have one overwrite the other. Not addressed — flag if it ever becomes a real problem in practice for a single-user app.
- Single hardcoded user (`rafli-akbar`, from `NEXT_PUBLIC_SEED_USER_ID`) — matches the rest of the app's no-auth design. Multi-user would need real auth first, at which point the relational schema in `0001_initial_schema.sql` becomes the better fit than this blob table.
- `isSupabaseConfigured()` checks `NEXT_PUBLIC_*` env vars, which Next.js inlines at **build time** — `warnSupabaseNotConfigured()` catches a build that shipped without them, but confirming they're actually set in Vercel's Production/Preview/Development environments is still a manual check in the Vercel dashboard (Project Settings → Environment Variables); nothing in this codebase can verify that from the outside.
