# Task: Redesign Career Journey Map (Readability & Dual-Track Separation)

## File Context
I have uploaded my resume to the project workspace. Please read and parse the file named `Profile (6).pdf`. Use the extracted real data from this PDF to structure the UI and build the seed data.

## The Problem
The current gamified "Career Journey" map is too abstract. It only shows icons/shapes, forcing the user to click on a node just to read what the career or milestone is. This is bad UX. Additionally, it currently mixes full-time jobs with certifications/achievements into one confusing timeline.

## The Objective
1. **Expose Text on the Map:** The visual map MUST display the title, date/duration, and a short text preview directly on the UI without requiring a click. Hovering or clicking should only expand to show full details.
2. **Dual-Track Layout:** Visually separate "Professional Experience" (Work History) from "Milestones" (Certifications, Education, Life Events). 
   - *Idea:* Use a parallel timeline where the left side is the "Professional Path" and the right side is the "Milestones Path", or use distinct visual lanes/colors that run alongside each other.

## Action Plan for Claude Code
1. **Parse the PDF:** Read `Profile (6).pdf`. Extract my work experiences (e.g., PT. Pipamas Primasejati, LearnWithAndi, PT Unirama Duta Niaga, etc.) and my milestones/education (Politeknik Negeri Bandung, Google Advanced Data Analytics certification, etc.).
2. **Redesign the Component:** Update the frontend component to use a "Dual-Track" or "Parallel Lane" layout.
3. **Update the UI Nodes:** Ensure each node displays the `title`, `company/institution`, and `date` as visible text on the map based on the parsed PDF data. Do not hide core info behind a click.
4. **Data Schema Update:** If the current Zustand store or DB schema doesn't differentiate between `type: 'EXPERIENCE'` and `type: 'MILESTONE'`, update the schema and types to support this separation.
5. **Maintain Gamification:** Keep the UI feeling fun (like a skill tree or journey map) but prioritize readability. Use distinct aesthetics for Work vs. Milestones (e.g., solid blocks for work, glowing badges for milestones).
6. **Seed Data:** Inject the data extracted from the PDF as the default seed data so we can immediately see how the layout handles real-world content, especially the pivot from Administration to Data Analytics.