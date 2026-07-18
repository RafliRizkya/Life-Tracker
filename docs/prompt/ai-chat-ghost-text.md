# AI Chat Read-Only Reinforcement — Task Brief

**Origin:** Wave 3 of the UI/UX Elevation Brief (`docs/prompt/ui-ux-elevation.md`). Independent of the other Wave 3 files (Finance, Career, Life Compass) — no shared dependency, can be run in any order relative to them.

**Type of pass:** presentation-layer only, on top of the already-shipped AI Chat Assistant (`docs/features/ai-assistant.md`). No changes to `contextBuilder.js`, `promptBuilder.js`, `openrouter.js`, or the read-only constraint itself — this brief only touches how the existing UI communicates that constraint visually.

---

## Goal

Apply Cursor's ghost-text / non-intrusive inline-suggestion visual language to `/ai` — reinforcing, through styling alone, that this assistant is read-only and assistive rather than directive. The assistant already cannot add/edit/delete anything; this brief makes that fact legible at a glance, not just true in the backend.

## What already exists (reuse, don't rebuild)

- `frontend/src/app/ai/page.js` + `frontend/src/components/ai/*.jsx` — chat thread, markdown-rendered messages, citation badges, input, starter prompts.
- Citation badge showing which modules were used (Finance/Goals/Career/Skills/Life Compass) per response.
- Streaming response rendering.

## Design guardrails (unchanged from CLAUDE.md and the UI/UX Elevation Brief)

- No new colors, no new fonts.
- Must not imply write capability that doesn't exist — no button, icon, or affordance should look like an "apply" or "accept into app" action, since none exists (`CLAUDE.md`: read-only, no write capability).
- `prefers-reduced-motion` respected for any streaming-text animation adjustment.
- Citation badges remain clearly legible — don't de-emphasize them in service of a "lighter" visual language; they're the trust mechanism for this feature and stay prominent.

## Concrete direction

1. **Assistant message styling**: lean toward Cursor's dimmed, suggestion-toned treatment for assistant responses — visually distinct from what a "confirmed/committed" piece of content would look like elsewhere in the app (e.g. a saved reflection or a committed transaction). The point is a visual register that says "this is being suggested/discussed," not "this has been done."
2. **No false affordances**: audit the existing UI for anything that could visually read as actionable-on-the-data (e.g. a numbers-heavy response formatted like an editable table) and soften it — markdown-rendered numbers should look like reported facts, not editable fields.
3. **Streaming text feel**: if the streaming animation currently feels like a generic typing-indicator, consider a subtler, ghost-text-style reveal (soft fade-in per token/chunk rather than a hard typewriter blink) — small detail, but consistent with the "suggestion, not command" register.
4. **Starter prompts and empty state**: ensure these also read as invitations to ask, not as buttons that "do" something — align their visual weight with the rest of this restrained treatment.

## Explicit non-goals (do not touch in this pass)

- **Any other module** — Finance, Career, Life Compass, Skills are separate briefs.
- **`contextBuilder.js`, `promptBuilder.js`, `openrouter.js`, or any privacy/context logic** — untouched, out of scope.
- **The read-only constraint itself, or any new write capability** — explicitly not in scope, ever, per `CLAUDE.md`.
- **Citation badge logic (which modules get cited)** — only its visual prominence may be reviewed, not the underlying logic.
- **Free-tier model routing, rate limiting, or fallback chain** — server-side, unrelated to this brief.

## Definition of Done (on top of CLAUDE.md's standing checklist)

- Screenshots: desktop, 390px, dark mode — empty state, mid-stream response, completed response with citation badge visible.
- Confirm citation badges remain clearly legible and prominent after the styling pass.
- `prefers-reduced-motion` fallback verified for the streaming text treatment.
- Playwright pass: nav entry, starter prompts, streaming renders, markdown renders, citation badge shows correctly, no console errors — re-verifying the original feature's smoke test, not just the new styling.
