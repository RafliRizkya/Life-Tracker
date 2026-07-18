# AI Chat Assistant (MVP)

**Status: Built and live — Phase 1 of the "Personal Operating Intelligence" spec, pulled forward ahead of the documented roadmap.**

Full original spec (ambitious, not fully built): `docs/prompt/ai-personal-operating-system.md`. This doc describes what actually shipped and what's still deferred. Original implementation plan: `C:\Users\rafli\.claude\plans\linear-dancing-sundae.md` (local to the machine that built this).

## What "done" means for this pass

A working `/ai` page where Rafli can ask questions about his Finance/Goals/Career/Skills/Reflection/Weekly Review data and get a streaming, markdown-formatted answer grounded in that data, with a citation badge showing which modules were used. Read-only — the assistant cannot add/edit/delete anything.

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

Raw reflection/letter body text is **never** assembled into outbound context, regardless of intent — only the aggregated, non-quoting output of `reflectionInsights()` (word-frequency counts, top linked goal/skill, pending-action counts) is available to the model.

**Verified this actually holds** by pointing `OPENROUTER_BASE_URL` at a local echo server, adding a private reflection with a unique marker string, asking a reflection-related question, and confirming the marker never appeared in the request body that reached the (fake) OpenRouter endpoint. Also verified: a finance-only question's context contains *only* the `finance` key — no goals/career/reflection data rides along, even mid-conversation with prior turns in history.

**Known nuance, not a bug:** word-frequency aggregation can surface an unusual *word* from private text (e.g. an uncommon word appearing in `polaKataUtama`) even though the sentence/context it came from never leaves the browser. This is inherent to how `reflectionInsights()` works (it was designed for the dashboard's pattern-insight cards, which have the same property) — pattern-level exposure, not raw-content exposure. Worth knowing, not worth re-engineering for this MVP.

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

## Deferred to later passes

Specialized per-domain agents (Finance/Career/Goals/Reflection/Productivity/Life Strategist routing), proactive anomaly/forecast detection ("spending spike," "burnout risk," etc.), artifact generation (Daily Briefings, Executive Summaries, Resume Achievements as PDF/DOCX/CSV/MD), multi-conversation management, slash commands (`/report`, `/finance`), new keyboard shortcuts. Resuming any of these needs no architectural rework — the context builder / prompt builder / model router separation already supports layering agents and richer outputs on top.
