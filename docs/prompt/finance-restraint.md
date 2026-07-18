# Finance Restraint Treatment — Task Brief

**Origin:** Wave 3 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`). Independent of the other Wave 3 files (Career, Life Compass, `/ai`) — no shared dependency, can be run in any order relative to them.

**Type of pass:** presentation-layer only. No new Finance logic, categories, or calculations — this is spacing/typography/rhythm only.

---

## Goal

Apply Stripe's restraint in data-dense views: numbers given room to breathe, precise spacing rhythm, calm hierarchy between primary figures and supporting detail — rather than a packed, spreadsheet-like grid.

## What already exists (reuse, don't rebuild)

- Finance page with transaction tables, budget breakdowns, and category charts (Recharts).
- `Intl.NumberFormat("id-ID")` IDR formatting — already standardized per `CLAUDE.md`, do not touch the formatting logic itself.
- DM Mono for data values, per the locked typography system.

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new colors, no new fonts — this is spacing/layout/hierarchy only.
- Currency formatting logic (`Intl.NumberFormat("id-ID")`) must not be touched or reimplemented.
- WCAG AA contrast and 44×44 touch targets maintained on every row, especially any edit/delete controls in the transaction table.
- `prefers-reduced-motion` respected for any transition added (e.g. row hover/expand states).

## Concrete direction

1. **Table row rhythm**: increase breathing room between transaction rows without needing more vertical scroll overall — tighten what's currently redundant (e.g. duplicate icon+label patterns) to make room, rather than just adding padding everywhere (Ponytail: don't just inflate, actually simplify first).
2. **Number hierarchy**: the primary amount in each row should read clearly heavier/larger than metadata (category, date, payment note) — confirm this hierarchy exists and strengthen it if it's currently flat.
3. **Budget breakdown restraint**: if progress bars or category breakdowns feel visually loud (heavy fills, saturated colors used decoratively rather than meaningfully), pull back — color should carry meaning (e.g. over-budget signal) not decoration.
4. **Chart-adjacent numbers**: where Recharts visualizations sit next to raw figures, ensure the two don't compete for attention — one should clearly lead (usually the number, chart as supporting context), consistent with the Posthog-style "narrative leads, chart supports" principle applied in Wave 1.

## Explicit non-goals (do not touch in this pass)

- **Any other module** — Career, Life Compass, `/ai`, Skills are separate briefs.
- **Finance calculation logic, category rules, or budget thresholds** — styling only.
- **Currency formatting implementation** — already standardized, don't touch.
- **New chart types or new Finance features** — out of scope.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots: desktop, 390px, dark mode, showing transaction table and budget breakdown before/after.
- Confirm currency values still render identically (same formatting, just better-spaced context around them).
- Contrast check on any updated hierarchy/color-as-meaning changes.
- Playwright pass, no console errors, existing Finance flows (add/edit/delete transaction) unaffected.
