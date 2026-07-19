# Goals/Finance Upgrade: Categorization, Smart Tracking, AI Action Plans, AI Financial Planner

**Status: Live** — shipped 2026-07-19, from a 4-point brief.

## 1. Goal categorization + Finance sync

**Kuantitatif vs kualitatif** is derived, not stored: `goalKind(goal)` in `insights.js` returns `"quantitative"` if the goal has a `metric` or `contributions` field, `"qualitative"` otherwise (a plain hand-set `progress` percentage). No migration needed — every existing seed goal already classifies correctly (e.g. "Tabungan Rp10jt→100jt" → quantitative, "Financial Freedom" → qualitative, matching the brief's own examples exactly). Shown as a chip on every goal card (`goals/page.js`). New goals pick this explicitly in Quick Add (`goalKind` select) — quantitative reveals current/target/unit inputs.

**Finance sync** generalizes what used to be a single hardcoded special case. `savingsProgress()` previously computed the savings-ladder goal's current value as `baseline + sum(all "saving"-category transactions)`, matching only `goal.id === "goal-savings-ladder"`. That formula is now `linkedGoalCurrent(goal, transactions)`, available to *any* goal that sets a `linkedCategory` field (an expense category key from `TX_CATEGORIES`). `computeGoalProgress()` and the goal card's displayed metric both call it. Quick Add exposes "Sinkron otomatis dengan kategori Finance" for quantitative + finance-area goals. Seed data's `goal-savings-ladder` now carries `linkedCategory: "saving"` explicitly instead of relying on the ID special-case (the ID-based routing for its *milestone ladder UI* stays — that part is genuinely goal-specific — only the number-tracking logic was generalized).

## 2. Smart Finance Tracking

**Week auto-detection** already existed (`budgetWeeklyBreakdown()`, shipped 2026-07-19 earlier the same day, W1–W4 by calendar day buckets) — nothing to add there.

**Weekly budget flexibility**: budgets gained an optional `weeklyOverrides: { W1?: number, ... }` field. `budgetWeeklyBreakdown()` checks it before falling back to the existing auto-prorated calculation. New store actions `setWeeklyBudgetOverride(budgetId, weekKey, amount)` / `clearWeeklyBudgetOverride(budgetId, weekKey)`. UI: the allocated amount in the Finance page's week/category accordion is now a click-to-edit field (`WeeklyAllocationEditor`) — type a number and Enter to set a custom weekly limit (shown with a small `*`), clear it to fall back to auto-proration.

**Free-text transaction entry**: reused `frontend/src/lib/whatsapp/parser.js` verbatim — it already did exactly this (rule-based, no AI, "beli"/"bayar"/"jajan" → expense, "gaji"/"bonus" → income, Indonesian amount shorthand) for the paused WhatsApp integration. Added a text field + "Parse" button at the top of the transaction Quick Add form; parsing pre-fills the existing structured fields (type/category/amount/title/notes) for the user to review/edit before submitting — it does not skip the review step and save directly.

## 3. AI Action Plan (Goals & Skills)

New shared component `frontend/src/components/ActionPlanPanel.jsx`, used in both the Goal detail drawer and the Skill detail drawer. Calls `POST /api/ai/action-plan` with `{ title, area, why, kind, context: "goal"|"skill" }`, gets back `{ steps: [{title, note}] }` (3–8 items), shows them with checkboxes for review. **Generating never writes anything.** Applying:
- Goals → each checked step becomes a real commitment via `addCommitment()`.
- Skills → checked steps are formatted and appended to the skill's existing `plan` (learning plan) textarea via `onUpdate({ plan })`.

Both are normal, already-existing store actions — the AI response is just data the user chose to act on, identical in trust level to typing the same thing into Quick Add by hand.

## 4. AI Financial Planner

New section on `/finance` (`FinancialPlanCard`). Reuses the existing `/ai` chat assistant's `buildContext()` (module-scoped, privacy-safe context builder — see `docs/features/ai-assistant.md`) with `{finance, goals}` modules, sends it to `POST /api/ai/financial-plan`, gets back `{ summary, targetSavingRate, tips, categoryAdvice }`. Each `categoryAdvice` entry has a "Terapkan" button that calls the page's existing `upsertBudget()` — same suggest-then-user-applies pattern as above. **Not persisted** — regenerating is a deliberate choice over caching, since a stale financial plan showing outdated numbers as current fact is a worse failure mode here than for the (more evergreen) goal/skill action plans; the daily AI request cap (see below) is the accepted trade-off for that freshness.

## Shared AI infrastructure changes

- `frontend/src/lib/ai/rateLimit.js` — the daily request counter that used to live inline in `/api/ai/chat/route.js` is now shared across all three AI routes (chat, action-plan, financial-plan draw from one `AI_MAX_REQUESTS_PER_DAY` budget, not one each).
- `frontend/src/lib/ai/openrouter.js` gained `getCompletionText({messages})` — same model fallback chain as the streaming `streamChatCompletion()`, but buffers the SSE response into one string for callers that need structured (JSON) output rather than token-by-token UI streaming. Parses the identical `data: {...}` chunk format the `/ai` chat client already parses, kept in sync with that logic deliberately.
- `frontend/src/lib/ai/parseJsonResponse.js` — `extractJson(text)`, a small shared "pull the first `[...]`/`{...}` out of a free-tier model's response" helper, since free-tier models don't reliably return clean JSON with no surrounding prose. Returns `null` on failure; callers turn that into a "try generating again" error, never a guess.

## Why suggest-only, not direct-write

`CLAUDE.md` documented the `/ai` chat assistant as explicitly read-only before this work. Asked directly (`AskUserQuestion`) whether these two new AI surfaces should be allowed to save their output automatically or require review — the answer was **suggest only, user approves each save**, specifically to preserve the existing trust boundary ("AI never writes on its own") while still producing genuinely actionable output. Every apply action in both features routes through a pre-existing, already-audited store action rather than a new AI-specific write path.

## Verified

Playwright, real OpenRouter calls (free-tier, no mocking):
- New quantitative goal linked to the `saving` category tracked correctly (card % and displayed current both live-synced, confirmed via a bug caught mid-testing — the card's number display initially still showed the stored baseline while the % bar already used the live value; fixed to use `linkedGoalCurrent()` in both places).
- Weekly override: set Rp615.000 on a week/category row, confirmed it displays with the override marker and persists.
- Free-text parse: "beli kopi 4000 cash" → title "Kopi", type expense, amount 4000 — saved and visible in the transaction list.
- Goal action plan: generated 6 real, contextually-relevant Indonesian steps for "Meningkatkan English profesional" (the brief's own example), applied → 6 new commitments created (5→11), confirmed the write only happens on explicit apply.
- Skill action plan: generated and applied into the learning-plan textarea.
- Financial planner: generated a plan referencing actual seeded figures (income/expense/saving-rate numbers matched real data, not hallucinated), applied one category suggestion → new budget created (4→5).
- Dark mode + mobile (390px) spot-checked on Goals/Finance/Skills, no visual regressions, no console errors across any of the above.
