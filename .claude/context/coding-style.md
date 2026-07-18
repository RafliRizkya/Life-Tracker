# Coding Style

Code should be written for humans first.

The compiler only verifies correctness.

Future developers must understand the code without additional explanation.

---

# General Principles

Prefer explicit over clever.

Readable beats short.

Simple beats smart.

Consistency beats personal preference.

---

# Naming

Names should explain intent.

Good

- totalRevenue
- monthlyBudget
- selectedTransaction

Bad

- data
- item
- value
- temp
- obj

Avoid abbreviations unless universally understood.

---

# Functions

Functions should do one thing.

Prefer early returns.

Avoid deep nesting.

Extract repeated logic.

Keep functions focused.

---

# Components

Components should primarily render UI.

Business logic belongs elsewhere.

Avoid components becoming controllers.

---

# Hooks

Custom hooks should encapsulate behavior.

Avoid creating hooks for trivial wrappers.

---

# Utilities

Utilities should remain pure.

Avoid side effects.

Formatting belongs here.

---

# Comments

Write code that rarely needs comments.

Comment WHY.

Not WHAT.

Bad

// Increment i

Good

// Prevent duplicate transactions during autosave

---

# Imports

Group imports.

External

↓

Internal

↓

Relative

Avoid unused imports.

---

# Error Handling

Errors should provide useful context.

Never silently ignore failures.

---

# Consistency

If multiple solutions exist,

prefer the style already used in the project.