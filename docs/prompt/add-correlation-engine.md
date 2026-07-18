# Cross-Signal Correlation Engine — Task Brief

**Origin:** brainstorm session, 2026-07-18 ("what makes this app powerful" discussion). This is the highest-priority idea from that session because Life Score and Retrospective/Chapter View (separate, later briefs) both consume its output. Ship this first, alone.

**Type of pass:** new rule-based selectors in `insights.js`. No AI/LLM involvement, no nav change, no new page — this produces dashboard insight-card *candidates* only.

---

## Goal

Right now Career, Finance, Goals, Skills, and Life Compass compute signals independently. Nothing compares them against each other over the same time window. This feature adds a small number of named, concrete cross-module comparisons that surface patterns like "when ritual stress is high, discretionary spending tends to rise the same week" — grounded entirely in data already collected, no new user input required.

## Architecture decision: concrete named checks, not a generic correlation framework

Do **not** build a generic "correlate any two time series" engine. That's speculative abstraction the codebase doesn't need yet (Ponytail: avoid premature generic helpers). Instead, ship exactly three purpose-built pure functions in `insights.js`:

1. `stressSpendingCorrelation(reviews, transactions)`
2. `energyGoalVelocityCorrelation(reviews, goals)`
3. `milestoneEnergyCorrelation(careerMilestones, reviews)`

If a fourth or fifth comparison is wanted later and real duplication shows up across these three, that's the point to extract a shared helper — not before.

## Data thresholds (honesty over false confidence)

Follow the same pattern `momentumIndex()` already established: if there isn't enough data to support a claim, return an explicit "not enough data" result rather than a weak/fabricated one.

Suggested minimums (confirm against actual data volume in the store before finalizing):
- `stressSpendingCorrelation`: needs ≥3 weeks with both `stressLevel` filled on a review and transaction data present in the same window.
- `energyGoalVelocityCorrelation`: needs ≥3 weeks of reviews with `energyLevel` filled and at least one goal with progress changes in that window.
- `milestoneEnergyCorrelation`: needs at least 1 career milestone added within the observed review window, plus ≥2 reviews before and after it.

Each function returns either `null` (not enough data — render nothing) or a result object, not a partial/low-confidence guess.

## Output shape

Keep the three functions' return shape consistent so the dashboard can render them uniformly:

```js
{
  type: "stressSpending" | "energyGoalVelocity" | "milestoneEnergy",
  headline: string,       // short, human-readable, in the app's existing insight-card voice
  weeksObserved: number,
  supportingDataPoints: number
}
```

## Where this plugs in

Append these three functions' results (when non-null) into the existing `buildInsights()` candidate pool on the Dashboard. Do **not** change how `buildInsights()` selects/rotates which cards display — that's a separate concern already covered in the UI/UX Elevation Brief's "Rotating Insight Surfacing" idea, and should stay a later, separate pass.

## Privacy

None of the three functions read raw reflection/letter/weekly-review body text — only already-structured numeric/categorical fields (`energyLevel`, `stressLevel`, transaction `amount`/`category`, goal `progress`, career milestone `month`/`year`). This isn't part of the `/ai` context builder at all (it's a dashboard-only, rule-based feature), but confirm during implementation that no function accidentally imports anything from `reflections` or `reviews`' free-text fields.

## Explicit non-goals (do not build in this pass)

- **Life Score / composite index** — separate future brief, consumes this feature's output.
- **Retrospective / Chapter View** — separate future brief, consumes this feature's output.
- **Rotating insight selection/display logic** — covered by the UI/UX Elevation Brief, not here.
- **Any new page or nav entry** — this is additive to the existing Dashboard only.
- **Any change to `momentumIndex()`, `careerReadiness()`, `reviewInsights()`** — reuse their outputs as raw material where relevant, don't modify them.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- All three functions are pure (no I/O), individually reasoned through with a few sample data scenarios (enough data / not enough data / edge case at exactly the threshold).
- Dashboard correctly shows 0–3 additional candidate cards depending on data availability; existing `buildInsights()` cards unaffected.
- Playwright: no console errors, mobile (390px) and dark mode checked, cards render with the empty-data case (nothing crashes when a fresh/low-data account has none of the three).
- `docs/features/correlation-engine.md` created following the existing feature-doc pattern (see `life-compass.md` / `career-journey.md` for format), and `PRD.md`/`SRS.md` updated to reflect the new selectors — per CLAUDE.md's "docs are part of done."