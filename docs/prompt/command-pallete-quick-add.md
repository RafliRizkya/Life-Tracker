# Command Palette + Quick Add Treatment — Task Brief

**Origin:** Wave 2 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`). Follows Wave 1 (`docs/prompt/dashboard-insight-cards.md`, shipped). Scoped to these two cross-cutting entry points only — chosen second because they're foundational (used from every module) but isolated (don't depend on Wave 1's output the way Wave 1 depended on the Correlation Engine's).

**Type of pass:** presentation-layer only. No new commands, no new Quick Add fields or logic — both already function correctly. This is about speed-of-feel and visual treatment.

---

## Goal

Apply Linear's clean list density + subtle state-change motion, and Raycast's glassy floating-panel treatment + keyboard-first speed, to the existing Command Palette (cmdk) and Quick Add modal. These are the two components used most often, from every module — the highest-frequency-touch surfaces in the app — so polish here is felt everywhere, not just in one module.

## What already exists (reuse, don't rebuild)

- Command Palette built on `cmdk`, already listed under "Cross Module Features" in `CLAUDE.md` as something that must never break.
- Quick Add modal, existing keyboard shortcut entry point.
- Framer Motion already in the stack for any transition work.
- Dark mode and light mode variants of the existing design tokens (Paper/Card/Ink/Night/Night Card etc.).

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new primary colors, no new fonts — Raycast's "glassy" look must be achieved via blur/opacity/elevation on existing surface colors (`Card` / `Night Card`), not a new palette.
- `prefers-reduced-motion` respected: keyboard-first speed must not be sacrificed for decorative animation — if motion is reduced, the palette/modal should still open instantly, just without the flourish.
- 44×44 touch targets and WCAG AA contrast maintained on every list row and button, including inside the blurred panel treatment (verify contrast doesn't degrade under a blur/opacity layer).
- Must not regress existing keyboard navigation (Tab / Shift-Tab / Enter / Esc) — this is called out explicitly in `CLAUDE.md`'s Accessibility section and is a "must never break" cross-module feature.

## Concrete direction

1. **Raycast-style panel treatment**: floating panel with subtle background blur/elevation (backdrop-filter or equivalent), rather than a flat modal overlay — applies to both Command Palette and Quick Add. Keep it restrained; this is a tool, not a marketing surface.
2. **Linear-style list density and state-change motion**: tighten row spacing in the Command Palette's result list for scannability; add a subtle, fast transition when a result is selected/highlighted (not a decorative animation, a responsiveness cue — should feel instant, not "animated for its own sake").
3. **Keyboard-first speed is the priority metric**: any animation added must not introduce perceptible input lag between keypress and visual response. If a choice has to be made between a nicer transition and lower latency, latency wins — this is the one place in the app where speed is the design language, not warmth.
4. **Dark mode**: verify the blur/glass treatment reads correctly against `Night`/`Night Card` — Raycast's reference aesthetic leans dark-mode-first, so confirm light mode doesn't feel like an afterthought.

## Explicit non-goals (do not touch in this pass)

- **Dashboard insight cards** — Wave 1, already shipped, don't touch.
- **Any other module's visual treatment** (Finance, Career, Skills, Life Compass, `/ai`) — later waves.
- **New commands, new Quick Add fields, or any functional change** — this is styling/motion only. If a functional gap is noticed during implementation, note it, don't fix it inline.
- **Global animation system changes** — scope motion changes to these two components; don't refactor shared animation utilities as a side effect (Ponytail: smallest correct diff).

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots: desktop, 390px, dark mode, for both Command Palette (open + result highlighted) and Quick Add (open + focused input state).
- Keyboard navigation re-verified explicitly: Tab, Shift-Tab, Enter, Esc all still work exactly as before in both components.
- `prefers-reduced-motion` fallback verified.
- Contrast check on any text/icon rendered over the new blur/elevation treatment, both themes.
- Playwright pass, no console errors, no regression to the two "must never break" cross-module features.