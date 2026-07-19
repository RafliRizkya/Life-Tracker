# Finance Corrections + Life Compass Rework

**Status: Live** — shipped 2026-07-20 (started 2026-07-19), from a 7-point brief covering bug fixes, logic corrections, and new features across Finance and Life Compass.

## 1. Tabungan/Dana Darurat as a Tipe, not just a category

Quick Add's transaction "Tipe" selector now has 4 options: Pemasukan, Pengeluaran, Tabungan, Dana Darurat. Selecting one of the last two auto-locks `category` to `"saving"`/`"emergency_fund"` and hides the (now redundant) category dropdown — under the hood the transaction is still `{type: "expense", category: "saving"|"emergency_fund"}`, which is what keeps it excluded from Pengeluaran everywhere (`NON_SPENDING_CATEGORIES`, shipped the prior session). Chose this UI-level fix over migrating the `type` field itself to a 4-way enum — that would have rippled through every `t.type === "expense"` check across `insights.js`, CSV export, the transaction list, and the WhatsApp parser for no behavioral gain; the one-step-selection outcome the request asked for is fully achieved without it. The free-text NLP parser (`whatsapp/parser.js`) also gained a `"dana darurat"`/`"darurat"` keyword rule, alongside the pre-existing `"nabung"`/`"tabungan"` one.

## 2. Weekly limits earmark Income + progress bar clarity

- The Income scorecard on `/finance` now shows, when any weekly limit is set for the current month: `"{total weekly limits} dialokasikan mingguan · sisa {income − total}"`. `monthLimitTotal` (sum of the month's `budgets[].limit`) already existed for the accordion header; this just surfaces it against Income too, per the brief's explicit request that setting weekly limits should visibly "cut into" the main Income balance.
- Weeks with no limit set no longer render a misleading solid 0%-filled progress bar (visually indistinguishable from "fully used" at a glance) — they show a dashed, unfilled placeholder instead, with a tooltip explaining transactions are still tracked, just not yet capped.

## 3. Editable Money Reminder

New store action `updateReminder(id, patch)`. Each reminder row in Life Admin gained a pencil button that swaps the row for an inline edit form (title, amount, due day, cadence) with Save/Cancel — same in-place-edit pattern as the rest of the app, no modal.

## 4. Removed the phantom baseline; staged (progressive) milestones

**The bug**: `financeTargets.savings.baseline` was seeded at `8_400_000` — a starting number not backed by any transaction the user had entered, which read as an unexplained "ghost" figure. Removed `baseline` from `financeTargets` entirely (`fundCurrent()` is now a pure sum of matching-category transactions, nothing added on top) — confirmed as the intent by the brief's own words: "pastikan data tabungan murni dari transaksi yang saya input."

**Staged targets**: `savingsProgress()`'s `target`/`pct` used to always reference the grand total (Rp100 juta), so the goal spent nearly its whole lifetime crawling from 0% toward a distant ceiling. Now: the *active* target is always the next unachieved milestone (`fundMilestones()`, every Rp10 juta) — show Rp10jt first, hit it, the active target becomes Rp20jt, and so on. `pct` is computed against that staged target, so progress visibly climbs 0→100% per stage. `grandTarget` is still returned separately for the milestone dot ladder and anywhere that wants the ultimate number.

**A real trap this surfaced**: the Tabungan `FundCard`'s click-to-edit target field originally would have let the user edit the *staged* Rp10jt number — saving that would have silently overwritten the real Rp100jt goal with Rp10jt. Fixed by giving `FundCard` a separate `editTarget` prop (always the grand total) distinct from the `target` prop that drives the progress bar/big number (the staged value). Caught and fixed during implementation, not by the user — worth calling out because it's the kind of bug that's invisible until someone actually clicks "edit."

## 5. Strict Income/Goal separation

Mostly a restatement of 1 + 4 working together: dedicated transaction types for fund contributions (1), fully excluded from every spending aggregate (shipped prior session — `NON_SPENDING_CATEGORIES` in `monthlyTotals`, `spendingByCategory`, `budgetWeeklyBreakdown`), and no hidden baseline conflating "money you told the app about" with "money the app just assumed" (4). No additional code beyond what 1 and 4 already cover.

## 6. Life Compass rework

**6a — "Histori ritual" was unclickable.** Real bug: `WeeklyRitual.jsx`'s ritual-history list rendered a `ChevronRight` icon on every row — implying "click to expand" — but had no `onClick` at all, and only ever showed `highlights` + `nextWeekFocus`, never `blockers`/`finance`/`careerProgress`/mood/energy/stress. Fixed: each row is now a real button opening a detail drawer (same pattern as `GoalDetail`/`SkillDetail`/`ReflectionDetail` elsewhere in the app) showing every field that was actually submitted.

**6b — Merged "Ritual Mingguan" + "Berbenah" tabs.** Both were a weekly check-in / write-a-reflection flow, just presented as two separate top-level tabs. Single tab now, named "Berbenah", with an internal mode toggle ("Tulis Refleksi" / "Ritual Mingguan") replacing the two tabs. `CompassPage`'s `TABS` array dropped from 5 to 4 entries; default tab and default internal mode both point at reflection-writing (`ComposeSection`), matching the tab's name.

**6c — AI empathetic response after submitting.** New shared component `AIReflectionResponse.jsx`, wired into all three submit paths under Berbenah (`WeeklyRitual`'s ritual form, `QuickForm`, `DeepForm`). After a successful save, the just-submitted entry's free-text fields (joined) plus mood/energy/stress are POSTed to `/api/ai/reflection-response`, which returns one short (2-4 sentence), tone-matched response — calming for heavy/stressed content, gently motivating for low-energy content, celebratory for positive content.

This is a **deliberate, explicitly-confirmed exception** to the standing rule that raw reflection text never reaches an LLM (`CLAUDE.md` AI section). Asked directly via `AskUserQuestion` before building — real empathy needs the actual words, not a mood score — and the user chose to allow it, scoped narrowly:
- Only the one entry just submitted, sent directly by the client — never history, never routed through `contextBuilder.js` (the chat assistant / action-plan / financial-planner pipeline is completely untouched by this route, so the existing `isPrivate` stripping there still applies everywhere else unchanged).
- Nothing logged or persisted server-side beyond the model call that generates the response.
- Response is read-only output — nothing is written back to the reflection/review record.

## 7. Removed the hero savings ring

The Finance page hero's circular "Net savings" ring (`SavingsRing`, an SVG progress ring) was redundant with the new Tabungan `FundCard` (which already shows current/target/milestones). Deleted the component entirely (dead code after removal from the hero). Replaced with a compact "Pengeluaran terbesar" mini-breakdown — top 3 spending categories as small relative bars — genuinely different information at a glance than the full "Spending by category" donut further down the page (which lists every category with a legend), not a redundant re-rendering of the same chart.

## Files touched

| File | Change |
|---|---|
| `frontend/src/components/QuickAddModal.jsx` | Tabungan/Dana Darurat Tipe options, category auto-lock |
| `frontend/src/lib/whatsapp/parser.js` | `"dana darurat"` keyword rule |
| `frontend/src/lib/seed.js` | Removed `financeTargets.*.baseline` |
| `frontend/src/lib/insights.js` | `fundCurrent()` simplified (no baseline), `savingsProgress()` staged target/pct + `grandTarget` |
| `frontend/src/lib/store.js` | `updateReminder` action |
| `frontend/src/app/finance/page.js` | Income earmark hint, progress-bar clarity fix, `ReminderRow` (editable), `FundCard`/`TargetEditor` `editTarget` fix, hero ring → top-categories, removed `SavingsRing` |
| `frontend/src/lib/ai/reflectionResponsePrompt.js`, `frontend/src/app/api/ai/reflection-response/route.js`, `frontend/src/components/compass/AIReflectionResponse.jsx` | New — AI empathetic response |
| `frontend/src/components/compass/WeeklyRitual.jsx` | Ritual history detail drawer (bug fix), AI response wiring |
| `frontend/src/app/compass/page.js` | Tab merge (`BerbenahSection` wrapper), AI response wiring in `QuickForm`/`DeepForm` |

## Verified

Playwright against a live dev server, real AI calls (no mocking):
- Tabungan/Dana Darurat both start at Rp0 (no phantom baseline); Tabungan's displayed target correctly shows the staged Rp10jt (not the grand Rp100jt) until that milestone clears.
- Quick Add's Tipe dropdown shows exactly `[Pemasukan, Pengeluaran, Tabungan, Dana Darurat]`; selecting a fund type hides the category field; a Rp3jt "Tabungan" transaction correctly added to the fund and was fully excluded from the Expense scorecard.
- Income scorecard earmark hint cross-checked directly against the budget accordion's own total (Rp1.000.000 in both places) — confirmed via screenshot, not just the DOM read.
- Weeks with no limit show the dashed placeholder, not a misleading empty bar; a week over its limit renders in terracotta as before.
- Reminder edit: changed a title inline, confirmed the update persisted and displayed.
- Life Compass: confirmed 4 top-level tabs (down from 5); ritual history is now clickable and opens a drawer with every field (highlights, blockers, finance reflection, career progress) that a real seeded entry actually had — previously inaccessible.
- AI response: submitted a reflection describing two weeks of overtime and fear of not keeping up — response directly addressed both specifics ("Dua minggu lembur terus...", "rasa takut kehilangan ritme itu justru tandanya kamu peduli") in a calming, non-generic tone, not a template.
- Dark mode spot-checked on both `/finance` and `/compass`, no visual regressions, no console/page errors across any of the above.
