# UI/UX Elevation — Task Brief

**Companion to:** the Correlation Engine / Life Score / Retrospective brainstorm from the 2026-07-18 planning session. That session covered *what data/insight features* to add next; this brief covers the *visual and interaction layer* — how the app should look and feel while those (and existing) features get used.

**Type of pass:** exploratory experimentation, not a rebrand. The app is already functional and on-brand. Goal is to push polish, motion, and information density further without regressing the "tenang, hangat, editorial" feel — and without touching anything CLAUDE.md has locked.

---

## Non-negotiable guardrails (from CLAUDE.md — do not relitigate)

- **Colors are locked**: Paper `#f5f2ea`, Card `#fffdf8`, Ink `#1d2b24`, Muted `#718078`, Forest `#315d48` (light); Night `#0f1613`, Night Card `#161f1a`, Ink `#e6ebe1`, Muted `#8a9a90`, Accent `#a8c845` (dark); shared Lime `#d5eb7e`, Terra `#eb9b63`. No new primary colors, ever.
- **Typography is locked**: Playfair Display (heading), Instrument Serif Italic (reflection), DM Sans (interface), DM Mono (data).
- **No nav-structure changes** without an explicit approval checkpoint (same pattern used for the Life Compass merge). None of the experiments below are expected to need one — flag immediately if one does turn out to.
- **WCAG AA, 44×44 touch targets, `prefers-reduced-motion` respected** — for every single new animation introduced here, not just the flagship ones.
- **AI insights stay rule-based.** Nothing in this brief introduces a new LLM-generation surface — this is a presentation-layer pass only.

Everything below is about **layout, motion, density, and interaction pattern** — never palette or font substitution. Where a reference product's whole visual identity is the tempting part (e.g. Spotify's color/type), only the *pattern*, not the *skin*, gets borrowed.

---

## Curated inspiration references

Addressing every entry from the uploaded catalog's `design_systems` list, sorted into three buckets.

### Directly actionable

**Apple** — Whitespace discipline and spring-physics micro-transitions (not skeuomorphism). Applies to: a general spacing/motion refinement pass across all modules — tighten what's cramped, loosen what's crowded, replace any linear easing with spring curves via Framer Motion.

**Claude** (Anthropic's own product) — Warm paper/ink tones and editorial serif accents. This one doesn't redirect the design — it validates the existing direction. Use as a confidence check when reviewing new components: "does this still feel like the same family as Claude.ai's calm reading surfaces," not as a new pattern to import.

**Cursor** — Ghost-text / non-intrusive inline-suggestion treatment. Applies to: `/ai` chat interface — reinforcing its read-only, assistive (not directive) posture visually, e.g. subtle dimmed styling for suggested-but-unconfirmed content, never a bold "accept" CTA that implies write access it doesn't have.

**Linear** — Command-palette speed, clean list density, subtle motion tied to state changes (not decorative animation). Applies to: Command Palette (cmdk), Quick Add, and any cross-module list view (Goals list, Career milestone list) that currently feels static on status change.

**Notion** — Inline, flexible block-editing feel; content that feels composed rather than form-filled. Applies to: Berbenah (reflection compose) and the Ritual Mingguan's editable "Hero's Journey" draft paragraph — these are the two places text already gets user-edited, and currently likely read as a fixed textarea rather than a living document.

**Stripe** — Restraint and precise spacing rhythm in data-dense views; numbers given room to breathe rather than packed into a grid. Applies to: Finance module (transaction tables, budget breakdowns) and any new Life Score / Correlation Engine breakdown view.

**Posthog** — Charts paired with inline narrative annotation, not raw charts alone ("this spike is because X"). Applies directly to: the Correlation Engine insight cards and Life Score breakdown from the prior brainstorm — this is the exact visual language for "here's the number, here's why," which is the whole point of those features.

**Sentry** — Calm severity-escalation pattern (issues get visually louder the longer they're unresolved, without ever feeling punitive). Applies directly to: the "Friction yang Kelihatan" concept from the prior brainstorm — stagnant goals, skipped rituals — same tone, not a notification-badge red-alert treatment.

**Raycast** — Glassy/blurred floating panels, keyboard-first modal speed, elegant dark-mode density. Applies to: Quick Add modal, Command Palette, and dark-mode pass generally — Raycast is arguably the single best reference for "fast tool that still feels premium."

**Framer** (the product, distinct from the Framer Motion library already in the stack) — Scroll-linked reveal, fluid page-to-page transitions. Applies to: Dashboard's existing stagger-reveal pattern (push it further) and transitions between module routes, which likely currently just hard-cut.

**Mintlify** — Long-form reading rhythm, generous line-height, clear sidebar/section hierarchy for text-heavy content. Applies to: Reflection Timeline (reading past entries) and Surat untuk Diri (letters to future self) — both are read-heavy, prose-first views that would benefit from a docs-reading rhythm more than a dashboard-card rhythm.

**Spotify** — narrow scope: only the *Wrapped format* (personal-year-in-review narrative), not Spotify's visual identity (too vibrant/bold for this app's tone). Applies directly to: the Retrospective/Chapter View concept from the prior brainstorm — Wrapped is the closest real-world precedent for "rule-based data made to feel like a story."

**Supabase** — Dark-mode density and monospace-forward data treatment. Applies to: reinforcing DM Mono's use for data values app-wide, and as a dark-mode density reference beyond what Raycast covers.

### Optional / lower priority (footnote only, revisit if a specific need surfaces)

- **Vercel** — deployment-dashboard minimalism; overlaps heavily with what Linear/Stripe already cover here, so not worth treating as a separate reference.
- **Figma** — canvas/precision interaction patterns; likely overkill for a personal tracker unless a future feature needs freeform/spatial layout (not currently planned).
- **Resend** — clean transactional-email templates; limited applicability to in-app UI, no current email-sending surface in this app to apply it to.

### Explicitly skip

- **Tesla, Nike, Shopify, Airbnb** — all lean on brand-marketing bravado (large hero imagery, bold commerce CTAs, photography-driven layouts). That visual language conflicts with the reflective, personal tone CLAUDE.md protects ("never create corporate dashboard appearance" cuts the other direction too — never create a marketing-site appearance either). Skip regardless of how well-executed each one is.
- **mosaic** — not a design system Claude has a confident, specific public reference for. Flagging rather than guessing — if this refers to something specific Rafli has in mind, worth naming it directly in a follow-up.

---

## Concrete experiments by module

- **Dashboard**: deeper Framer-style stagger/scroll reveal; Posthog-style annotated insight cards (ties to Correlation Engine); Apple-style spacing pass.
- **Career**: Linear-style state-change motion on the dual-track timeline when a milestone is added; keep dense list readability from Stripe.
- **Finance**: Stripe-style table/number spacing and restraint pass.
- **Skills**: Sentry-style calm escalation if/when the "level-up needs evidence" rule from the prior brainstorm ships — visually distinguish "claimed" vs "evidenced" levels without being punitive.
- **Life Compass**: Notion-style inline editing feel for the Hero's Journey draft; Mintlify-style reading rhythm for Timeline and Surat untuk Diri; Sentry-style pattern for the ritual "nagih ke masa lalu" follow-up prompt.
- **/ai**: Cursor-style ghost-text treatment reinforcing read-only posture.
- **Cross-cutting (Command Palette, Quick Add)**: Linear + Raycast combined — speed, density, glass panels, keyboard-first.
- **Retrospective/Chapter View (new feature, not yet built)**: Spotify Wrapped narrative format + Mintlify reading rhythm, once that feature itself is scoped.

---

## Nav-impact check

None of the experiments above are expected to add or restructure nav entries. If, during implementation, an experiment (e.g. making Life Score a standalone page rather than a dashboard widget) turns out to need one, that's a separate approval checkpoint per CLAUDE.md — flag it explicitly rather than folding it into this pass.

---

## Definition of done (in addition to CLAUDE.md's standing checklist)

- Before/after screenshots per experiment: desktop, 390px, dark mode.
- `prefers-reduced-motion` fallback confirmed for every new animation, not assumed.
- No new dependencies added unless justified in the implementation plan step (Ponytail principle — Framer Motion, Recharts, and existing libraries should cover all of the above).
- Existing Playwright smoke flows re-verified untouched.

---

## Note on the uploaded catalog

The uploaded `catalog` file's `scopes` block (`motion:sessions:read`, `motion:credits:purchase`, `motion:account:manage`, etc.) is internal OAuth-scope configuration for the Motion MCP video-generation tool — unrelated to UI/UX work, not used in this brief. Only the `design_systems` list informed the references above.
