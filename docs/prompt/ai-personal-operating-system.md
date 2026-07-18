# Feature Request: Personal Operating Intelligence (POI) for Life Tracker

## 1. Mission & Context
Build the intelligence layer of Life Tracker. This is NOT a basic chatbot; it is a proactive Personal Operating System acting as a Personal CFO, Career Mentor, Data Analyst, and Life Strategist. It must connect and understand all modules (Finance, Goals, Career, Skills, Reflection, Weekly Review) to generate cross-module insights, forecasts, and actionable artifacts.

**Prerequisite:** Read `CLAUDE.md`, `docs/PRD.md`, and `docs/SRS.md` before writing any code. Inspect the existing architecture, Zustand stores, DB schema, and routing. Do not assume.

## 2. Architecture & Backend
- **OpenRouter Exclusive:** Use `OPENROUTER_API_KEY` in the backend only. Never expose keys or call from the frontend.
- **Model Router & Fallback:** Implement a resilient router: `Context Builder -> Prompt Builder -> Model Router -> Streaming -> Response Formatter`. 
- **Fallback Chain:** Tencent -> Nvidia -> Poolside -> OpenAI -> Google -> Auto-discover FREE chat model -> Cache & Retry. Never fail immediately.
- **Context Engine:** Optimize tokens aggressively. Parse user intent and load ONLY required data modules (e.g., if asking about coffee, load Finance/Transactions only; if asking for a life summary, load all).
- **Architecture Layers:** Strict isolation. Data Layer -> Repository -> Context Builder -> Retriever -> Prompt Builder -> Model Router.

## 3. Frontend UX (`/ai` or `/assistant`)
- **Premium UI:** Streaming responses, markdown, dynamic tables/charts, expandable reasoning summaries, citations to user data.
- **Features:** Conversation memory (rename, delete, pin, search), follow-up suggestions, slash commands (`/report`, `/finance`, `/career`, etc.), keyboard shortcuts.
- **Proactive Workspace:** UI must support viewing AI-generated artifacts and reports (PDF, MD, CSV, DOCX).

## 4. Core AI Capabilities
- **Specialized Agents:** Route queries internally to specific agents (Finance, Career, Goals, Reflection, Productivity, Life Strategist).
- **Proactive Insights & Forecasting:** Automatically detect anomalies (e.g., spending spikes, goal risks, habit changes). Predict future trends (cashflow, burnout risk) with explained confidence levels.
- **Decision Engine:** When asked "What should I do?", the AI must: Collect data -> Reason -> Compare options -> Explain (with data citations) -> Recommend.
- **Artifact Generation:** Generate structured reports (Daily Briefings, Weekly/Monthly Executive Summaries, Financial Health Reports, Resume Achievements, etc.).

## 5. Code Quality & Constraints
- **Stack:** Strict TypeScript, Context7, Playwright. 
- **Component Rules:** Keep components under 300 lines. Single responsibility. No duplicated logic. Composition over inheritance.
- **Performance:** Lazy loading, streaming, caching, and context compression.
- **Security:** Never expose environment variables, private data, or execute arbitrary code. Respect data privacy.

**Deliverable:** A fully functional, self-healing, streaming AI backend and a premium `/ai` frontend that acts as the intelligent brain of Life Tracker.