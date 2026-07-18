# Testing

Testing is verification.

Not documentation.

---

## Goal

Verify the implementation behaves correctly.

Do not assume.

Test.

---

## Unit

Verify:

- utilities
- business logic
- calculations
- formatting
- validation

Prefer deterministic tests.

---

## Integration

Verify:

- module interactions
- state updates
- persistence
- routing

---

## UI

Run Playwright after frontend changes.

Verify:

- loading
- success
- empty state
- errors
- mobile
- desktop

---

## Accessibility

Keyboard navigation.

Focus order.

Screen reader labels.

Color contrast.

Reduced motion.

---

## Edge Cases

Always test:

Empty data

Very large data

Very long text

Slow network

Offline mode

Duplicate input

Invalid input

---

## Regression

Verify unrelated features still work.

Never assume isolated changes.

---

## Deliverables

List:

Test scenarios

Results

Remaining risks

Future improvements