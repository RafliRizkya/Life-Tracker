# Finance: Flat Weekly Budget + Dana Darurat/Tabungan Funds

**Status: Live** — shipped 2026-07-19, two back-to-back requests in the same session.

## Part 1 — Weekly budget, no category dimension

**Request**: "setiap transaksi pemasukan/pengeluaran wajib masuk ke batas mingguan... batas mingguan bisa di-setting oleh saya, bukan ditentukan oleh budget kategori seperti makan/minuman/bensin — itu hapus saja."

This directly replaced the category-based budget system shipped earlier the same day (per-category monthly limit, auto-prorated across weeks with an optional per-week override — see the superseded description in git history / `docs/PROJECT_MEMORY.md`'s prior entry). That system required opting a category into budgeting before its transactions were even visible in the weekly view; the new one has none of that:

- **Schema** (`budgets`, `supabase`-synced): `{id, userId, month, week, limit}` — no `category` field at all. One row per (month, week).
- **`budgetWeeklyBreakdown()`** (`insights.js`): every expense transaction in a week's date range counts toward `spent`, unconditionally — no per-category opt-in. Income in that range is summed separately as `income` and shown for context, but **never counted against the limit** — confirmed with the user directly (`AskUserQuestion`) that a "budget" should cap spending, not money coming in.
- **UI**: `WeeklyLimitEditor` on each week row — click the amount to type a limit, blank/0 clears it back to "atur limit" (unset). No more nested category accordion level, no "Tambah budget baru" form.
- **Store actions**: `setWeeklyBudget(month, week, limit)`, `removeWeeklyBudget(id)` replaced `upsertBudget`/`removeBudget`/`setWeeklyBudgetOverride`/`clearWeeklyBudgetOverride`.

The AI Financial Planner's per-category advice (`docs/features/ai-action-plan-and-financial-planner.md`) lost its "Terapkan" apply button as a direct consequence — there's no per-category budget entity left to apply a suggestion into. The advice itself (category + suggested amount + reason) is unchanged, just informational now.

## Part 2 — Dana Darurat + Tabungan as first-class Finance funds

**Request, same session, immediately after Part 1**: track Dana Darurat and Tabungan separately from regular spending, each with its own user-settable target; Tabungan additionally gets Rp10-juta-step milestones; the Goals module's "Tabungan bertahap Rp10jt→Rp100jt" goal should look up this Finance-side tracking instead of maintaining its own numbers.

### Design

- **New category**: `emergency_fund` ("Dana Darurat") added to `TX_CATEGORIES.expense`, alongside the pre-existing `saving` ("Transfer tabungan").
- **`NON_SPENDING_CATEGORIES = ["saving", "emergency_fund"]`** (`seed.js`) — money moved into your own savings isn't consumption. Excluded from `monthlyTotals()`'s expense sum, `spendingByCategory()`, and `budgetWeeklyBreakdown()`'s weekly `spent` — confirmed directly with the user this should apply everywhere "pengeluaran" is shown, not just the weekly budget.
- **`financeTargets`** — new root state object, not a per-row entity: `{ emergencyFund: {target, baseline}, savings: {target, baseline} }`. `baseline` is whatever was already saved before the app started tracking transactions; `target` is user-set via a click-to-edit field on each fund's KPI card.
- **`fundCurrent(fund, transactions, categoryKey)`**: `baseline + sum(matching-category expense transactions)`. Same pattern the goal-savings-ladder already used (`linkedGoalCurrent`), pulled out as a shared primitive since it's now needed for two independent funds plus the goal lookup.
- **`fundMilestones(target)`**: auto-generates every Rp10-juta step up to target (`10jt, 20jt, 30jt, ..., target`) — matches the request's own phrasing ("10 juta, 20 juta, 30 juta, dst") and replaces the old goal's hand-authored 6-entry milestone array (which wasn't evenly stepped near the end). Derived, not stored.
- **UI**: two `FundCard`s on `/finance`, between the scorecards and the charts — current/target, progress bar, click-to-edit target (`TargetEditor`); Tabungan's card additionally renders the milestone dot ladder.

### Goals side: `goal-savings-ladder` now looks up Finance

`savingsProgress(goals, transactions, financeTargets)` gained a third parameter. For the `goal-savings-ladder` goal specifically, current/target/milestones all come from `financeTargets.savings` via `fundCurrent`/`fundMilestones` — the goal's own `metric` object is kept only so `goalKind()` still classifies it quantitative; its numbers are never read directly anymore. This threads through every `savingsProgress()` call site: dashboard, Goals page, Finance page, `WeeklyRitual.jsx` (Life Compass), and the AI context builder.

**Removed as a direct consequence**: `toggleSavingsMilestone` (store action) and its checkbox UI in the Goal detail drawer. Milestones are now fully derived from `current >= target` on every render — there's no consistent place left for a manual "mark as achieved" override to live without immediately being overwritten. The drawer shows milestones read-only with a note: "Otomatis dari Tabungan di Finance — atur targetnya di sana."

## Files touched

| File | Change |
|---|---|
| `frontend/src/lib/seed.js` | `emergency_fund` category, `NON_SPENDING_CATEGORIES`, `financeTargets` in `buildInitialState()`, rewrote `seedBudgets` to the new schema, updated `goal-savings-ladder` (dropped `milestones`, `linkedCategory`) |
| `frontend/src/lib/insights.js` | `monthlyTotals`/`spendingByCategory`/`budgetWeeklyBreakdown` exclude `NON_SPENDING_CATEGORIES`; new `fundCurrent()`, `fundMilestones()`; `savingsProgress()` takes `financeTargets` |
| `frontend/src/lib/store.js` | Replaced budget actions (`setWeeklyBudget`/`removeWeeklyBudget`), added `setFinanceTarget`, removed `toggleSavingsMilestone`, `financeTargets` in `persistableSlice()` + hydrate backfill (both local and Supabase-remote paths) |
| `frontend/src/app/finance/page.js` | Rewrote budget accordion (2-level, no category), new `FundCard`/`TargetEditor`/`WeeklyLimitEditor` components, `FinancialPlanCard` category advice no longer has an apply button |
| `frontend/src/app/goals/page.js` | Card + drawer read `savings.current`/`savings.target` for the savings-ladder goal instead of its own metric; milestone list is read-only |
| `frontend/src/app/page.js`, `frontend/src/components/compass/WeeklyRitual.jsx`, `frontend/src/lib/ai/contextBuilder.js` | Thread `financeTargets` into `savingsProgress()` calls |

## Verified

Playwright, real interactions against the live dev server (which is itself Supabase-synced from earlier the same session — confirmed cross-device sync still working as a side effect: a second test run picked up state from the first via `/api/sync`):
- All 4 week rows visible directly (no nested toggle), "atur limit" placeholder when unset, setting Rp615.000 displays and persists.
- Dana Darurat: target editable (10jt → 15jt), starts at Rp0, a `emergency_fund`-category Rp1jt transaction correctly brought it to Rp1.0jt.
- Tabungan: started at Rp8.4jt (baseline), a `saving`-category Rp2jt transaction correctly brought it to Rp10.4jt; 10 milestones rendered (10jt–100jt), first one shown achieved.
- **Confirmed exclusion end-to-end**: Expense scorecard stayed at Rp0 after both the saving and emergency_fund transactions, then correctly jumped to Rp50rb after a normal `food` transaction — proves the exclusion is real, not just cosmetic on the fund cards.
- Goals page: savings-ladder goal card and drawer show the same Rp10.4jt/Rp100jt/10% as the Finance card, 10 milestones in the drawer, "Otomatis dari Tabungan di Finance" note present.
- Chart re-render sanity check: a screenshot right after a theme toggle looked like the cashflow chart was blank — turned out to be Recharts' mount animation caught mid-transition by a too-fast screenshot, not a real bug (confirmed via direct DOM inspection: 12 bars present with real varying heights, 50–153px).
- No console/page errors through any of the above.
