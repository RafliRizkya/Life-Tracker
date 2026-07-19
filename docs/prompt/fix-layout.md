# Task: UI/UX Polish (Dashboard Layout, Sidebar Profile, Dark Mode Contrast)

## Objective
Fix several layout and styling issues across the application to improve readability and visual hierarchy.

## Action Plan for Claude Code
1. **Fix Dark Mode Readability:** Inspect the global CSS or Tailwind configuration for dark mode. Do not use dark gray text on dark backgrounds. Change the text colors in dark mode to lighter shades (e.g., light gray or off-white) to ensure high contrast and readability.
2. **Fix Sidebar Profile:** In the sidebar navigation, there are currently two overlapping or duplicate profile names ("rafli.life" and "Rafli Akbar"). Remove the duplicate. The display name should strictly be just "Rafli".
3. **Fix Dashboard Spacing:** On the Dashboard view, inspect the layout structure above the "Insight" card. There is a massive, unnatural empty gap/space above the text "Sudah 3 hari SQL & Querying nggak disentuh". Remove this excessive margin/padding so the layout is compact and neat.