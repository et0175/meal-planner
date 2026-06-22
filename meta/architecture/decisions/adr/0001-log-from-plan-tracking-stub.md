# ADR-0001: Log-from-plan tracking entry stub store

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The Meal Planner module includes three user-facing actions that create Meal Tracking
entries: "Log this day" (US-040 / FR-035), "Log this week" (US-040 / FR-035), and
per-item log from the Calendar view (US-045 / FR-025). These actions were promoted to
MVP1 scope by OQ-008. The data they produce — `TrackingEntry` records — belongs to
the Meal Tracking bounded context (CTX-006), which is owned by the Personal Cabinet
module. Personal Cabinet is explicitly deferred to v1.1 (vision.md non-goals).

The tension: the write actions live in MVP1, but the read/management surface
(Personal Cabinet, history view, calorie corridor) does not. The backend must decide
how to handle writes that have no owning module in the current release.

CON-002 constrains the backend to a Python REST service. There is no event bus in MVP1
(see DEC-009), so there is no deferred-write mechanism. The stub must be a direct
persistent store reachable by the Meal Planner service at write time.

## Decision

We will write `TrackingEntry` records to a minimal stub table in the MVP1 database
schema, owned by the Meal Tracking context stub (CTX-006). The table holds the minimum
fields required by FR-025 and FR-035 (user_id, item_id, item_name, serving_count,
meal_slot, date, logged_at). Personal Cabinet in v1.1 will read from this same table
without a schema migration, completing the context. This satisfies FR-025 and FR-035
in full and preserves all user data logged before v1.1 ships.

## Alternatives considered

### reject_501
The backend returns HTTP 501 Not Implemented for log-from-plan calls; the UI shows a
"coming in v1.1" message. This is honest about the scope boundary but directly breaks
the acceptance criteria of US-040 and US-045, which are in the MVP1 story set. Rejected
because it requires either downgrading two confirmed MVP1 stories or shipping a visibly
incomplete feature with a stub error message.

### hide_ui_actions
The "Log this day", "Log this week", and per-item log actions are removed from the
MVP1 UI. This is a clean scope boundary with no backend debt. Rejected because it
requires updating three user stories (US-040, US-045, US-MP-016/021) that were
explicitly promoted to MVP1 by OQ-008, reversing a product decision made during
requirements. The effort to reverse that decision (story rewrites, test-case updates)
exceeds the effort of the stub table.

## Consequences

### Positive
- US-040 and US-045 work end-to-end in MVP1 with no degraded experience for the user.
- All TrackingEntry data logged in v1 is preserved; v1.1 Personal Cabinet inherits it
  without a migration, reducing v1.1 delivery risk.
- The CTX-006 schema boundary is defined early, making v1.1 domain extraction
  faster and less likely to conflict with existing data.

### Negative
- The stub table is a partially-owned data store: writes happen in MVP1 but the read
  path, validation logic, and invariants are not enforced until v1.1. Any schema
  change in v1.1 that cannot be handled by a backwards-compatible migration will
  require a data fix.
- The Meal Planner service has a compile-time dependency on a table in CTX-006 scope,
  creating a cross-context coupling that violates clean context boundaries until
  Personal Cabinet is shipped.

### Neutral
- The stub table must be included in the MVP1 database migration scripts and seeded
  in the test fixture. This is a small but non-zero addition to the MVP1 data layer.
- The v1.1 Personal Cabinet architecture pass should treat this ADR as a constraint
  (the table schema is already live) and design around it rather than redefining it.
- No read endpoints are required in MVP1 — the stub write path is sufficient.

## References

- DEC-007 (resolved by this ADR)
- CTX-006 (Meal Tracking stub context — owns the stub table)
- CTX-004 (Meal Planning — writes to the stub table)
- FR-025 (per-item log action)
- FR-035 (log-this-day / log-this-week action)
- US-040, US-045 (MVP1 stories that require this behaviour)

## History

- 2026-06-22: Created — stub TrackingEntry table adopted to satisfy MVP1 log-from-plan
  stories while deferring Personal Cabinet read surface to v1.1.
