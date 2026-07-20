# Database Philosophy

Current persistence (shipped 2026-07-19, see docs/features/supabase-sync.md):

localStorage, synced to Supabase in the background (whole-state JSONB blob, one row per user). Local read/render always happens first — Supabase reconciles after, never blocks first paint.

This is not aspirational — every addTransaction/addGoal/addSkill/etc. call already persists to both. If data isn't reaching Supabase, that's a bug to find and fix (see hydrate()'s reconcile logic in store.js), never something to route around or disable.

---

# Source of Truth

Business entities define the application.

Storage is an implementation detail.

Never couple business logic to persistence.

---

# Schema

Prefer stable schemas.

Avoid frequent structural changes.

Every field should have purpose.

---

# IDs

Every entity must have:

- id
- userId

Never remove userId.

---

# Relationships

Prefer explicit relationships.

Avoid hidden coupling.

---

# Migrations

Never destroy user data.

Always migrate safely.

Support backward compatibility whenever possible.

---

# Validation

Validate before persistence.

Never trust client input.

---

# Future

Database should support:

- sync
- offline
- conflict resolution
- backups

without major architectural changes.