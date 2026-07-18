# Life Compass Reading & Composing Treatment — Task Brief

**Origin:** Wave 3 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`). Independent of the other Wave 3 files (Finance, Career, `/ai`) — no shared dependency, can be run in any order relative to them.

**Type of pass:** presentation-layer only, on top of the already-shipped Life Compass merge (`docs/features/life-compass.md`). No changes to the `reviews`/`reflections` data model, no changes to `reviewInsights()`, `momentumIndex()`, or `weeklyNarrativeDraft()` — those are correct and out of scope.

**Scope note:** this brief covers only what currently exists in the shipped Life Compass. It deliberately does **not** include a treatment for the "ritual nagih ke masa lalu" (follow-up prompting on unresolved focus items) idea from the original brainstorm — that's a data/logic feature that hasn't been spec'd or built yet, so there's nothing real yet to apply a visual pattern to. Revisit once that feature has its own brief.

---

## Goal

Two distinct treatments for two distinct interaction modes already present in this module:

1. **Notion-style inline, composed-document feel** for the one place text is actively edited by the user: the Ritual Mingguan's editable "Hero's Journey" draft paragraph.
2. **Mintlify-style long-form reading rhythm** for the two prose-heavy, read-mostly views: Timeline (reflection history) and Surat untuk Diri (letters to future self).

## What already exists (reuse, don't rebuild)

- Ritual Mingguan tab: mood word, energy/stress (1–5), the editable rule-based Hero's Journey draft paragraph (from `weeklyNarrativeDraft()`), Momentum vs Burnout indicator, Butterfly Effect card.
- Timeline tab: reflection history + detail drawer.
- Surat untuk Diri tab: letters to future self.
- Instrument Serif Italic already reserved for reflection content in the locked typography system — these views are exactly where it should be doing the most work.

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new colors, no new fonts — Instrument Serif Italic and existing palette carry this, don't introduce anything new.
- Privacy behavior is completely untouched — this brief does not go near `contextBuilder.js`, `reviewInsights()`, or anything privacy-filter-related. Presentation only.
- `prefers-reduced-motion` respected for any transition (e.g. drawer opens in Timeline).
- Autosave debounce timing (350ms for reflection, per `CLAUDE.md`) must not be affected by any layout change.

## Concrete direction

1. **Hero's Journey draft — inline composed feel**: the editable draft paragraph should read as a living, composed document being lightly annotated by the user, not a plain textarea sitting in a form. Look at how the surrounding rule-based content (mood, energy/stress, Butterfly Effect) frames it, and make the edit affordance feel like light editing on prose, not form-filling.
2. **Timeline — reading rhythm**: apply generous line-height and clear entry-to-entry separation suited to scanning past reflections, closer to a docs/article reading experience than a dashboard list. The detail drawer, when opened, should read as "the same document, zoomed in" rather than a disconnected modal.
3. **Surat untuk Diri — reading rhythm**: same long-form treatment as Timeline, but lean further into the letter format — this is the most personal, least dashboard-like content in the app; the layout should reinforce that it's meant to be read slowly, not scanned.
4. **Consistency check**: Berbenah (reflection compose) and Wins & Gratitude tabs are explicitly unchanged in this pass — if the new treatment on Ritual Mingguan/Timeline/Surat starts to make those two feel visually inconsistent by contrast, note it, but don't fix it here (separate scope).

## Explicit non-goals (do not touch in this pass)

- **Any other module** — Finance, Career, `/ai`, Skills are separate briefs.
- **"Ritual nagih ke masa lalu" follow-up prompting** — not built yet, no visual pattern to apply.
- **Berbenah (reflection compose) or Wins & Gratitude tabs** — unchanged in this pass.
- **`reviewInsights()`, `momentumIndex()`, `weeklyNarrativeDraft()`, or the privacy filter** — correct as-is, do not touch.
- **Autosave timing or logic** — must remain exactly as specified in `CLAUDE.md`.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots: desktop, 390px, dark mode — Ritual Mingguan (draft paragraph, editing state), Timeline (list + drawer open), Surat untuk Diri (letter view).
- Confirm autosave still fires at the same 350ms debounce with no visible regression.
- `prefers-reduced-motion` fallback verified for any new transition.
- Playwright pass across all 5 Life Compass tabs (per the original merge's smoke test pattern), no console errors.
