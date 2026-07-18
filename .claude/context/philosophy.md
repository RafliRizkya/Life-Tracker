# Engineering Philosophy

## Think Before Coding

Good engineering starts before implementation.

Always understand:

- why
- where
- consequences

Coding is the last step.

---

## Preserve Existing Quality

Never rewrite code because it looks old.

Rewrite only when:

- maintenance improves
- readability improves
- performance improves
- correctness improves

---

## Small Changes

Small pull requests are easier to review.

Small diffs are easier to trust.

Prefer incremental improvement.

---

## Reuse

Before creating:

- component
- hook
- utility
- helper

Search the project.

Existing code is usually preferable.

---

## Minimize Dependencies

Every dependency increases maintenance.

Prefer native APIs.

Prefer existing libraries already used.

Add packages only when clearly justified.

---

## Predictability

The user should never be surprised.

The code should never be surprising.

Consistency is more important than cleverness.

---

## Readability

Code is read far more often than written.

Optimize for future readers.

---

## Long-Term Thinking

Ask:

Will this still make sense two years from now?

If not,

choose another approach.