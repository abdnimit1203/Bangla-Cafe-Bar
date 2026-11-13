# ADR-0004: Table reservations on the Brihot booking engine

Date: 12/11/2026 · Status: accepted

## Context

The SDK exposes guest bookings: `services()`, `slots({ serviceId, from, to })`,
`create()`, `read()`, `cancel()`, each with idempotency keys and private access
tokens. A booking service is a catalog product (`productType: 'service'`) with a
duration; its resources (staff/rooms in the salon pilot) have weekly schedules.
`BookingInput` has no party size. On `test-shoe` the capability is disabled
(`409 store.capability_disabled`), which the UI handles with a clear message.

## Decision

- Model each party-size band as a **service** (`table-for-2`, `table-for-4`,
  `table-for-6`, `table-for-8`) and each physical table as a **resource** of the
  matching service with the restaurant's opening hours as its weekly schedule.
  The engine then enforces capacity (a 2-top is never offered to 5 guests),
  overlap, opening windows and double-booking per table, server-side.
- `serviceForPartySize()` picks the service from the configured mapping, falls
  back to inferring capacity from the service name, then to a single service.
- Slots for a day are flattened across tables; for each start time the UI keeps
  one table with remaining capacity and sends its `resourceRef`.
- `expectedPriceMinor` is sent from the listed service so a price change is
  rejected by the server rather than silently accepted.
- Confirmation page lives at `/reservation/[id]` with the token in localStorage;
  cancellation uses its own idempotency key.

## Smallest backend change

A `partySize` field on `BookingInput` validated against a `capacity` on the
resource would collapse the per-size services into one "Table" service.

## Consequences

- Restaurant staff manage tables and hours in the Brihot dashboard, no code.
- Until the capability is enabled on the restaurant store, the page shows the
  phone number instead of a broken form.
