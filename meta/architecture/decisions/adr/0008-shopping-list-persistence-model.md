# ADR-0008: Shopping list persistence model

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The ShoppingList aggregate (AGG-004, CTX-005) is a derived artifact — generated from
meal plan assignments over a user-selected date range (FR-027). When the user
refreshes the list (FR-030, US-052) or changes the date range (FR-028, US-049), a
new list is computed. The data model must decide whether to overwrite the previous
list or retain it as history.

INV-011 states that at most one active shopping list exists per user at a time,
consistent with the single-list UI model. INV-012 states that the list's
`generated_at` timestamp must be updated on every refresh (required by the
check-on-read staleness mechanism in ADR-0003).

## Decision

We will persist a single active ShoppingList record per user, overwriting it on
every refresh or date range change. The ShoppingList row is keyed by user_id;
regeneration is an upsert. This is the simplest model consistent with the single-list
UI and the staleness detection mechanism in ADR-0003.

## Alternatives considered

### append_history_per_date_range
Each (user_id, from_date, to_date) combination is stored as a separate persisted
list; the most recent is marked active. Provides an audit trail and allows users
to re-view past lists. Rejected for MVP1 because the Shopping List UI shows one
list at a time (no history view), the storage and query complexity is not justified
by any current user story, and it introduces unbounded row growth per user without
a retention policy. Deferred to v1.1 if a history or compare feature is requested.

## Consequences

### Positive
- Simple schema: one row per user, upsert on refresh — no accumulation, no
  retention policy needed in MVP1.
- The `generated_at` field for ADR-0003 staleness detection is always on the
  single active row; no ambiguity about which record to compare.

### Negative
- No history: if a user refreshes after an accidental plan change, the previous
  list is gone. In MVP1 there is no undo for this.
- Switching to a history model in v1.1 requires a schema migration (single-row
  keyed by user_id → multi-row keyed by user_id + date range).

### Neutral
- The upsert should replace all grocery lines atomically to avoid partial state
  (old lines from a previous date range coexisting with new lines).
- If a history feature is added in v1.1, the migration is straightforward: copy
  the existing single row into the new keyed schema.

## References

- DEC-004 (resolved by this ADR)
- CTX-005 (Shopping List context)
- AGG-004 (ShoppingList aggregate)
- INV-011, INV-012 (aggregate invariants this decision satisfies)
- ADR-0003 (staleness detection — depends on single generated_at per user)
- FR-027, FR-028, FR-030 (requirements governing list generation and refresh)

## History

- 2026-06-22: Created — single active list per user adopted for MVP1 simplicity;
  history model noted as v1.1 candidate.
