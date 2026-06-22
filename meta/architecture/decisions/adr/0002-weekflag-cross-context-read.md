# ADR-0002: WeekFlag cross-context read strategy

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The Meal Planner summary panel must surface all products the user has flagged "This
week" (US-030 / FR-034). The WeekFlag is an attribute of the Product aggregate
(AGG-002) owned by the Product Catalog context (CTX-003). The Meal Planning context
(CTX-004) needs this data at render time but does not own the Product aggregate.

This is a cross-context read dependency (CTXREL-006). The two natural approaches are
a synchronous query from CTX-004 into CTX-003's API at render time, or an
event-sourced local projection within CTX-004 kept up to date via EVT-009
(ProductWeekFlagSet) and EVT-010 (NextWeekFlagsPromoted).

NFR-002 requires search/filter responses within 200ms for a catalogue of up to
10,000 items. The planner summary panel load must meet this target. CON-002 constrains
the backend to a Python REST service with no event bus infrastructure in MVP1.

## Decision

We will resolve the WeekFlag cross-context read by having Meal Planning issue a
synchronous REST query to the Product Catalog API at planner summary panel render
time. The query fetches only the current user's "This week" flagged products
(a narrow, indexed lookup). This satisfies NFR-002 in practice — the result set is
small (bounded by the user's flagged items, not the full catalogue) and the query
is a single indexed read. The event-sourced cache approach is deferred to v1.1 if
latency or availability data warrants it.

## Alternatives considered

### event_sourced_cache
Meal Planning subscribes to EVT-009 (ProductWeekFlagSet) and EVT-010
(NextWeekFlagsPromoted) and maintains a local read projection of flagged products
within CTX-004. This provides resilience (planner loads even if Product Catalog is
temporarily unavailable) and eliminates the synchronous cross-context call. Rejected
for MVP1 because it requires event delivery infrastructure that does not exist yet
(see DEC-009), a bootstrapping procedure for the projection on first deploy, and
eventual-consistency handling in the UI — all of which add material complexity for a
case where the result set is small and the query is cheap.

## Consequences

### Positive
- No additional infrastructure required beyond the existing REST API contract
  between CTX-003 and CTX-004.
- Data is always consistent at read time — no stale projection risk.
- Implementation is straightforward: one GET endpoint on the Product Catalog service,
  one call from the Meal Planning service on panel load.

### Negative
- Meal Planning has a runtime availability dependency on Product Catalog: if
  Product Catalog is down, the planner summary panel cannot show flagged products.
  For an MVP1 single-server deployment this risk is low but non-zero.
- The synchronous coupling between CTX-003 and CTX-004 is a mild DDD boundary
  violation that will need to be refactored to an event-sourced cache if the system
  scales to multi-instance deployment with independent availability targets.

### Neutral
- The Product Catalog service must expose a GET endpoint such as
  `GET /products?week_flag=this_week&user_id={id}` (or equivalent) that returns
  only flagged products for the current user. This endpoint should be indexed on
  (user_id, week_flag) for the NFR-002 target to be reliably met.
- If latency measurements in production show this call contributing meaningfully
  to planner load time, the event-sourced cache (rejected above) is the natural
  upgrade path — the ADR should be revisited at that point.

## References

- DEC-008 (resolved by this ADR)
- CTX-003 (Product Catalog — data owner)
- CTX-004 (Meal Planning — consumer)
- CTXREL-006 (context map relationship this decision governs)
- NFR-002 (search/filter response < 200ms)
- FR-034 (week-flag planner auto-population)
- US-030 (story driving this cross-context dependency)

## History

- 2026-06-22: Created — sync REST query adopted for MVP1 simplicity; event-sourced
  cache deferred to v1.1 pending scale evidence.
