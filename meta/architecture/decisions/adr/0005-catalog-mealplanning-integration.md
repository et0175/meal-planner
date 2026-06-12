# ADR-0005: Catalog notifies Meal Planning via in-process call for MVP1

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-005, NFR-005, CON-001, CTX-001, CTX-004, POL-002, EVT-004, EVT-013, CMD-024

---

## Context

When a user marks a product or recipe as "selected for the current week" (EVT-004, EVT-013 in the Catalog context), the Meal Planning context must react by adding the item to the weekly summary pool (CMD-024, POL-002). This is a cross-context side-effect that must be triggered reliably and feel immediate to the user — the summary pool should update in the same interaction as the mark action.

Three integration patterns were evaluated: an internal event bus with published-language events, a synchronous API call from Catalog to Meal Planning, and an in-process domain service call within the MVP1 monolith.

MVP1 is a web-only monolith deployed as a single service (CON-001). The solution must require no additional infrastructure beyond the application itself.

---

## Decision

**Handle POL-002 as an in-process domain service call. After the `MarkProductForWeek` or `MarkRecipeForWeek` command completes in the Catalog context, the application layer invokes a named boundary interface (e.g. `WeeklySelectionSyncService`) that triggers `AddItemToWeeklySummary` in the Meal Planning context within the same process and transaction.**

The boundary interface must be defined as an explicit abstraction (interface/port) in the Catalog context layer, with the Meal Planning implementation injected at the composition root. This keeps the coupling contained and provides a named extraction point for future service separation.

---

## Consequences

### Positive

- **Immediate consistency** — the summary pool reflects the mark action in the same request; no lag visible to the user.
- **Zero infrastructure overhead** — no event broker, no outbox pattern, no subscription setup required for MVP1.
- **No cascading failure risk** — there is no separate service to be down; the call is in-process.
- **Named extraction point** — the `WeeklySelectionSyncService` interface defines the contract that would become an event or API integration when contexts are separated into services. The refactor surface is small.

### Negative

- **Code-level coupling** — Catalog's application layer depends on a Meal Planning interface at the composition root. This is a deliberate and bounded coupling, but it must be enforced not to leak domain logic across the boundary.
- **Harder to extract later than an event-bus design** — when contexts are eventually separated, the in-process call must be replaced with an async event or sync API. This is a one-time refactor, scoped to the composition root and the boundary interface implementation.
- **Shared transaction scope** — if the Meal Planning side of the call fails, it rolls back the Catalog mark action too (or requires explicit error handling). The failure policy must be defined: most likely, log and continue so the mark action always succeeds even if summary sync fails.

### Neutral

- The event-bus pattern (Option A) remains the target architecture for a multi-service deployment. This ADR documents a deliberate MVP1 shortcut, not a permanent design choice.
- POL-002 is the only cross-context policy in MVP1; the in-process approach does not set a precedent for a general integration style.

---

## Alternatives considered

**Event bus with customer-supplier published language** — rejected for MVP1. Requires an event broker (or outbox table + poller), subscription configuration, and introduces eventual consistency. The summary pool lagging behind the mark action by even a few hundred milliseconds would feel broken for a direct-manipulation UI. Correct target architecture for multi-service deployment; revisit post-MVP1.

**Synchronous API call from Catalog to Meal Planning** — rejected. Violates the DDD principle that an upstream supplier context should not depend on a downstream consumer. Introduces cascading failure: if Meal Planning's module is degraded, the mark action fails. No advantage over the in-process call for a monolith.
