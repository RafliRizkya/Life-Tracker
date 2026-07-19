# Cross-Device Sync (Supabase)

**Status: Live** — shipped 2026-07-19.

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

## Files touched

| File | Change |
|---|---|
| `supabase/migrations/0003_app_state_sync.sql` | New table, applied to the live project. |
| `frontend/src/app/api/sync/route.js` | New — GET pull / POST push. |
| `frontend/src/lib/store.js` | `saveToStorage`/`loadFromStorage` now track `savedAt`; `hydrate()` is async and reconciles with Supabase in the background; `persist()` and `reseed()` also push. |

## Verified

Playwright, two isolated browser contexts (no shared storage — simulates two physical devices): Device A adds a transaction → confirmed present via `GET /api/sync` after the debounce window → Device B (fresh context, zero localStorage) loads `/finance` and sees the transaction within ~1.5s of hydrate. Deleted it on Device A, confirmed it disappeared from `/api/sync` too (round-trip, not just one-way). Final `app_state` row confirmed via direct SQL: one row for `rafli-akbar`, no leftover test data.

## Known limitations / not built

- No real-time push between open tabs/devices — sync happens on mutation (debounced) and on page load, not via a live subscription. A second device already open won't see a change until it reloads or makes its own edit.
- Last-write-wins, no merge — see conflict resolution above.
- Single hardcoded user (`rafli-akbar`, from `NEXT_PUBLIC_SEED_USER_ID`) — matches the rest of the app's no-auth design. Multi-user would need real auth first, at which point the relational schema in `0001_initial_schema.sql` becomes the better fit than this blob table.
