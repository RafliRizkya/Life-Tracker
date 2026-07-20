# AI Chat Assistant (MVP)

**Status: Built and live — Phase 1 of the "Personal Operating Intelligence" spec, pulled forward ahead of the documented roadmap. Write capability (suggest-only) added 2026-07-20 — see below, no longer purely read-only.**

Full original spec (ambitious, not fully built): `docs/prompt/ai-personal-operating-system.md`. This doc describes what actually shipped and what's still deferred. Original implementation plan: `C:\Users\rafli\.claude\plans\linear-dancing-sundae.md` (local to the machine that built this).

## What "done" means for this pass

A working `/ai` page where Rafli can ask questions about his Finance/Goals/Career/Skills/Life Compass (Reflection + Weekly Review, merged 2026-07-18 — see `docs/features/life-compass.md`) data and get a streaming, markdown-formatted answer grounded in that data, with a citation badge showing which modules were used. Originally read-only; can now also propose create/update actions for the user to approve (2026-07-20, see "Write capability" below) — never a direct write.

## Confirmed decisions

- Built now, consciously ahead of roadmap (previously "Phase 1: No AI, rule-based only"; PRD listed AI as Phase 3 "opsional via Qwen"). `buildInsights()` and all existing rule-based dashboard insights are **unchanged** — this feature is additive, not a replacement.
- Provider: **OpenRouter, free-tier models only — no paid model may ever be called**, confirmed explicitly (twice) during planning.
- Scope: single-thread streaming Q&A. Explicitly deferred: specialized per-domain agents, proactive anomaly/forecast detection, artifact generation (PDF/DOCX/CSV/MD reports), multi-conversation management (rename/pin/delete/search), slash commands, new keyboard shortcuts.

## Architecture

Data lives entirely in the browser (Zustand + localStorage) — the backend has no database of its own for these modules. So the "Context Builder" runs **client-side**, where the data actually is, and POSTs a trimmed payload to a thin server route whose only job is to hold the OpenRouter key and relay the streamed response. Same trust-boundary shape as the WhatsApp webhook.

```
Browser: detectIntent(message) → buildContext(store, intent) → { payload, manifest }
         ↓ POST /api/ai/chat { message, context: payload, history }
Server:  privacy filter → buildMessages() → streamChatCompletion() [fallback chain] → relay SSE bytes back
Browser: reader loop appends streamed tokens into the chat thread, renders markdown, shows manifest badge
```

## Files

| File | Purpose |
|---|---|
| `frontend/src/lib/ai/contextBuilder.js` | Client-side, pure. `detectIntent()` (keyword-based module matching), `buildContext()` (reuses `insights.js` selectors, trims aggressively — 2 months of transactions, top 6 categories, non-archived goals). |
| `frontend/src/lib/ai/promptBuilder.js` | `SYSTEM_PROMPT` (persona, grounding rules, read-only constraint) + `buildMessages()` (history capped to last 12 turns). |
| `frontend/src/lib/ai/openrouter.js` | Server-only. Free-tier-only fallback chain, dynamic free-model discovery, in-memory 10min "last-known-good" cache, streaming relay. |
| `frontend/src/app/api/ai/chat/route.js` | The route. Defensive `isPrivate` strip, `AI_MAX_REQUESTS_PER_DAY` cap, streams back or returns `503`. |
| `frontend/src/lib/aiStore.js` | Standalone Zustand store for the single persisted thread (own localStorage key, deliberately not merged into the main `useLifeStore`). |
| `frontend/src/app/ai/page.js` + `frontend/src/components/ai/*.jsx` | The UI: chat thread, markdown-rendered messages with citation badges, input, starter prompts. |

## Hard privacy rule (verified at the network layer, not just by code review)

Raw reflection/letter/weekly-review body text is **never** assembled into outbound context, regardless of intent — only the aggregated, non-quoting output of `reflectionInsights()` (word-frequency counts, top linked goal/skill, pending-action counts) and `reviewInsights()` (30-day ritual count, average energy/stress) is available to the model.

**2026-07-18 fix:** `buildReview()` originally sent raw `highlights`/`blockers`/`finance`/`careerProgress` text straight into context — a real gap, found and closed during the Life Compass merge (Weekly Review had no `isPrivate` concept before that, so the existing `stripPrivateContent()` string-match couldn't catch it). It now goes through `reviewInsights()` exactly like reflections do. See `docs/features/life-compass.md`.

**Verified this actually holds** by pointing `OPENROUTER_BASE_URL` at a local echo server, adding a private reflection with a unique marker string, asking a reflection-related question, and confirming the marker never appeared in the request body that reached the (fake) OpenRouter endpoint. Also verified: a finance-only question's context contains *only* the `finance` key — no goals/career/reflection data rides along, even mid-conversation with prior turns in history.

**Known nuance, not a bug:** word-frequency aggregation can surface an unusual *word* from private text (e.g. an uncommon word appearing in `polaKataUtama`) even though the sentence/context it came from never leaves the browser. This is inherent to how `reflectionInsights()` works (it was designed for the dashboard's pattern-insight cards, which have the same property) — pattern-level exposure, not raw-content exposure. Worth knowing, not worth re-engineering for this MVP.

## Write capability (2026-07-20) — suggest-only, same boundary as the other AI surfaces

Explicitly requested by Rafli ("Asisten AI bisa mengubah data saya sesuai approval saya... mesti ada approval saya dengan plan yang ia mau ubah seperti apa"). Scoped via `AskUserQuestion` before building: **every entity except Reflection/Letter/Weekly Review**, **create + update only, never delete/archive**.

**Flow, kept deliberately separate from the streaming Q&A path** (mixing structured JSON output with token-by-token SSE is more complexity than the win is worth):

```
Client: looksLikeActionRequest(message) — cheap keyword heuristic (catat/tambah/update/ubah/set/atur/...),
        same style as MODULE_KEYWORDS. Deliberately permissive — a false positive just costs
        one buffered round-trip; the model itself returns actions:[] + a normal answer in `reply`.
  ↓ true                                          ↓ false
buildActionableEntities(store)                    existing streamInto() — unchanged, still streamed
  → {id, title/name} lists for goals/
    commitments/skills/careerMilestones/
    reminders (NOT full context — the model
    needs real ids to target updates, not
    aggregated insights)
  ↓ POST /api/ai/action-request { message, actionContext }
Server: buildActionRequestMessages() → getCompletionText() (buffered, same fallback chain as
        every other AI route) → extractJson() → validate every action against ACTION_DEFS
        (actionSchema.js) — unknown types and invalid/incomplete params are silently dropped,
        never guessed at
  ↓ { actions: [{type, params, summary}], rejected, reply }
Client: ActionProposalCard — one checkbox per proposed action (human-readable summary,
        e.g. "Tambah transaksi: Pengeluaran Rp20.000 · Kopi · daily · 2026-07-20"),
        Terapkan / Abaikan. Terapkan calls applyAction() for each checked action —
        a normal useLifeStore call (addTransaction, updateGoal, ...), nothing new.
```

**Whitelist** (`frontend/src/lib/ai/actionSchema.js`): `addTransaction`, `addGoal`/`updateGoal`, `addCommitment`/`toggleCommitment`, `addSkill`/`updateSkill`/`practiceSkill`, `addCareerMilestone`/`updateCareerMilestone`, `addReminder`/`updateReminder`, `setWeeklyBudget`, `setFinanceTarget`. No `remove*`/`archive*` action is defined anywhere in the schema — not filtered out, structurally absent, so there is no code path that could execute one even if a model hallucinated one.

**Id targeting**: `update*`/`toggleCommitment`/`practiceSkill` require an `id` field that must exactly match one from `actionContext` — the model is instructed to never invent an id, and `normalize()` server-side independently re-checks the id exists in the same context before accepting the action (defense in depth, not just a prompt instruction).

**Privacy**: `buildActionableEntities()` only ever includes non-private structured fields (titles/names/status/level) from goals/commitments/skills/careerMilestones/reminders — never reflection/letter/review content, and it's a completely separate function from `buildContext()`'s Q&A payload. The standing "raw reflection text never reaches an LLM" rule is untouched by this feature.

**Files**: `frontend/src/lib/ai/actionSchema.js` (whitelist + `normalize()`/`describe()`/`applyAction()`, shared client+server), `frontend/src/lib/ai/actionRequestPrompt.js` (system prompt + message builder), `frontend/src/app/api/ai/action-request/route.js` (the route — buffered, rate-limited off the same shared counter), `frontend/src/components/ai/ActionProposalCard.jsx` (approve/reject UI), `frontend/src/lib/aiStore.js` (`proposal` field on assistant messages + `setProposalStatus()`).

## Cost/rate-limit guardrail

`AI_MAX_REQUESTS_PER_DAY` (default 200, in-memory counter, resets daily) exists purely to avoid exhausting OpenRouter's free-tier rate limits — there's no real dollar-cost risk since only free models are ever called.

## Env vars (already set in `frontend/.env.local`, real values — not placeholders)

```
OPENROUTER_KEY=...
MODEL_TENCENT=tencent/hy3:free
MODEL_NVIDIA=nvidia/nemotron-3-ultra-550b-a55b:free
MODEL_POOLSIDE=poolside/laguna-m.1:free
MODEL_OPENAI=openai/gpt-oss-20b:free
MODEL_GOOGLE=google/gemma-4-31b-it:free
```
All 5 confirmed live and free (`pricing.prompt/completion === "0"`) against OpenRouter's `/models` endpoint at build time. `OPENROUTER_BASE_URL` is optional (defaults to the real endpoint) — only used to redirect to a local echo server for privacy verification, as done above.

## Verified

- Fallback chain happy path: real streamed tokens, `cost: 0`, correct model attribution.
- Fallback chain exhaustion: invalid key → graceful `503`, no hang/crash (tested by temporarily invalidating the key, then restoring it).
- Prompt grounding: asked a finance question with a partial context payload, the model correctly cited the given numbers and explicitly said it lacked data for anything not provided — no fabrication observed.
- Full UI flow via Playwright: nav entry, empty state + starter prompts, streaming response renders progressively, markdown renders, citation badge shows correct module(s), thread persists across reload, ⌘K palette lists the new page, no console errors introduced.
- Privacy boundary (see above) — the most important check, verified at the actual network layer.

### Write capability (2026-07-20) — verified against a live dev server, real Supabase sync, no mocking

- Normal question ("Skill apa yang paling lama tidak kulatih?") still streams through the unchanged read path — no proposal card, confirming the heuristic doesn't false-positive on genuine Q&A.
- Out-of-scope request ("Tuliskan refleksi hari ini buat aku dan simpan") — model correctly declined ("di luar kemampuan saya"), no proposal card, `actions: []`.
- In-scope create ("Tambahkan commitment ... due besok") — proposal card rendered with an accurate human-readable summary; left unapproved (not applied) as part of the same test.
- In-scope write approved end-to-end ("Set limit mingguan minggu ke 4 bulan ini jadi 777000") → clicked Terapkan → confirmed the real `budgets` array updated (read directly from `localStorage`, not just the UI) → cleared it back out via the existing Finance UI's own clear-limit control afterward.
- **A real bug found during this verification, not by inspection**: `setWeeklyBudget`'s `normalize()` originally stored `week` as a bare number (`4`), but `budgetWeeklyBreakdown()` (and every real caller via `WeeklyLimitEditor`) key weeks as strings `"W1"`..`"W4"` — the AI-approved limit silently wrote to the store but never appeared anywhere on `/finance`, an orphaned row invisible to every reader. Fixed by formatting to `` `W${weekNum}` `` in `normalize()`. Caught precisely because a live-Supabase, no-mocking verification pass reads the actual persisted data, not just "did a request succeed."
- **Date-relative requests** ("due besok") initially resolved to a nonsensical date (2024-12-20) because the model was never told today's actual date — fixed by injecting `Hari ini tanggal {today}` into the action-request prompt; re-verified the same request resolves to the correct date (2026-07-21).
- Confirmed no console/page errors across `/`, `/ai`, `/goals`, `/finance`, `/career`, `/skills` after all of the above.
- **Test-data hygiene**: because this dev server points at the same Supabase project the production deployment reads from, both the `setWeeklyBudget` bug's orphaned row and the (never-approved) test commitment were checked for and confirmed absent from a fresh reload before wrapping up — same caution noted in `docs/features/goal-progress-sources.md`.

## Visual treatment: ghost-text / read-only reinforcement (added 2026-07-18, presentation-only)

Source brief: `docs/prompt/ai-chat-ghost-text.md` (Wave 3 of the UI/UX Elevation Brief). No changes to contextBuilder/promptBuilder/openrouter or any logic — styling only:

- **Assistant bubbles** moved off the `card` class (which elsewhere means "saved/committed content") to a soft 60%-opacity surface with `text-ink-soft` — a visual register that says "being discussed," not "done." While streaming, the in-progress bubble renders at 75% opacity and settles to full on completion (Cursor ghost-text feel); the opacity transition is skipped under reduced motion (store flag or OS).
- **Markdown tables** softened from full-bordered grid + header fill to horizontal hairlines with uppercase muted headers — reported facts, not an editable spreadsheet (`.prose-chat` in globals.css).
- **Starter prompts** restyled as invitations: dashed border, quoted, Instrument Serif italic, 44px min-height — not solid action buttons.
- **Persistent read-only line** added under the chat input: "Read-only — asisten hanya membaca datamu, tidak pernah mengubahnya" with a lock icon — the constraint is now legible at a glance, not just true in the backend.
- **Citation badge** kept at full prominence (trust mechanism); only its Life Compass labels changed to "Life Compass (Jurnal)" / "Life Compass (Ritual)" so the badge's `·` separator no longer makes two labels read as four modules.

Verified via Playwright with a mocked SSE `/api/ai/chat` route (no real OpenRouter calls): empty state, waiting indicator, completed response with markdown + table + citation badge, reduced-motion (dots static, computed opacity 1), desktop/390px/dark screenshots, no console errors.

## Deferred to later passes

Specialized per-domain agents (Finance/Career/Goals/Reflection/Productivity/Life Strategist routing), proactive anomaly/forecast detection ("spending spike," "burnout risk," etc.), artifact generation (Daily Briefings, Executive Summaries, Resume Achievements as PDF/DOCX/CSV/MD), multi-conversation management, slash commands (`/report`, `/finance`), new keyboard shortcuts. Resuming any of these needs no architectural rework — the context builder / prompt builder / model router separation already supports layering agents and richer outputs on top.
