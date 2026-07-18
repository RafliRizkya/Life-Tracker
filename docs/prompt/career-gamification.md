# Task: Gamify the Career Journey Module

## Objective
Redesign and rebuild the Career Journey UI. It currently feels too static. I want to transform it into a gamified, interactive experience. The user should feel a sense of progression, achievement, and "fun" when reflecting on their career journey.

## UI/UX Vision
- **Concept:** Do NOT use a standard, boring vertical corporate timeline. Think of a video game "Skill Tree", "Level Map", or stepping stones.
- **Interactive:** The user should be able to play around with it. Hovering over a career milestone should trigger micro-interactions.
- **Dynamic & Flexible:** The user can ADD or DELETE career milestones at any time. The layout must automatically adapt, re-route, or re-balance itself beautifully when a node is added or removed.

## Animation & Gamification Requirements
- **Level-Up Feel:** When the user adds a new career milestone, trigger a satisfying "level-up" or "unlock" animation (e.g., a subtle glow, pop effect, or confetti).
- **Smooth Transitions:** Use smooth layout animations (e.g., Framer Motion `layout` prop or equivalent) so when a milestone is deleted, the remaining nodes smoothly slide into their new positions instead of snapping abruptly.
- **Visual Milestones:** Differentiate nodes based on the type of achievement (e.g., Promotion, New Skill, Job Change, Certification) using distinct icons, colors, or node shapes.

## Action Plan for Claude Code
1. Review the existing Career Journey component and its Zustand state/data structure (specifically the Add and Delete actions).
2. Propose a specific UI layout (e.g., a winding Journey, a skill tree, or an interactive horizontal map) before writing the full implementation.
3. Implement the new component with robust animations for mounting (adding) and unmounting (deleting) nodes.
4. Ensure the component remains fully responsive on mobile devices (the winding Journey or tree must scale down gracefully).
5. Add the micro-interactions (hover states, click to expand details, success animations on creation).

Please start by explaining your chosen UI concept for this gamified map, and once approved, proceed with the implementation.