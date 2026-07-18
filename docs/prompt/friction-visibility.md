# Friction Visibility (Honest Engagement Gap Signal) — Task Brief

**Origin:** "Maksa growth" trio from the original brainstorm session (2026-07-18). Independent of the other two trio files (Goal Evidence, Ritual Follow-Up) — no shared dependency, can be run in any order relative to them. Simplest and lowest-risk of the three — reuses an existing mechanism almost entirely.

**Type of pass:** one new selector, plugged into the existing `buildInsights()` candidate pool — the same integration pattern the Correlation Engine already established. No new UI component needed if the Dashboard's existing insight-card rendering (with its Wave 1 treatment) already handles arbitrary candidates generically.

---

## Problem being addressed

If Rafli goes 2+ weeks without a ritual or reflection entry, nothing in the app currently says so. The goal is not to nag or gamify (no streaks, no red alert badges) — it's to make the gap honestly visible, in the same non-judgmental register `momentumIndex()` already uses for "belum cukup data."

## Goal

A new Dashboard insight candidate that surfaces when it's been 2+ weeks since the last ritual and/or reflection entry — worded plainly, not punitively, and easy to ignore if Rafli genuinely doesn't want to act on it right now.

## Concrete direction

1. **New pure function**, e.g. `engagementGapSignal(reviews, reflections)` in `insights.js`. Computes weeks-since-last-entry for both `reviews` and `reflections` independently (they can be out of sync — e.g. reflections might be active while ritual is lapsed, or vice versa).
2. **Threshold**: fires only at 2+ weeks gap (per the brainstorm's original framing) — below that, returns `null`, consistent with every other honesty-pattern function in this codebase (`momentumIndex()`, the three Correlation Engine functions).
3. **Output shape**, consistent with the Correlation Engine's existing candidate shape so the Dashboard can render it the same way:
   ```js
   {
     type: "engagementGap",
     headline: string,        // plain, non-judgmental phrasing
     weeksSinceLastRitual: number | null,
     weeksSinceLastReflection: number | null,
     tone: "gentle-notice"    // reuse the `tone` field pattern from the Correlation Engine, not a new concept
   }
   ```
4. **Integration**: append to the `buildInsights()` pool exactly like the three Correlation Engine candidates — no new rendering logic needed if Wave 1's Dashboard treatment already generalizes across candidates with a `tone` field. Confirm this during implementation rather than assuming; if the existing card rendering is hardcoded to the three known correlation types, that's a small gap to close here, not a reason to build a parallel display path.

## Design guardrails

- No streak mechanics, no gamification, no red/alert-styled treatment — the phrasing and eventual visual tone (a later, separate polish pass) must stay in the "calm, honest" register the rest of the app uses, explicitly rejecting the "punitive notification" pattern the original brainstorm called out.
- No push notifications, emails, or any out-of-app reminder — this only appears when Rafli opens the Dashboard himself.
- Do not modify `momentumIndex()` or the Correlation Engine functions — this is a new, adjacent signal.

## Explicit non-goals (do not build in this pass)

- **Visual/motion treatment** — if the existing Wave 1 Dashboard card rendering doesn't already cover this candidate's presentation adequately, note the gap; a dedicated polish pass isn't required to ship the underlying signal correctly.
- **Any nudge to specific modules beyond Ritual/Reflection** (e.g. this doesn't extend to "haven't logged a transaction in 2 weeks" — that's a different, unrequested scope; stay with what the brainstorm specified).
- **Notifications outside the app.**

## Definition of Done

- `engagementGapSignal()` is pure, tested against fixtures (active user / exactly 2 weeks / long gap / one signal lapsed but not the other).
- Confirm it correctly returns `null` for an actively-engaged account and doesn't false-positive.
- Playwright pass — dashboard renders correctly both with and without this candidate present, no console errors.
- `docs/features/correlation-engine.md` or a small new addendum documents this addition (it's adjacent to that feature's pattern even though conceptually separate) — use judgment on whether it warrants folding into that doc or a new short one.
