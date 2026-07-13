# Rafli Life Tracker — PRD & Progress

## Original problem statement

Membangun Rafli Life Tracker sebagai produk final berdasarkan repo
https://github.com/RafliRizkya/Life-Tracker. Target user: Rafli, profesional
membangun karier Data Analyst, mengatur keuangan, tabungan bertahap Rp10–100 jt,
menuju Financial Freedom. Redesign menyeluruh, motion halus & bermakna,
mobile-first, tanpa sleep tracker, bahasa utama Indonesia.

## User choices (verbatim)

- Stack: **Next.js 14 App Router + Supabase** (Auth + Postgres + RLS + Storage)
- AI: **Skip dulu (rule-based only)**
- Auth: **Single seeded user tanpa login screen**, schema multi-user ready
- Scope: **Semua 6 modul lengkap**
- Seed: **Data Rafli lengkap sesuai spec**
- Push GitHub: user pakai "Save to Github" feature ke `final-product`

## Architecture

- Frontend: Next.js 14 (App Router), Tailwind, Framer Motion, Recharts, cmdk,
  Zustand + localStorage persistence.
- Data layer: dual-mode. Local JSON (localStorage) sekarang; Supabase JS client
  siap dipakai begitu env `NEXT_PUBLIC_SUPABASE_URL` diisi.
- Backend: FastAPI health-check stub only (satisfy supervisor). Real API
  operasi dilakukan client-side via Zustand → Supabase client bila configured.
- Supabase: SQL migration + RLS policies di `/app/supabase/migrations/0001_initial_schema.sql`.
- Fonts: Playfair Display + Instrument Serif + DM Sans + DM Mono (via `next/font/google`).

## Implemented in this pass (2026-01)

- ✅ Struktur repo bersih: `frontend/`, `backend/`, `supabase/`, `_reference/`, `docs/`, `memory/`.
- ✅ 6 modul end-to-end: Dashboard, Goals, Career, Finance, Skills, Weekly Review.
- ✅ Editorial design system (warm off-white + forest/sage/lime/terracotta),
  Playfair display headings, DM Sans interface, DM Mono meta.
- ✅ Dark mode designed (night forest palette).
- ✅ Career Journey immersive timeline dengan growing line + stagger reveal.
- ✅ Command Palette (Ctrl/Cmd + K).
- ✅ Notifications drawer (persisten).
- ✅ Autosave dengan status indicator.
- ✅ Reduced-motion respect.
- ✅ Mobile-first (semua page tested di 390px).
- ✅ Rule-based insights aktif (SQL stale, savings up/down, learning support,
  BPJS due soon, portfolio progress).
- ✅ Seed data lengkap: 15 goals, savings ladder 10→100 jt, 8 career milestones,
  8 skills, 6 bulan cashflow, 4 reminders (BPJS/sedekah/service/review),
  5 commitments, 3 notifikasi, 3 activity entries, 1 previous review.
- ✅ CSV export transaksi.
- ✅ Supabase JS client wired (dormant tanpa env).
- ✅ SQL migration + RLS policies + `.env.example` + README lengkap.

## Backlog / Next actions

- P1: Live sync ke Supabase (currently only localStorage) — wire mutations
  ke Supabase secara best-effort saat env tersedia.
- P1: Storage bukti (evidence file upload untuk certificate/portfolio).
- P1: Global search (Ctrl+K sudah nav + quick-add; belum full-text search).
- P2: AI assistant opsional via Qwen (rangkum review, breakdown goal).
- P2: Import LinkedIn / GitHub CSV.
- P2: Mood/energy check-in (bila desain tidak medis).
- P2: Reading tracker, exercise tracker.
- P3: Multi-user + Supabase Auth aktif.

## Files map

- `/app/frontend/src/app/page.js` — Dashboard
- `/app/frontend/src/app/goals/page.js` — Goals + detail drawer
- `/app/frontend/src/app/career/page.js` — Career Journey + Portfolio + Skills gap
- `/app/frontend/src/app/finance/page.js` — Finance + Charts + Budgets + Reminders
- `/app/frontend/src/app/skills/page.js` — Skill garden + detail drawer
- `/app/frontend/src/app/review/page.js` — Weekly Review + history
- `/app/frontend/src/lib/store.js` — Zustand store (single source of truth)
- `/app/frontend/src/lib/seed.js` — Seed data Rafli
- `/app/frontend/src/lib/insights.js` — Rule-based insights + computed metrics
- `/app/frontend/src/lib/format.js` — IDR + tanggal Indonesia
- `/app/frontend/src/lib/supabase/{client,server}.js` — Supabase clients
- `/app/supabase/migrations/0001_initial_schema.sql` — Postgres schema + RLS

## Kredensial

Tidak ada login screen di Phase 1. Semua data local via seed user id
`rafli-akbar`.
