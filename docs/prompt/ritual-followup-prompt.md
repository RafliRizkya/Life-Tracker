# Ritual Follow-Up Prompt ("Nagih ke Masa Lalu") — Task Brief

**Origin:** "Maksa growth" trio from the original brainstorm session (2026-07-18). Independent of the other two trio files (Goal Evidence, Friction Visibility) — no shared dependency, can be run in any order relative to them.

**Type of pass:** small additive schema field + new selector + minimal functional UI. Not a visual polish pass — a working feature first; presentation refinement can follow later the same way Correlation Engine → Dashboard Insight Card Treatment did.

---

## Problem being addressed

Ritual Mingguan already captures "1–3 next-week focus items" (per `docs/features/life-compass.md`), but nothing checks whether those items were ever followed up on. A commitment made in one ritual currently has no consequence if ignored in the next. This feature closes that loop.

## Goal

When Rafli opens a new Ritual Mingguan entry, if any focus item from the past 1–3 rituals hasn't been marked resolved, surface it as a prompt before or alongside the new entry — "3 minggu lalu kamu bilang mau X, gimana progressnya?" — giving him the chance to mark it resolved, carry it forward, or consciously drop it.

## Before implementing: verify the actual schema first

Confirm whether focus items on a `review` record currently have any resolved/status field. If not, this needs a small additive field (e.g. `focusItems: [{ text: string, resolved: boolean }]` instead of a plain string array, or an equivalent adjacent structure) — additive and backward-compatible with existing seed reviews, same pattern as the `moodWord`/`energyLevel`/`stressLevel` fields added during the Life Compass merge.

## Concrete direction

1. **New selector**, e.g. `unresolvedFocusItems(reviews, windowWeeks = 3)` in `insights.js` — pure function, returns focus items from the last N reviews not marked resolved, oldest first.
2. **Minimal UI hook in Ritual Mingguan**: when starting a new ritual entry, if `unresolvedFocusItems()` returns anything, show them with a simple resolve/carry-forward/dismiss action per item. Keep this functional and plain for now — no special visual treatment required in this pass.
3. **Marking resolved**: resolving an old item is a lightweight action (toggle), not a re-opening of the old ritual entry itself — old reviews stay otherwise immutable.
4. **Carry forward**: if Rafli chooses to carry an item forward, it becomes (or stays) a focus item on the *new* ritual being created, rather than just being marked resolved on the old one.

## Design guardrails

- Additive schema change only, backward-compatible with all existing seed/past reviews (a review with the old plain-string focus-item format must not break).
- Do not change the 350ms reflection autosave debounce or 800ms general debounce.
- Do not touch `reviewInsights()`, `momentumIndex()`, or `weeklyNarrativeDraft()` — this is a new, separate signal, not a modification of those.
- This does not go through `contextBuilder.js` / the AI assistant in this pass — no need to consider AI context implications here since it's a Life Compass UI-only feature; if a future pass wants this reflected in `/ai` context, that's separate work requiring its own privacy check.

## Explicit non-goals (do not build in this pass)

- **Visual/motion polish** for how this prompt appears — functional pass only, same "ship it working first" pattern as elsewhere in this project.
- **Automatic reminders or notifications outside the app** (push, email, etc.) — this only surfaces within the Ritual Mingguan flow itself.
- **Retroactively marking old, pre-feature focus items as resolved/unresolved** — only apply going forward from whenever this ships; don't assume intent for historical data.
- **Any change to the Butterfly Effect card or Momentum vs Burnout indicator** — separate, unaffected.

## Definition of Done

- Schema verification step documented (what was found, what if anything was added, confirmed backward-compatible with existing seed reviews).
- `unresolvedFocusItems()` is pure, tested against fixtures (no unresolved items / items exactly at the 3-week boundary / items already resolved).
- New ritual entry flow correctly shows the prompt only when applicable; resolve/carry-forward/dismiss all function correctly.
- Playwright pass across the Ritual Mingguan tab, no console errors, existing ritual submission flow unaffected.
- `docs/features/life-compass.md` updated with a short addendum describing this addition (not a new standalone doc, since it's an extension of an already-documented feature).
