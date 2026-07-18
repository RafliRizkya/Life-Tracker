# Dashboard Insight Card Treatment — Task Brief

**Origin:** Wave 1 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`), scoped down to Dashboard only. Directly follows the Correlation Engine (`docs/prompt/add-correlation-engine.md`, shipped 2026-07-18) — this brief exists to give that feature's output the visual treatment it was designed for.

**Type of pass:** presentation-layer only. No new selectors, no new data logic — `buildInsights()`'s candidate pool (including the three correlation cards) already exists and is correct. This is about how those candidates render.

---

## Goal

The UI/UX Elevation Brief named Posthog's "chart + inline narrative annotation" pattern as the exact language for these cards, and Apple/Framer's spacing and motion restraint for the surrounding rhythm. Apply that now that real correlation output exists to design against, instead of a hypothetical shape.

## What already exists (per the Correlation Engine completion log — reuse, don't rebuild)

- `buildInsights()` candidate pool, now optionally receiving `reviews` and returning up to 3 additional correlation-based candidates alongside existing ones.
- Each correlation result has: `headline`, `weeksObserved`, `supportingDataPoints`, and a `tone` field (direction of the finding — e.g. warning vs. positive) added during implementation beyond the original brief's output shape.
- Existing Dashboard stagger-reveal entrance animation (Framer Motion), already in place.

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new primary colors — `tone` differentiation must use the existing palette (e.g. Terra for warning-leaning cards, Lime/Forest for positive-leaning), not new hues.
- No new nav, no new page — Dashboard only.
- `prefers-reduced-motion` respected: any motion added here needs a static fallback, not just a slower version.
- Reuse the existing Dashboard card component structure — extend it, don't fork a parallel one.

## Concrete direction

1. **Posthog-style annotation**: each insight card (correlation-derived ones especially) presents the number/finding alongside its "why" in the same visual unit — not a bare stat, not a separate tooltip. The narrative sentence is the primary content; the supporting numbers (`weeksObserved`, `supportingDataPoints`) are secondary/muted detail, not co-equal with the headline.
2. **Tone as a calm visual cue, not an alert**: use `tone` to drive a subtle accent (e.g. left-border tint or small icon) within the existing palette — matching the Sentry "calm severity" reference from the broader brief. This must not read as an error/notification-badge treatment; it's informational framing, in keeping with the app's non-punitive tone.
3. **Motion refinement**: extend the existing stagger-reveal with spring easing (Framer Motion's spring config, not linear/ease-out) for entrance; keep exit/update transitions subtle — Apple's restraint reference, not Framer-the-product's more dramatic scroll effects (that's a bigger swing, out of scope here).
4. **Backward compatibility**: existing (non-correlation) insight cards in the pool likely don't have a `tone` field — confirm they render with a sensible neutral/default style rather than breaking or looking unstyled.

## Explicit non-goals (do not touch in this pass)

- **Command Palette, Quick Add** — that's the next brief (Wave 2), separate scope.
- **Any other module's visual treatment** (Finance, Career, Skills, Life Compass, `/ai`) — later waves, not this one.
- **`buildInsights()` selection/rotation logic** — the "Rotating Insight Surfacing" idea from the original brainstorm is still a separate, not-yet-briefed concept. Don't fold it in here even if it feels adjacent.
- **Any change to the three correlation selector functions themselves** — they're done and out of scope; this brief only touches rendering.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots (desktop, 390px, dark mode) for both states already established in the Correlation Engine's own testing: zero correlation cards (fresh/low-data account) and all three present (existing test fixture).
- Confirm pre-existing insight cards without a `tone` field still render correctly — no regression.
- `prefers-reduced-motion` fallback verified, not assumed.
- Playwright pass, no console errors.
- Light doc note: append a short "visual treatment" addendum to `docs/features/correlation-engine.md` — no need for a new standalone feature doc for a presentation-only change.