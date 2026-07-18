# Goal Evidence Requirement ("Goal Butuh Bukti")

**Status: Built and live, 2026-07-18.** Source brief: `docs/prompt/goal-evidence-requirement.md` ("maksa growth" trio). A goal linked to a real evidence source can no longer claim "on track" purely by manual toggle — recent activity in its own life area must exist.

## Schema verification (the brief's required first step — what was actually found)

The brief, written from outside the code, assumed a `linkedTo` field might need to be added. **It doesn't**: goals already carry `area` (`career` / `finance` / `skills` / `business` / `growth`), which is the natural linkage — so no schema change was needed at all (Ponytail: reuse beats adding a redundant field). Also confirmed: goal milestones' `achievedAt` timestamps exist (savings-ladder pattern) and are reused as a finance evidence source, exactly as the brief hoped via `energyGoalVelocityCorrelation`'s precedent.

## The rule

`goalEvidenceStatus(goal, { skills, careerMilestones, transactions })` in `insights.js` — pure, reads only existing data, no new logging UI:

| `goal.area` | Evidence within the window |
|---|---|
| `skills` | Any skill practiced (`lastPracticedAt`) |
| `career` | Any career milestone added (`createdAt`) |
| `finance` | Any transaction recorded, **or** a goal milestone `achievedAt` |
| `growth` / `business` / other | **Exempt** — no natural evidence source, no invented requirement |

**Window: 14 days** (2 weeks — matches the engagement-gap threshold; a decision made here, adjustable in one constant `EVIDENCE_WINDOW_MS`). The finance definition ("any transaction recorded") is deliberately engagement-shaped, not threshold-shaped — "staying under budget" as evidence was considered and deferred; tracking-at-all is the honest v1 signal that existing data supports.

Return states, honesty-pattern compliant:
- `evidenced` — activity found in window (with `lastEvidenceAt`)
- `unproven` — linked area, in-progress, window elapsed, no activity
- `pending` — goal younger than the window (not enough time ≠ negative signal)
- `exempt` — no linkage, or goal not `in_progress` (planned claims nothing; completed goals are history, not retroactively judged)

## Where it surfaces (minimal functional integration, visual polish deferred)

`frontend/src/app/goals/page.js`:
- A muted "belum ada bukti" chip on unproven goal cards (with a title tooltip explaining the 14-day window). Exempt/pending/evidenced goals look exactly as before.
- The "on track" summary stat now requires progress ≥ 40 **and** not-unproven — the "logically downgrade what status may claim" half of the brief. Manual status setting is untouched; this is a computed overlay.

## Verified

Playwright fixtures: seed account shows zero unproven chips (seed data is genuinely active); a stale skills goal (no practice in window) gets the chip; a growth goal is exempt; a goal created yesterday is pending (no chip); on-track count excludes the unproven goal (2 of 3 in the fixture). No console errors, production build clean.
