# Task: UX Copywriting Refactor (Humanize the App)

## Objective
Review and refactor the hardcoded UI text, placeholders, empty states, notifications, and AI response templates across the frontend components. The current copywriting feels "AI generic" and robotic. 

## The Problem (Anti-Patterns to Remove)
- **The "AI Bullet Points":** Stop using excessive hyphens (`-`) or numbered lists for simple explanations.
- **Robotic Phrasing:** Remove generic AI transition phrases (e.g., "Here is the summary of...", "As an AI...", "It is important to note that...").
- **Dry/Corporate Tone:** Remove stiff, overly formal words.

## The New Tone & Voice
- **Human & Conversational:** Write exactly like a highly empathetic, encouraging, and witty human mentor/coach. 
- **Premium & Minimalist:** Use short, punchy sentences. Less is more.
- **Motivating:** When the user has no data (Empty States), encourage them to start warmly, don't just say "No data found."
- **Contextual:** Tailor the tone to the module. 
  - *Finance:* Reassuring and clear.
  - *Goals:* Energetic and inspiring.
  - *Reflection:* Empathetic and calm.

## Action Plan for Claude Code
1. Scan the frontend directories (components, pages, views, hooks) for UI strings, tooltips, empty state texts, and alert messages.
2. Rewrite the text based on "The New Tone & Voice" guidelines.
3. Replace generic list formats with natural paragraph flows or better UI spacing where possible.
4. If texts are stored in a constants file or localization file, update them there.
5. Ensure the new text length does not break the current UI/CSS layout.

Execute the changes progressively and ask for my review on one module first (e.g., Dashboard or Finance) to ensure the tone matches my vision before proceeding to the rest of the app.