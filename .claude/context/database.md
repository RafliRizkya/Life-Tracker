# Database Philosophy

Current persistence:

localStorage

Future:

Supabase

Architecture should naturally support both.

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