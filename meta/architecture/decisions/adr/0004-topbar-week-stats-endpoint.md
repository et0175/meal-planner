# ADR-0004: Topbar week-stats widget endpoint design

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

The Navigation Shell (CTX-002) renders a topbar widget showing at-a-glance stats for
the current week's meal plan while the Planner module is active (US-012 / FR-009).
The widget displays at minimum: total planned kcal and count of planned assignments
for the selected week. Stats must update immediately when the user adds, edits, or
removes an assignment (no manual refresh — FR-009).

The widget is owned by CTX-002 (Navigation Shell) but the data lives in CTX-004
(Meal Planning). This cross-context read (CTXREL-011) must satisfy NFR-001 (initial
page load < 2s) and NFR-002 (responses < 200ms). CON-001 constrains the frontend to
Next.js; CON-002 constrains the backend to a Python REST service.

The two design options differ in where aggregation happens — backend or frontend —
and in how much data travels over the network on each planner page load.

## Decision

We will expose a dedicated lightweight summary endpoint on the Meal Planning service:
`GET /plan/summary?week={ISO_WEEK}`. The endpoint returns pre-aggregated stats
(total kcal, macro totals, total planned meals) for the requested week and user.
The Navigation Shell widget calls this endpoint on planner load and re-calls it after
any assignment mutation. This satisfies NFR-002 (the payload is a small JSON object,
not a full assignment list) and keeps aggregation logic on the backend where it can
be tested, cached, and evolved without frontend changes.

## Alternatives considered

### client_side_aggregation
The Navigation Shell fetches the full list of week assignments from an existing Meal
Planning endpoint and computes totals in the frontend topbar component. This avoids
adding a new endpoint but has three drawbacks: the network payload is proportional to
the number of assignments (potentially large for a fully planned week), aggregation
logic is duplicated between the frontend widget and any future server-side
report/export feature, and the response cannot be independently cached at a short TTL
without caching the full assignment list. Rejected in favour of the dedicated endpoint.

## Consequences

### Positive
- The network payload for every planner page load is a small, fixed-size JSON object
  rather than a variable-length assignment list, directly supporting NFR-001 and
  NFR-002.
- Aggregation logic lives in one place (the backend), making it straightforward to
  test and to extend (e.g. adding macro breakdown or diet-target percentage in v1.1)
  without touching the frontend.
- The endpoint can be cached with a short TTL (e.g. 5–10 seconds) at the HTTP layer,
  reducing database load when the topbar re-polls after rapid successive edits.

### Negative
- One additional API endpoint to design, document, and maintain. The Meal Planning
  service must implement aggregation logic that might otherwise have been deferred.
- The Navigation Shell now has an explicit runtime dependency on the Meal Planning
  service for every planner page load, not just when the user interacts with
  assignments. If Meal Planning is slow or unavailable, the topbar stats will be
  missing or stale.

### Neutral
- The endpoint should accept `week` as an ISO week parameter (e.g. `2026-W26`) to
  stay consistent with the week navigation model used in the Meal Planner views.
- The response shape should be versioned or kept additive so v1.1 can extend it
  (e.g. add `diet_target_pct`) without breaking the v1 frontend.
- The frontend widget should handle a failed or slow response gracefully — show a
  loading state rather than blocking the full planner render.

## References

- DEC-010 (resolved by this ADR)
- CTX-002 (Navigation Shell — consumer)
- CTX-004 (Meal Planning — data owner and endpoint provider)
- CTXREL-011 (context map relationship this decision governs)
- FR-009 (topbar reactive plan metrics)
- NFR-001 (page load < 2s)
- NFR-002 (response time < 200ms)
- US-012 (story driving this widget)

## History

- 2026-06-22: Created — dedicated summary endpoint adopted to minimise payload size
  and centralise aggregation logic on the backend.
