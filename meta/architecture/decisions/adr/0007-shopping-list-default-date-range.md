# ADR-0007: Shopping list default date range

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

When a user navigates to the Shopping List view, the grocery list is generated
automatically for a default date range before the user makes any adjustments
(FR-027, US-053 / POL-006). The requirement specifies auto-generation on navigation
but does not define the default window. The chosen default affects what the user
sees on first open and how well it aligns with their actual shopping intent.

The date range is fully adjustable via a from–to date picker (US-049 / FR-028), so
the default is a starting point only — not a constraint. The Meal Planner uses
ISO week navigation (Mon–Sun), and the Shopping List is expected to feel consistent
with it (US-048).

## Decision

We will default the Shopping List date range to the current ISO week (Monday through
Sunday). This mirrors the Meal Planner's week model and provides a predictable,
consistent reference frame. Users who open the Shopping List late in the week and
want to plan ahead simply adjust the date range to the next ISO week using the
existing date picker. No additional UI is required in MVP1.

## Alternatives considered

### next_7_days_from_today
Default range is today through today+6. Always forward-looking, which is arguably
the most useful default for actual shopping. Rejected because it creates an
inconsistency with the Meal Planner's ISO week model — the same plan looks
different depending on which day of the week the user opens the Shopping List,
making it harder to cross-reference the two views.

### current_plus_next_week
Default range covers both the current and next ISO week (14 days). Useful for
users who shop in bulk once a fortnight. Rejected because it may surface meals
not yet planned in the next week, creating empty lines and noise in the grocery list
for a user who has only planned the current week.

## Consequences

### Positive
- The default is consistent with the Meal Planner's week navigation model, reducing
  cognitive switching between the two views.
- Predictable: the default is always the same Monday–Sunday window regardless of
  which day of the week the user opens the view.

### Negative
- A user who opens the Shopping List on a Thursday or Friday will see a list
  dominated by meals already eaten that week. They must manually adjust the range
  to the next week, which adds one interaction. This friction is mitigated by the
  immediate date picker availability (FR-028).

### Neutral
- A "Next week" quick-select shortcut alongside the date picker would eliminate
  the late-week friction without changing the default. This is a small UX
  improvement deferred to v1.1 — added to the backlog as a candidate.
- The date picker should pre-fill the from/to inputs with the current ISO week
  boundaries (Monday 00:00 and Sunday 23:59) on every fresh navigation to the view.

## References

- DEC-003 (resolved by this ADR)
- CTX-005 (Shopping List — owns the date range state)
- FR-027 (auto-generation on navigation)
- FR-028 (user-adjustable date range)
- POL-006 (auto-generation policy)
- US-049, US-053 (stories driving this behaviour)

## History

- 2026-06-22: Created — current ISO week adopted as default for consistency with
  Meal Planner; "Next week" quick-select noted as v1.1 backlog candidate.
