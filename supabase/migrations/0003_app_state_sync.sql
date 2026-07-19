-- Whole-app-state sync — lets the same account see the same data on every
-- device instead of being stuck in each browser's localStorage.
--
-- Chosen over wiring full CRUD against the 11 relational tables in
-- 0001_initial_schema.sql: those tables' RLS policies require auth.uid(),
-- but Phase 1 has no login system, so auth.uid() is always null from the
-- browser and those tables are unreachable by design without an auth
-- migration first. This app is single-user, so one JSONB blob per user —
-- the same shape already used for the localStorage cache — gets
-- cross-device sync without a relational rewrite.

create table if not exists public.app_state (
    user_id     text primary key,
    state       jsonb not null,
    updated_at  timestamptz not null default now()
);

alter table public.app_state enable row level security;

-- No policies defined, on purpose: RLS enabled with zero policies denies
-- all access to the anon/authenticated roles. Only the service-role key
-- (used exclusively by the Next.js server in frontend/src/app/api/sync)
-- bypasses RLS, so this table is reachable only through our own server,
-- never directly from the browser's anon-key client.
