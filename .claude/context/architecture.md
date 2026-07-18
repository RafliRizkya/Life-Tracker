# Architecture

## Philosophy

The architecture should optimize for:

- clarity
- maintainability
- scalability
- incremental evolution

Do not optimize for cleverness.

Future developers should understand the project quickly.

---

# General Principles

Single responsibility.

Each module should have one primary responsibility.

Avoid "God Components".

Avoid files that know too much.

---

# Layering

Think in layers.

Presentation

↓

State

↓

Business Logic

↓

Persistence

Never mix responsibilities.

---

# Presentation

Pages should primarily orchestrate components.

Business logic belongs elsewhere.

Keep pages simple.

---

# Components

Components should focus on rendering.

Avoid embedding large business rules.

Extract reusable UI when repetition appears.

Avoid premature abstraction.

---

# State

State is the source of truth.

Never duplicate state.

Prefer derived state whenever possible.

Avoid syncing multiple independent states.

---

# Business Logic

Business rules should be:

- pure
- reusable
- testable

Business logic should never depend on UI.

---

# Utilities

Utilities should remain deterministic.

Avoid side effects.

Formatting belongs inside utilities.

Not inside components.

---

# Data Flow

Prefer one-way data flow.

Input

↓

State

↓

Derived Values

↓

UI

Avoid circular updates.

---

# Dependencies

Always ask:

Can existing code solve this?

Prefer extending current architecture.

Avoid introducing new libraries.

---

# Future Ready

Current persistence:

localStorage

Future persistence:

Supabase

Architecture should support migration naturally.

Avoid localStorage-specific assumptions.

---

# Performance

Do not optimize prematurely.

Measure first.

Optimize bottlenecks.

---

# Simplicity

Every new abstraction has a maintenance cost.

If a simpler solution exists,

prefer it.