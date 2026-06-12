# ADR-0006: Downstream contexts access Identity data via JWT claims

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-006, NFR-001, NFR-005, CTX-002, CTX-003, CTX-004

---

## Context

Nutrition Tracking (CTX-003) and Meal Planning (CTX-004) both need Identity data on every authenticated request: the `user_id` for ownership checks (INV-002, INV-005) and the calorie corridor (derived from weight, age, gender, diet preference, and macro split) for daily nutrition summaries and planning targets.

Three patterns were evaluated for how downstream contexts receive this data from the Identity context (CTX-002): embedding it in the JWT token, calling an Identity API per-request, or maintaining a local read-model projection fed by Identity events.

MVP1 is a web-only monolith. The solution must minimize infrastructure overhead while remaining correct.

---

## Decision

**Encode `user_id`, `diet_preference_id`, and `calorie_corridor` in the JWT access token issued by the Identity context. Downstream contexts read these claims directly from the token — no per-request call to Identity is made.**

**Mandatory rule:** the `UpdateUserProfile` command (and any other command that changes fields contributing to the calorie corridor) must invalidate the current access token and issue a fresh one as part of the same transaction. This eliminates the staleness window.

---

## Consequences

### Positive

- **Zero per-request latency** — no network or function call to Identity on the hot path.
- **No runtime dependency** — Nutrition Tracking and Meal Planning work correctly even if Identity's module is temporarily degraded, as long as tokens remain valid.
- **Zero infrastructure overhead** — no event bus, no projection store, no polling endpoint required.
- **`user_id` is always correct** — it never changes after account creation; no staleness concern.
- **Staleness eliminated by design** — the refresh-on-profile-update rule means the calorie corridor in the token is always current immediately after a profile change.

### Negative

- **Token payload grows** — calorie corridor and diet preference add a small amount of data to every token. Acceptable at MVP1 scale; worth monitoring if token size becomes a concern at high scale.
- **Refresh-on-update rule must be enforced** — if a future command changes calorie-corridor inputs (weight, macro split, diet preference) without triggering a token refresh, the downstream contexts will silently use stale values. This rule must be documented and enforced in code review.
- **Token refresh adds one round-trip on profile update** — minor UX cost; the profile-settings flow is rare and the extra call is imperceptible.

### Neutral

- If contexts are ever extracted into separate services (post-MVP1), this pattern still holds: the JWT is verified independently by each service without calling Identity. No architectural change required.
- The calorie corridor is a planning target, not a medical instrument. Brief staleness (which the refresh-on-update rule prevents in any case) would have no meaningful consequence.

---

## Alternatives considered

**Sync API per-request** — rejected. For a monolith, this is a function call rather than a network hop, so latency is not the primary concern. The issue is logical coupling: every request through CTX-003 and CTX-004 passes through Identity's module. A fault or regression in Identity propagates to all downstream contexts. No meaningful benefit over JWT for MVP1.

**Shared read model (event-driven projection)** — rejected. Requires an event bus and per-context projection stores to replicate two fields from Identity. Significant over-engineering for MVP1 where all contexts are deployed together. The pattern is appropriate when contexts run as independent services and must avoid runtime dependencies; that is not the case here.
