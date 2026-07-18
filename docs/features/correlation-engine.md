# Cross-Signal Correlation Engine

**Status: Built and live, 2026-07-18.** Source brief: `docs/prompt/add-correlation-engine.md`. Rule-based only — no AI/LLM, no new page, no nav change. Produces dashboard insight-card candidates.

## What shipped

Three purpose-built pure functions in `frontend/src/lib/insights.js` — deliberately **not** a generic "correlate any two series" framework (per the brief's Ponytail call; extract a shared helper only when a 4th/5th check shows real duplication):

1. **`stressSpendingCorrelation(reviews, transactions)`** — compares average non-saving expense totals in high-stress ritual weeks (`stressLevel ≥ 4`) vs calmer weeks. Fires only when the contrast is ≥20% in either direction; the inverse ("saat stres tinggi kamu justru menahan pengeluaran") is surfaced as a positive card.
2. **`energyGoalVelocityCorrelation(reviews, goals)`** — "goal velocity" = goal milestone `achievedAt` events per ritual week, the **only timestamped goal-progress signal that exists** (`goal.progress` is a scalar with no history — a real limitation, noted so nobody expects per-week progress deltas). Fires when high-energy weeks (`energyLevel ≥ 4`) see >1.5× the achievement rate of other weeks.
3. **`milestoneEnergyCorrelation(careerMilestones, reviews)`** — average ritual energy before vs after a career milestone's `createdAt` (needs ≥2 rituals with energy on each side); surfaces the largest shift when |Δ| ≥ 0.75 points, both directions (a new role can also *drain* energy — that's a warning-toned card).

## Thresholds / honesty contract

Same pattern as `momentumIndex()`: every function returns **`null`** (render nothing) unless its data minimums are met — ≥3 usable weeks for (1) and (2), ≥4 weeks split 2+2 around a milestone for (3) — plus a contrast/effect-size floor so weak noise never becomes a card. No partial or low-confidence results.

## Output shape

```js
{ type, tone, headline, weeksObserved, supportingDataPoints }
```

One deliberate addition to the brief's spec: **`tone`** (`"positive" | "warning"`), consistent across all three. The dashboard's card rendering is tone-driven and direction (spending up vs down, energy up vs down) is only known inside each function — without `tone`, the adapter couldn't style the card correctly.

## Where it plugs in

Appended at the end of the existing `buildInsights()` candidate pool (`insights.js`), adapted to the standard card shape (`key: "corr-<type>"`, `title` = headline, uniform `body` citing weeksObserved + supportingDataPoints). `buildInsights()` gained an optional `reviews = []` param; the dashboard (`app/page.js`) now passes `reviews`. **Selection/rotation logic untouched** — cards land in the pool like any other; the hero shows `insights[0]`, the rest render under "Insight lanjutan" (existing behavior). Rotating surfacing is a separate future brief.

Note: the hero Insight card has fixed lime styling regardless of tone (pre-existing display behavior for `insights[0]`) — tone-based styling applies in the "Insight lanjutan" grid. Left as-is per the brief's "don't touch display logic."

## Privacy

All three read only structured numeric/date/category fields (`weekOf`, `stressLevel`, `energyLevel`, transaction `amount`/`category`/`date`/`type`, goal milestone `achievedAt`, career milestone `createdAt`/`title`). No free-text fields from `reviews` or `reflections` are read. Not connected to the `/ai` context builder at all.

## Verified

- Production build clean.
- Playwright, empty-data case: fresh seed state (no rituals with energy/stress) → dashboard renders, zero correlation cards, no console errors.
- Playwright, crafted-data case: injected localStorage state (4 ritual weeks, spending tracking stress 575k vs 95k, milestone achievements in high-energy weeks, career milestone mid-window with +2.5 energy shift) → all three cards render with correct computed numbers ("505% lebih besar" matches the fixture math exactly), no console errors.
- Mobile (390px) and dark mode screenshots checked.

## Visual treatment (added 2026-07-18, presentation-only pass)

Source brief: `docs/prompt/dashboard-insight-cards.md` (Wave 1 of the UI/UX Elevation Brief, Dashboard-only). No selector/data changes — rendering only:

- **Posthog-style annotation**: the card adapter in `buildInsights()` now emits a separate `meta` field (`"Pola dari N minggu ritual · M titik data"`) instead of baking numbers into `body`. Cards render headline (primary) → narrative body → muted mono meta line. Legacy cards have no `meta` and render nothing extra.
- **Calm severity**: "Insight lanjutan" cards moved from full tone-tinted backgrounds to neutral card backgrounds with a 3px left-border accent — `terracotta` for warning, `forest-500`/`lime` (dark) for positive, neutral line color as the no-tone fallback. Existing palette only.
- **Motion**: dashboard stagger-reveal switched from ease-out cubic to a gentle spring (`stiffness 230, damping 26`); the "Insight lanjutan" grid gained the same staggered entrance via `whileInView` (once). Reduced motion now honored two ways — the store's `settings.reducedMotion` flag **or** the OS `prefers-reduced-motion` via Framer's `useReducedMotion()` (the global CSS kill-switch doesn't cover JS-driven springs) — falling back to fully static variants, verified in Playwright for both paths.

## Adjacent signal: engagement gap (added 2026-07-18, "maksa growth" trio)

Source brief: `docs/prompt/friction-visibility.md`. Not a correlation, but the same candidate pattern, so documented here rather than a standalone doc. `engagementGapSignal(reviews, reflections)` in `insights.js` fires only when ritual and/or reflection has lapsed **2+ weeks** (independently tracked — one can lapse while the other is active). Null for actively-engaged accounts *and* for never-engaged ones (you can't lapse what you never started). Appends to `buildInsights()` with `tone: "gentle-notice"`, which deliberately falls through to the Wave 1 card renderer's neutral (non-warning) branch — calm notice, no streaks, no alerts, in-app only. `buildInsights()` gained an optional `reflections = []` param for this.

## Consumers (future, not built)

Life Score and Retrospective/Chapter View (separate briefs) are expected to consume these functions' outputs.
