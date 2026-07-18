# Career Journey — dual-track redesign

**Status: Built and live, 2026-07-18.** Source prompt: `docs/prompt/revamp-career-journey.md`.

## Problem being fixed

The old `/career` map rendered milestones as icon-only circles on a winding sine-wave path — title/date/org were hidden behind a click, and jobs were mixed with certifications/education in one undifferentiated timeline.

## What shipped

- **Dual-track layout**: `frontend/src/components/career/CareerTrail.jsx` splits milestones into two lanes by a new `track` field — "Jejak Profesional" (jobs, solid left-border-accent blocks) and "Milestone & Pencapaian" (education/certs, rounded glowing badges) — each its own simple vertical timeline (connector line + dot, no more sine-wave path math).
- **Text always visible**: `frontend/src/components/career/TrailCard.jsx` (replaces the old icon-only `TrailNode.jsx`) shows title, organization, location, date range + computed duration, a short description preview, and up to 4 skill chips directly on the card. Click still opens the detail drawer, now for full bullet-point highlights and editing — not for the basic facts.
- **Real seed data**: `seedCareerMilestones` in `frontend/src/lib/seed.js` replaced entirely — 13 real entries parsed from Rafli's resume (`Profile (6).pdf`, uploaded to project root) instead of 8 fictional placeholders. 6 jobs tracing the administration → data analytics pivot (PT PLN → Dialektiva Creative → Agate → PT Unirama Duta Niaga → LearnWithAndi → PT. Pipamas Primasejati), 2 education entries, 5 certifications.
  - **Certification dates were not in the resume** (no month/year listed) — they're estimated against the career timeline (e.g. Google Advanced Data Analytics ≈ mid-2025, aligned with the pivot into data roles) and are editable via the milestone detail drawer if wrong.

## Schema changes (`frontend/src/lib/store.js`, `addCareerMilestone`; `frontend/src/lib/seed.js`)

Additive fields on career milestones:
- `track: "experience" | "milestone"` — auto-derived from `type` (`experience` → `"experience"`, everything else → `"milestone"`) unless explicitly passed. This is what the dual-lane split reads.
- `endMonth`, `endYear` (nullable) + `ongoing` (boolean) — supports date *ranges*, not just a single point in time. `formatMonthRange()`/`formatDuration()` (new, `frontend/src/lib/format.js`) render `"Apr 2026 — Sekarang"` and compute duration (`"4 bulan"`) live from the range rather than storing a redundant string — validated against every "(X bulan)" duration LinkedIn reported in the resume, all matched exactly.
- `location` (string) and `highlights` (string[], full bullet points — separate from the existing short `description` used as the card preview).

`careerReadiness()` (`insights.js`) and `buildCareer()` (AI `contextBuilder.js`) were **not** changed — they already keyed off `type`/`status`/`month`/`year`, which are unaffected by the new fields.

## `frontend/src/lib/trailLayout.js` trimmed

Dropped `computeTrailPoints`/`buildTrailPath`/the sine-wave `FREQUENCY` constant — dead code once the layout moved from a wavy SVG path to straight per-lane connector lines. Kept only `contributionToSize()` (still used for connector-dot sizing).

## Verified

Production build clean, no console errors. Playwright-checked: desktop dual-lane render with real data, the milestone detail drawer's ongoing/end-date toggle, mobile (390px, lanes stack vertically), dark mode.

## State-tied motion (added 2026-07-18, presentation-only)

Source brief: `docs/prompt/career-state-motion.md` (Wave 3). Linear-style motion earned by state change, not decoration:

- **Initial page load lands still** — cards no longer fade in one-by-one on mount. Only milestones added *during the session* animate (spring scale/fade on the card + the connector dot "landing" with a one-shot expanding ring), tracked by a prev-ids ref in `CareerTrail.jsx` (same pattern the pre-redesign trail used for its glow).
- **Drawer state tie**: the card that opened the detail drawer keeps a 2px tone-colored ring while the drawer is open (`selectedId` prop), clearing on close — "the app responded to what I did," no new drawer motion added (the existing slide already reads fine; restraint per the brief).
- **Dot-sizing motion skipped** per the brief's own out-clause: the redesign fixed connector dots at 12px, so size never changes post-creation. Discrepancy noted: the brief says `contributionToSize()` is "still used for connector-dot sizing" — it actually became dead code in the dual-track redesign (kept, unused, per the brief's "keep as-is").
- Reduced motion (store flag + OS): new milestones appear instantly with no entrance, verified in Playwright.
