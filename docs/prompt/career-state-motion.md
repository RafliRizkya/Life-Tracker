# Career Trail State-Change Motion — Task Brief

**Origin:** Wave 3 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`). Independent of the other Wave 3 files (Finance, Life Compass, `/ai`) — no shared dependency, can be run in any order relative to them.

**Type of pass:** presentation-layer only, on top of the already-shipped dual-track redesign (`docs/features/career-journey.md`). No schema changes, no new fields — `track`, `endMonth`/`endYear`/`ongoing`, `location`, `highlights[]` are all already in place and correct.

---

## Goal

Apply Linear's subtle, state-tied motion (not decorative animation) to `CareerTrail.jsx` and `TrailCard.jsx` — motion that's earned by a real state change (new milestone added, drawer opened/closed), rather than motion for its own sake.

## What already exists (reuse, don't rebuild)

- `frontend/src/components/career/CareerTrail.jsx` — two-lane layout ("Jejak Profesional" / "Milestone & Pencapaian"), each its own vertical timeline with connector line + dot.
- `frontend/src/components/career/TrailCard.jsx` — shows title/org/location/date range/duration/description preview/skill chips.
- `frontend/src/lib/trailLayout.js`'s `contributionToSize()` — still used for connector-dot sizing; keep as-is.
- Milestone detail drawer (opens on card click).

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new colors, no new fonts.
- No changes to the `track`/date-range/duration data model or `formatMonthRange()`/`formatDuration()` logic — motion/visual only.
- `prefers-reduced-motion` respected.
- Mobile (390px, lanes stack vertically per the existing responsive behavior) must keep working identically.

## Concrete direction

1. **New milestone entrance**: when a milestone is added, its card and connector-dot should animate in with a clear but restrained motion (e.g. a short scale/fade combined with the dot "landing" on the line) — signals "something changed here" without being showy.
2. **Drawer open/close**: the detail drawer transition should feel connected to the card that triggered it (e.g. a shared-origin transition or a directional slide keyed to the card's position) rather than a generic modal fade — this is the core "state-tied" motion principle from Linear's reference pattern.
3. **Connector-dot sizing motion**: since `contributionToSize()` already drives dot size, consider whether a dot's size change (if it can change post-creation, e.g. after an edit) should animate rather than snap — only if this is a real, reachable state in the UI; skip if dot size is effectively static after creation.
4. **Restraint check**: this should read as "the app responded to what I did," not "the app has animations." If in doubt, cut the animation rather than add it — Linear's own UI is notably sparing with motion, that's the reference, not a general animation pass.

## Explicit non-goals (do not touch in this pass)

- **Any other module** — Finance, Life Compass, `/ai`, Skills are separate briefs.
- **Career data model, seed data, or the 13 real resume-derived entries** — already correct, don't touch.
- **`careerReadiness()` or `buildCareer()`** — explicitly untouched by the original redesign and should stay that way here too.
- **Certification date corrections** — separate, known open item (estimated dates from the resume gap), not part of this visual pass.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots: desktop, 390px (lanes stacked), dark mode — before/after for a new-milestone-add flow and a drawer open/close flow.
- `prefers-reduced-motion` fallback verified — new milestones should still appear correctly (just without animation) when reduced motion is on.
- Playwright pass, no console errors, existing dual-lane render and mobile stacking behavior unaffected.
