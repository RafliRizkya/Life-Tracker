# Goal Evidence Requirement ("Goal Butuh Bukti") — Task Brief

**Origin:** "Maksa growth" trio from the original brainstorm session (2026-07-18). Independent of the other two trio files (Ritual Follow-Up, Friction Visibility) — no shared dependency, can be run in any order relative to them. This one is the most complex of the three and needs the most upfront schema verification — read the whole "Before implementing" section first.

**Type of pass:** new validation/status logic, additive. Not presentation-layer — this changes what a goal's status is allowed to claim, not just how it looks.

---

## Problem being addressed

A goal can currently be marked "on track" purely by manual status toggle, with no requirement that anything actually happened. For goals linked to Skill or Career growth specifically, this creates room for self-deception that the app should gently close — consistent with the honesty principle already established in `momentumIndex()` ("belum cukup data" rather than a fabricated confident state).

## Before implementing: verify the actual schema first

This brief was written from the outside — from what's documented in `docs/features/*.md` and the Correlation Engine completion log, not from a direct read of `frontend/src/lib/store.js`. Two things must be confirmed against the real code before writing any logic:

1. **Does a goal record currently have any field indicating what it's linked to** (a related skill, a related career track, a related finance category)? The brainstorm assumed such linkage is meaningful; if no linkage field exists yet, this feature needs a small additive field first (e.g. `linkedTo: { type: "skill" | "career" | "finance" | null, id: string | null }`), following the same additive/nullable pattern already used for `reviews` (`moodWord`, `energyLevel` etc. were added additively, matching pre-existing seed data with no breakage).
2. **Confirm the shape of goal milestones/`achievedAt`** — the Correlation Engine's `energyGoalVelocityCorrelation` reads `achievedAt` timestamps on goal milestones because `goal.progress` itself has no history. This feature should reuse that same existing signal as one evidence source, not invent a parallel tracking mechanism.

Do not guess field names — this is exactly what CLAUDE.md's AI Workflow step 3 ("search existing implementation") is for, and it matters more here than in any of the other recent briefs.

## Goal

Goals linked to Skill or Career cannot be shown as progressing ("on track") without a corresponding evidence signal appearing within a defined recent window. Goals with no clear linkage are **exempt** — this rule only applies where a real evidence source exists; it should never invent evidence requirements out of nothing.

## Concrete direction (adjust field names once verified per above)

1. **Define evidence per link type**:
   - Linked to **Skill**: a Skill-module entry (level-up, logged practice, or equivalent — whatever the Skills module already records) within the window.
   - Linked to **Career**: a new Career milestone added within the window.
   - Linked to **Finance** (e.g. a budgeting-discipline goal): consistent Finance data within the window (exact definition — e.g. staying under a budget threshold — needs a decision during implementation planning, not guessed here).
   - **No link / general goal**: exempt from this rule entirely. Do not force evidence requirements on goals that don't have a natural evidence source — this is the most important scope boundary in this brief.
2. **New pure function**, e.g. `goalEvidenceStatus(goal, { skillEntries, careerMilestones, transactions })` in `insights.js` — returns whether the goal's claimed status is currently evidenced, or should visually/logically downgrade to a distinct state (not the same as user-set "on track" — something like `unproven`, naming TBD during implementation).
3. **First pass reads existing data only** — this must not require the user to manually log new "evidence" entries. It should compute evidence status entirely from data already being created in Skill/Career/Finance for other reasons. If that's insufficient to make the feature useful for a given link type, that's a signal to scope that link type out of this pass rather than invent new logging UI.
4. **Honesty pattern**: if there isn't enough data to evaluate (e.g. goal was just linked yesterday, window hasn't elapsed), don't downgrade the goal — same "not enough data ≠ negative signal" principle as `momentumIndex()`.

## Design guardrails

- Additive schema changes only (nullable, backward-compatible with existing goals) — same pattern used throughout this project (`reviews`, career milestones).
- Do not change how goal status is manually set by the user — this adds a computed overlay/flag, it doesn't remove manual control.
- Do not touch `careerReadiness()`, `reviewInsights()`, or the Correlation Engine's three functions — reuse their underlying data, don't modify them.

## Explicit non-goals (do not build in this pass)

- **Evidence-logging UI** — out of scope unless investigation during implementation shows no existing data can serve as evidence for a given link type (see point 3 above).
- **Visual treatment of the "unproven" state** — functional/data pass only; a visual polish brief can follow later, same pattern as Correlation Engine → Dashboard Insight Card Treatment.
- **Skill Evidence Levels** (the separate brainstorm idea blocking the Skills UI wave) — related in spirit but a distinct feature with its own scope; don't merge the two.
- **Retroactive evaluation of goals completed before this feature ships** — apply going forward only, don't rewrite history.

## Definition of Done

- Schema verification step documented (what was actually found in `store.js`, and what if anything had to be added).
- `goalEvidenceStatus()` is pure, tested against a few fixture scenarios (evidenced / not enough time elapsed / genuinely unproven / no-link exempt case).
- Existing goal list/detail views unaffected for goals with no linkage.
- Playwright pass, no console errors.
- `docs/features/goal-evidence.md` created (new — this is a new feature, unlike the presentation-only briefs); `PRD.md`/`SRS.md` updated per CLAUDE.md's "docs are part of done."
