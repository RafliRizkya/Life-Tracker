# Task: Fix Global CRUD and State Persistence Bug Across All Modules

## Objective
Fix the critical bug across ALL modules (Finance, Career, Goals, Skills, Weekly Review, etc.) where newly added items are not saving to the database, and deleted items keep reappearing. 

## The Problem
Currently, when I add a new entry or delete an old one in ANY section of the app, the changes do not persist. If I open the app on another device, the new entries are missing. If I refresh the page on the same device, the newly added items disappear. This indicates a global issue with how the frontend communicates with the backend/database.

## Action Plan for Claude Code
1. Inspect the global database connection and API endpoints for all modules that support CRUD (Create, Read, Update, Delete) operations.
2. Check the Zustand stores (or relevant state management) across the application to ensure optimistic UI updates are properly syncing with the backend database.
3. Identify why the `POST` (create) and `DELETE` requests are failing silently or not mutating the database correctly across these modules.
4. Fix the database configuration, API routes, or fetching logic so that all additions and deletions persist permanently across sessions and devices for every section.
5. Add global error handling so if a save or delete fails, the UI shows a clear error toast/message instead of silently failing.