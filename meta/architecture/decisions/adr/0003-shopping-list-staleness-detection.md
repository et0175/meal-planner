# ADR-0003: Shopping list staleness detection strategy

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The Shopping List must show a visible stale indicator whenever the underlying meal
plan has changed since the list was last generated (FR-030, US-052). The ShoppingList
aggregate (AGG-004, CTX-005) depends on MealPlan assignment data from the Meal
Planning context (CTX-004) via CTXREL-007. When assignments are added, removed, or
modified (EVT-011–014), the previously generated list is no longer accurate.

There are two natural approaches to detecting this condition: subscribing to
plan-change events asynchronously, or performing a lightweight staleness check at
read time by comparing timestamps. MVPconstraints are relevant: CON-002 (Python
REST backend), no event bus infrastructure in MVP1 (established by DEC-009 context),
and NFR-002 (responses < 200ms) which the staleness check must not violate.

## Decision

We will detect Shopping List staleness by comparing timestamps at read time: when the
user opens the Shopping List view, the backend checks whether the MealPlan's
`last_modified` timestamp is newer than the ShoppingList's `generated_at` timestamp
for the active date range. If so, the response marks the list as stale. This requires
`last_modified` to be a cheap, indexed field on the MealPlan aggregate. The check is
a single indexed lookup and satisfies NFR-002. No event infrastructure is required.

## Alternatives considered

### async_event_subscription
Shopping List subscribes to EVT-011, EVT-012, EVT-013, and EVT-014 (plan assignment
changes) and runs an internal command to mark the list stale immediately when any of
these events arrive. This approach is decoupled and provides real-time stale marking
even when the user is not on the Shopping List screen. Rejected for MVP1 because it
requires reliable event delivery infrastructure that does not exist yet, and because
a missed event would silently leave the list appearing fresh — a data quality risk
harder to detect and fix than a timestamp comparison. The complexity cost is not
justified for MVP1 scale.

## Consequences

### Positive
- No event infrastructure required; the check reuses data already present in the
  MealPlan aggregate (`last_modified` timestamp).
- Staleness is always correct at the moment the user opens the Shopping List —
  no risk of a missed event causing a stale list to appear fresh.
- Implementation is a single comparison in the Shopping List read endpoint,
  with no additional services or subscribers to maintain.

### Negative
- Staleness is only visible when the user navigates to the Shopping List view.
  If the user edits their plan and immediately expects to see the stale indicator
  on an already-open Shopping List tab, they will not see it until they reload or
  re-navigate.
- The MealPlan aggregate must maintain a reliable `last_modified` field that is
  updated atomically with every assignment change. Forgetting to update it on any
  mutation path would silently break staleness detection.

### Neutral
- The MealPlan aggregate schema must include `last_modified: datetime` as a
  required, indexed field. This should be enforced at the model layer (not
  application layer) to prevent accidental omission.
- If real-time stale indication becomes a product requirement in v1.1, the
  async event subscription approach (rejected above) is the natural upgrade path
  and is compatible with the existing timestamp-based fallback.
- The date-range scope of the staleness check must match the Shopping List's
  active date range: only plan changes within the selected from–to window should
  trigger a stale mark.

## References

- DEC-009 (resolved by this ADR)
- CTX-004 (Meal Planning — source of last_modified)
- CTX-005 (Shopping List — consumer, owns stale indicator)
- CTXREL-007 (context map relationship this decision governs)
- FR-030 (staleness indicator requirement)
- NFR-002 (response time < 200ms)
- US-052 (story driving staleness detection)

## History

- 2026-06-22: Created — check-on-read adopted for MVP1 simplicity; async event
  subscription deferred pending event infrastructure and real-time UX requirements.
