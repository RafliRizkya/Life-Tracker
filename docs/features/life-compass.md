# Life Compass (merged Reflection + Weekly Review)

**Status: Built and live, 2026-07-18.** Replaces the separate `/reflection` and `/review` modules with one `/compass` module. Both old routes now client-redirect to `/compass`. Source prompt: `docs/prompt/merge-weekly-reflection.md`.

## What shipped

One nav entry ("Life Compass"), five tabs on `/compass`:

- **Ritual Mingguan** (new, default tab) — the weekly synthesis: mood word, energy/stress (1–5), an editable rule-based "Hero's Journey" draft paragraph, a Momentum vs Burnout indicator, a "Butterfly Effect" card linking your most-reflected-on goal to its live progress %, highlights/blockers/finance/career-progress textareas, and 1–3 next-week focus items. Replaces the old standalone Weekly Review form.
- **Berbenah** — Quick/Deep reflection compose (unchanged from the old Reflection module).
- **Timeline** — reflection history + detail drawer (unchanged).
- **Wins & Gratitude** — unchanged.
- **Surat untuk Diri** — letters to future self, unchanged.

## Architecture decision: two entities, one UI, not one merged record

Reflection entries (`reflections`) and the weekly ritual (`reviews`) stayed as **separate Zustand arrays** — they're different cadences (ad-hoc journaling vs. one-per-week synthesis) and merging them into a single record type would have meant rewriting the entire Reflection CRUD/timeline/template system for no real benefit. The "merge" is at the module/nav/UI level: one route, one nav entry, reflections feed into the ritual's Butterfly Effect and Hero's Journey draft, but the underlying data model stayed additive.

## Schema changes (`frontend/src/lib/store.js`, `addReview`)

`reviews` records gained: `moodWord`, `energyLevel` (1–5), `stressLevel` (1–5), `isPrivate: true` (default, matching Reflection — previously Weekly Review had no privacy concept at all). All additive/nullable — pre-existing seed review renders fine without them.

## New pure functions (`frontend/src/lib/insights.js`)

- `reviewInsights(reviews)` — aggregated-only view (30-day count, avg energy/stress, last ritual date). The privacy-safe shape consumed by the AI context builder.
- `momentumIndex(reviews, commitments)` — momentum-vs-burnout signal from the last 2–3 rituals' energy/stress trend + current open-commitment load. Needs ≥2 rituals with energy/stress filled in, otherwise returns an honest "belum cukup data" state — no fabricated confidence.
- `weeklyNarrativeDraft({...})` — the "Hero's Journey" opening paragraph. **Rule-based, not LLM-generated** — same pattern as the dashboard's `buildInsights()` pattern cards, assembled from wins/reflections/commitments counts. Deliberately not a new AI-generation surface; see CLAUDE.md's "AI" section.

## Privacy fix (found during this work, not a pre-existing known issue)

`buildReview()` in `frontend/src/lib/ai/contextBuilder.js` was sending raw `highlights`/`blockers`/`finance`/`careerProgress` text into the AI assistant's context, unfiltered — Weekly Review had no `isPrivate` field, so the network-layer `stripPrivateContent()` string-match (which looks for `"isPrivate":true`) couldn't catch it. Fixed by routing it through `reviewInsights()` instead, matching how `buildReflection()` already worked. Detail: `docs/features/ai-assistant.md`.

## Nav change (explicit approval given, overriding CLAUDE.md's default "don't change nav structure" rule)

Sidebar, CommandPalette, TopBar title map, and the dashboard CTA link all collapsed `/reflection` + `/review` → one `/compass` ("Life Compass", Compass icon). `/reflection` and `/review` are now thin client components that `router.replace("/compass")`.

## Verified

Production build clean, Playwright smoke test across all 5 tabs (ritual submit + history render, compose, timeline, wins, letters), `/reflection` and `/review` redirects, mobile (390px) and dark mode.
