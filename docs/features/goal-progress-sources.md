# Goal Progress Sources ("Atur target & sumber progress")

**Status: Built and live, 2026-07-20.** Prompted by a direct question: opening the Goals page showed "Meningkatkan English profesional" at 35% with no transactions or skill practice logged — the number had no visible origin. Root cause: every non-trivial goal in `seedGoals` carried a hand-typed placeholder (`progress: 35`, `metric.current: 8_400_000`, etc.) left over from the app's original seed data, shown with no indication it was a placeholder rather than tracked progress.

## The fix has two parts

1. **Zero every placeholder.** No goal shows progress unless it's backed by something real — a transaction, a skill's level, or a number the user explicitly typed.
2. **Give every goal a `progressSource`** — an explicit, user-editable answer to "where does this number come from," so the next goal never has the same mystery.

## `progressSource` shape

```js
goal.progressSource = { type: "manual" }                              // default
goal.progressSource = { type: "finance", category: "saving" }         // any TX_CATEGORIES.expense key
goal.progressSource = { type: "skill", skillId: "sk-8" }
```

- **`manual`** — the user hand-edits either `metric.current` (if the goal has a numeric target) or the bare `progress` percentage (if it doesn't). This is the only mode that ever accepts direct percentage input.
- **`finance`** — `metric.current` is *derived*, never stored: `fundCurrent(transactions, category)`, the same pure category-sum helper Dana Darurat/Tabungan already used (reused, not duplicated — Ponytail). The user sets `metric.target`/`unit` in the same panel; `current` is whatever the category's transactions actually sum to.
- **`skill`** — ignores `metric` entirely. Progress = `skill.level / skill.target`, straight from the Skills module. A goal in this mode shows a "Sumber progress" card with the linked skill's name and level instead of a Metric card.

`insights.js`:
- `goalCurrentValue(goal, transactions)` — resolves `metric.current`, either the finance-derived sum or the hand-typed number.
- `goalProgressValue(goal, { skills, transactions })` — the shared resolver (manual / finance / skill / contributions / bare `progress`), used by both `computeGoalProgress()` and, now, `careerReadiness()`'s network/LinkedIn/job-search sub-goals (previously read `goal.progress` directly, so a goal linked to Finance or a Skill wouldn't have fed the Career Readiness composite — now it does).
- `computeGoalProgress(goal, ctx)` still short-circuits for the two goals that already had dedicated, always-on tracking before this feature existed: `goal-data-analyst` (the weighted `contributions` composite) and `goal-savings-ladder` (Finance's staged Tabungan milestones — effectively a hardcoded, richer version of `{type: "finance", category: "saving"}` with a milestone ladder on top). Both are exempt from the "Atur target & sumber progress" panel for the same reason: editing their source through the generic UI would fight the specialized tracking they already have.

## UI — `frontend/src/app/goals/page.js`

`GoalProgressEditor`, an inline toggle-to-form panel in `GoalDetail` (same interaction pattern as Finance's `ReminderRow`/`WeeklyLimitEditor` — no modal):
- Source select: Manual / Finance / Skill.
- Finance: category select (`TX_CATEGORIES.expense`, includes `saving`/`emergency_fund`) + target number + unit. No "current" field — it's computed.
- Skill: select from the user's actual `skills` list (shows `level/target` inline). Empty state tells the user to add a skill first if none exist.
- Manual: current+target number inputs if the goal already has a `metric`, otherwise a single 0–100 progress input.

`SkillSourceCard` mirrors the existing "Tersinkron otomatis dari transaksi kategori…" line for finance-linked goals, but for skill-linked ones.

`QuickAddModal`'s goal-creation flow lost its old `linkedCategory` picker (folded into this generic mechanism) — creating a goal now just asks Kualitatif/Kuantitatif + an optional starting number; source linking happens afterward via the goal's own "Atur target & sumber progress" panel. One picker, one place, instead of two half-features.

## Migration — fixing this for data that already exists

Seed changes alone don't fix a goal already sitting in the user's Supabase/localStorage state with `progress: 35` baked in. `store.js` adds a one-time backfill in both `hydrate()` paths (local and Supabase-reconciled):

```js
function migrateGoals(goals) {
  return (goals || []).map((g) => {
    if (g.progressSource) return g;
    return {
      ...g,
      progressSource: { type: "manual" },
      ...(g.metric ? { metric: { ...g.metric, current: 0 } } : {}),
      ...(typeof g.progress === "number" ? { progress: 0 } : {}),
    };
  });
}
```

`progressSource`'s presence is the migration marker — a goal is only ever touched once. After migration, `persist()` is called immediately so the corrected (zeroed) state pushes back to Supabase right away rather than waiting for the next unrelated edit.

## Files touched

| File | Change |
|---|---|
| `frontend/src/lib/insights.js` | `goalCurrentValue()` (replaces `linkedGoalCurrent`), new `goalProgressValue()`, `computeGoalProgress()` simplified to two special-cases + the shared resolver, `careerReadiness()` takes `transactions` and reads sub-goals through `goalProgressValue()` instead of raw `.progress` |
| `frontend/src/lib/seed.js` | Every fake `progress`/`metric.current` seed value zeroed; `progressSource: {type:"manual"}` added to every goal (`goal-savings-ladder` gets `{type:"finance", category:"saving"}` — it was already finance-derived, this just makes that explicit) |
| `frontend/src/lib/store.js` | `addGoal` defaults `progressSource`; `migrateGoals()` backfill wired into both hydrate paths |
| `frontend/src/app/goals/page.js` | `GoalProgressEditor`, `SkillSourceCard`, ctx now carries `skills`, metric/finance/skill display blocks |
| `frontend/src/components/QuickAddModal.jsx` | Removed the old `linkedCategory` picker from goal creation |
| `frontend/src/app/career/page.js`, `frontend/src/app/page.js`, `frontend/src/components/compass/WeeklyRitual.jsx`, `frontend/src/lib/ai/contextBuilder.js` | `careerReadiness()` calls updated to pass `transactions` |

## Verified

Playwright against the live dev server (real Supabase sync, no mocking):
- Fresh load: every previously-mysterious goal (English, Gaji 10jt, Upgrade HP, LinkedIn, Network, etc.) shows **0%**, not a placeholder number.
- Linked "Meningkatkan English profesional" to the seeded "English Profesional" skill (level 3/target 4) → goal correctly shows 75%, persists across reload.
- Manual quantitative edit: set "Gaji Rp10 juta" current to Rp4.000.000 → 40%, as expected against its Rp10.000.000 target.
- Finance-linked source: linked "Upgrade handphone dan laptop" to the `transport` category with a Rp1.000.000 target → correctly showed Rp180.000 (the real existing transport spend) → 18%, with the "Tersinkron otomatis…" line.
- Migration: injected an old-shape (`progressSource`-less) goal record directly into `localStorage`, reloaded — confirmed it gets zeroed and tagged, not left stale.
- Dashboard and Career pages load without errors after the `careerReadiness()` signature change.
- **Test-data hygiene note**: because this dev server points at the same Supabase project the live Vercel deployment reads from, the above interactive tests briefly wrote real records (the skill link, the manual edits) into production data. All three touched goals (`goal-english`, `goal-salary-10m`, `goal-device-upgrade`) were reset back to `{type: "manual"}` / zeroed via the same UI immediately after, and the fresh state was re-verified. Nothing user-visible was left behind, but future testing against this dev server should keep this in mind — there is no separate test Supabase project.
