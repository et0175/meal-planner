# ADR-0009: WeekFlag rollover clear policy

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

POL-001 (PromoteNextWeekFlags) fires every Monday via the Scheduler actor (ACT-004).
It promotes all products where the user has set a "Next week" flag to "This week",
making them appear in the current week's planner summary (FR-034, EVT-010). The
policy does not specify what happens to the previous week's "This week" flags —
whether they are cleared atomically during promotion or left in place for the user
to manage manually.

The WeekFlag is an attribute of the Product aggregate (AGG-002, CTX-003). The planner
summary panel (CTX-004) reads "This week" flagged products at render time via the
sync query established in ADR-0002. Stale flags in the summary create noise for the
user without corresponding planner assignments.

## Decision

We will clear all existing "This week" flags for the user atomically before promoting
"Next week" flags, as part of the same Monday rollover transaction (POL-001). Each
week begins with a clean slate: only products explicitly flagged for the new week
(via "Next week" promotion or a fresh "This week" action during the week) appear in
the planner summary. This keeps the summary accurate without requiring the user to
manually housekeep stale flags.

## Alternatives considered

### carry_over_this_week
Existing "This week" flags are not cleared on rollover; only "Next week" flags are
promoted. Staple items the user plans every week would automatically persist in the
summary without re-flagging. Rejected because indefinite carry-over means the
planner summary accumulates every product the user has ever flagged "This week"
unless they actively clear them — a behaviour that becomes increasingly confusing
over time and is inconsistent with the weekly planning mental model.

## Consequences

### Positive
- The planner summary panel always reflects only the current week's explicitly
  chosen items, with no stale entries from prior weeks.
- The weekly planning flow has a clear rhythm: flag items for next week during the
  week; they appear on Monday; the summary is fresh.

### Negative
- Users who eat the same staple items every week must re-flag them as "Next week"
  each week (or use the "This week" flag directly during the week). There is no
  auto-repeat mechanism in MVP1.
- If the rollover job fails silently on a Monday, old flags will not be cleared and
  the following week's summary will contain stale items until the job succeeds.
  Operational monitoring of POL-001 is therefore important.

### Neutral
- The clear-then-promote sequence must be atomic per user to avoid a window where
  both old and new flags are absent from the summary (the user sees an empty
  summary mid-rollover). A single database transaction per user achieves this.
- A "repeat every week" flag on products is a natural v1.1 enhancement for users
  with fixed weekly staples — noted as a backlog candidate.

## References

- DEC-005 (resolved by this ADR)
- AGG-002 (Product aggregate — owns WeekFlag)
- POL-001 (PromoteNextWeekFlags policy)
- EVT-010 (NextWeekFlagsPromoted event)
- FR-034 (week-flag planner auto-population)
- ADR-0002 (sync query that reads "This week" flags at render time)

## History

- 2026-06-22: Created — auto-clear on rollover adopted for clean weekly slate;
  "repeat every week" staple flag noted as v1.1 backlog candidate.
