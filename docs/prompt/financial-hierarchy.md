# Task: Refactor Finance Budget Breakdown UI

## Objective
Refactor the Budget section in the Finance module to support a nested, hierarchical breakdown view using dropdowns/accordions.

## The Hierarchy Requirement
The budget must be drillable in the following structure:
- **Month** (e.g., July)
  - **Weeks** (W1, W2, W3, W4)
    - **Categories** (Makan, Bensin, Parkir, BPJS, Service, etc.)

## Action Plan for Claude Code
1. Update the UI component for the Budget section.
2. Implement a dropdown or accordion system. The user should first see the Month. 
3. Clicking the Month expands to show W1, W2, W3, and W4.
4. Clicking a specific Week (e.g., W1) expands to show the budget allocation for specific categories (Makan, Bensin, etc.) for that week.
5. Ensure the state management and UI can handle this 3-level deep nested structure cleanly.