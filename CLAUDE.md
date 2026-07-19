# Claude Code Project Rules — Rafli Life Tracker

Personal life operating system untuk Rafli Akbar (single user, Phase 1 released): Career, Finance, Goals, Skills, Reflection, Weekly Review dalam satu app yang tenang, hangat, editorial — bukan spreadsheet perusahaan.

---

# Source of Truth

Selalu baca dokumen berikut sebelum implementasi fitur.

- docs/PRD.md
- docs/SRS.md

PRD adalah sumber requirement.

SRS adalah sumber spesifikasi teknis.

Jika terjadi konflik:

SRS > PRD > asumsi.

Jangan pernah mengasumsikan requirement.

---

# AI Workflow (WAJIB)

Untuk setiap task ikuti urutan berikut.

1. Understand the project.
2. Read PRD/SRS yang relevan.
3. Search existing implementation.
4. Explain implementation plan.
5. Wait before making architectural changes.
6. Implement minimal changes.
7. Test.
8. Review.
9. Summarize changes.

Jangan langsung coding.

---

# MCP & Skills Usage

## Context7

Always use Context7 before:

- Next.js
- React
- Tailwind
- Zustand
- Framer Motion
- Recharts
- date-fns
- Supabase
- FastAPI
- Python libraries
- external npm packages

Never rely on memory when Context7 documentation exists.

Prefer official documentation.

Never invent APIs.

---

## Ponytail

Always use Ponytail principles.

Prefer:

- simple code
- readable code
- minimal abstraction
- composition
- reusable utilities

Avoid:

- unnecessary patterns
- premature optimization
- deep inheritance
- excessive generic helpers
- over engineering

Keep diffs as small as possible.

Never rewrite working code without strong justification.

---

## Motion MCP

Motion is available.

Use Motion when:

- planning implementation
- creating roadmap
- breaking large features
- estimating implementation time
- prioritizing work
- managing backlog
- scheduling future work

When a feature is estimated longer than 2 hours:

Offer creating Motion tasks.

Break into subtasks.

Estimate duration.

When feature completed:

Offer marking Motion task as completed.

Never use Motion for trivial fixes.

---

## Playwright

Always run Playwright after frontend changes.

Verify:

- no runtime errors
- responsive layout
- navigation
- keyboard navigation
- accessibility
- console errors
- layout regressions

Take screenshots when useful.

---

## Frontend Design Skill

Use frontend-design skill when:

- new pages
- dashboards
- layouts
- cards
- typography
- spacing
- responsive improvements
- accessibility improvements

Maintain editorial feeling.

Never create corporate dashboard appearance.

---

## Webapp Testing Skill

When implementing features:

Verify:

- loading state
- empty state
- error state
- success state

Test realistic user flows.

---

# Product Context

## Modules

- Dashboard
- Goals
- Career
- Finance
- Skills
- Life Compass (`/compass` — merged Reflection + Weekly Review; see `docs/features/life-compass.md`)

Do not change navigation structure without explicit approval. (Reflection and Weekly Review were merged into Life Compass on 2026-07-18 with explicit sign-off — `/reflection` and `/review` now redirect to `/compass`. Treat the module list above as current; don't merge/split further without asking again.)

Within Life Compass specifically: its "Ritual Mingguan" and "Berbenah" tabs were further merged into one tab, "Berbenah", on 2026-07-19 with explicit sign-off (same rationale — both were a weekly check-in / write-a-reflection flow, just two separate tabs). It now holds an internal mode toggle ("Tulis Refleksi" / "Ritual Mingguan") instead of two top-level tabs. Life Compass's top-level tab set is now: Berbenah, Timeline, Wins & Gratitude, Surat untuk Diri. Same rule applies — don't restructure Life Compass's tabs further without asking again.

---

## Language

UI must use Bahasa Indonesia.

Only use English when common:

Dashboard

Goals

Career

Quick Add

Settings

---

## Currency

Always format IDR using

Intl.NumberFormat("id-ID")

Never hardcode formatting.

---

## Persistence

Current persistence:

localStorage, synced to Supabase for cross-device access (whole-state JSONB blob, one row per user — not the per-table relational schema in `supabase/migrations/0001_initial_schema.sql`, which needs real auth to be reachable from the browser and isn't wired up). See `docs/features/supabase-sync.md` for the full design and why.

Offline-first. Local read/render always happens first; Supabase reconciles in the background and never blocks first paint.

No authentication. Single hardcoded user (`rafli-akbar`).

Schema already contains userId.

Never remove userId.

Server-side sync only: all Supabase reads/writes go through `frontend/src/app/api/sync` using the service-role key. Never call Supabase directly from a `"use client"` file for this data — the anon-key client cannot reach these tables anyway (RLS denies it with no auth session).

---

## AI

Dashboard/rule-based insights (unchanged): rule-based only, via `buildInsights()` and the other pure selectors in `insights.js` — this includes Life Compass's Momentum vs Burnout indicator (`momentumIndex()`) and the "Hero's Journey" weekly narrative draft (`weeklyNarrativeDraft()`). Never replace these with LLM calls.

**Chat assistant (built, ahead of the original roadmap):** `/ai` — a free-tier-only OpenRouter streaming Q&A assistant over Finance/Goals/Career/Skills/Life Compass data. Read-only, no write capability. Full status, architecture, and privacy verification: `docs/features/ai-assistant.md`.

**AI action-plan generator (Goals & Skills)** and **AI financial planner (Finance)**: two additional AI surfaces, both **suggest-only — the AI itself never writes to the store.** Each returns a suggestion (step list / budget plan) that the UI shows for review; saving only happens when the user clicks an explicit "apply" action, which then runs a normal existing store action (`addCommitment`, `onUpdate({ plan })`) — the exact same write path a manual add already uses. This preserves the chat assistant's "AI never writes" boundary while still letting these two surfaces produce actionable output. (The financial planner's per-category advice lost its "apply" button on 2026-07-19 when budgets became category-less — see Persistence/Finance notes below; the advice itself is still shown, just informational now.) Full detail: `docs/features/ai-action-plan-and-financial-planner.md`.

**AI reflection response** (`/api/ai/reflection-response`, 2026-07-19): after submitting a reflection or weekly ritual entry in Life Compass → Berbenah, the AI reads that single just-submitted entry's raw text and returns one short empathetic response (2-4 sentences). **This is a deliberate, narrow, user-confirmed exception** to the "raw reflection text never reaches an LLM" rule below — confirmed directly via `AskUserQuestion` (2026-07-19) that real empathy needs the actual words, not just mood/stress numbers. Exception is scoped tightly:
- Only the one entry the client sends in that one request — never history, never other reflections, never routed through `contextBuilder.js` (the chat assistant / action-plan / financial-planner context pipeline is completely untouched by this route).
- Nothing is logged or persisted server-side beyond generating the response.
- Suggest-only in spirit too: it's a response to read, not a write — nothing is saved back to the reflection/review record.
- Full detail: `docs/features/finance-and-compass-rework.md`.

- Never call a paid OpenRouter model — free-tier only, no exceptions.
- `frontend/src/lib/ai/openrouter.js` and the OpenRouter/model env vars are server-only — never import into a `"use client"` file, never expose to the browser.
- Raw reflection/letter/weekly-review body text must never be assembled into outbound LLM context for the chat assistant, action-plan generator, or financial planner, regardless of intent — only aggregated `reflectionInsights()`/`reviewInsights()` output. This is verified at the network layer, not just by code review — see `docs/features/ai-assistant.md` before changing `contextBuilder.js`. The one narrow, explicit exception is `/api/ai/reflection-response` above — don't extend raw-text access to any other route without asking again.
- Any new AI-generation surface must stay suggest-only unless explicitly asked to write directly — this was a deliberate decision (see `docs/PROJECT_MEMORY.md` 2026-07-19 entry), not a default to silently change.

---

## Mobile First

Primary design width:

390px

Support:

390px → 2560px

Sidebar:

Hidden below lg.

Sticky above lg.

---

## Privacy

Reflection default:

isPrivate = true

Never expose private reflections.

---

# Design System

## Colors

Light

Paper

#f5f2ea

Card

#fffdf8

Ink

#1d2b24

Muted

#718078

Forest

#315d48

Dark

Night

#0f1613

Night Card

#161f1a

Ink

#e6ebe1

Muted

#8a9a90

Accent

#a8c845

Shared

Lime

#d5eb7e

Terra

#eb9b63

Never introduce new primary colors.

---

## Typography

Heading

Playfair Display

Reflection

Instrument Serif Italic

Interface

DM Sans

Data

DM Mono

---

## Motion

Use Framer Motion.

Animations:

- stagger reveal
- fade
- growing line
- ring animation

Always respect

prefers-reduced-motion.

---

## Accessibility

WCAG AA.

Minimum contrast:

4.5

Touch target:

44x44

Keyboard:

Tab

Shift Tab

Enter

Esc

Focus-visible required.

---

# Architecture

Stack

- Next.js 14
- React 18
- Tailwind 3
- Zustand
- Framer Motion
- Recharts
- Lucide
- cmdk
- date-fns
- nanoid
- FastAPI
- Supabase ready

---

## State Management

Single source of truth:

Zustand.

No duplicated state.

Selectors must stay pure.

---

## Autosave

Debounce:

800ms

Reflection:

350ms

Never remove autosave.

---

## Validation

Follow docs/SRS.md.

Never duplicate validation rules.

---

## Cross Module Features

Must never break:

- Command Palette
- Quick Add
- Notifications
- Theme Toggle
- Autosave
- CSV Export

---

# Coding Standards

TypeScript strict.

Prefer:

small components.

Maximum:

300 lines/component

Extract reusable logic.

Avoid duplicated code.

Avoid unnecessary dependencies.

Prefer server components where appropriate.

Keep client components minimal.

---

# Git

Never commit automatically.

Never push automatically.

Generate commit message.

Explain breaking changes.

---

# Backend

Prefer Pythonic solutions.

RESTful APIs.

Backward compatible.

Never break existing endpoints.

---

# Database

Never drop tables.

Never delete user data.

Generate safe migrations.

Enable RLS.

Owner-only access.

Secrets only on server.

Never expose keys.

---

# Paused Features

## WhatsApp → Finance quick-add

Status: paused, Phase 2. Code, migrations, and webhook are fully built and tested — not missing implementation, just waiting on a dedicated WhatsApp Business number (Rafli won't use his personal number).

Do not resume implementation work on this without being asked. Do not treat the commented-out `WHATSAPP_*` vars in `frontend/.env.local` as needing to be filled in.

Full status, what's implemented, what's missing, exact resume steps: `docs/features/whatsapp-integration.md`.

---

# Definition of Done

Before finishing:

✓ Type check passes

✓ Lint passes

✓ Playwright passes

✓ Responsive verified

✓ Accessibility verified

✓ No console errors

✓ No duplicated logic

✓ Existing features still work

✓ Summary provided

---

## Documentation Workflow

Additional project knowledge is stored under `.claude`.

- `.claude/context` contains long-term project knowledge and philosophy.
- `.claude/prompts` contains implementation strategies for recurring engineering tasks.
- `.claude/checklists` contains verification checklists.

For every task beyond a trivial change:

1. Determine which documents under `.claude` are relevant.
2. Read only those relevant documents (do not read everything).
3. Explain the implementation plan before coding.
4. Implement with minimal, maintainable changes.
5. Validate the result using the relevant checklist.
6. Summarize the changes and generate a commit message (do not commit automatically).