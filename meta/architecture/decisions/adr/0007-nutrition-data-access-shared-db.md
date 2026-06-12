# ADR-0007: Nutrition Tracking and Meal Planning access Catalog data via shared database read

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-007, NFR-003, NFR-005, CTX-001, CTX-003, CTX-004

---

## Context

Both Nutrition Tracking (CTX-003) and Meal Planning (CTX-004) need product and recipe nutritional data at runtime — to compute daily nutrition summaries (FR-026) and day-card nutrition totals (FR-031, FR-035), and to derive ingredient quantities for shopping list generation (FR-036). This data is owned by the Catalog context (CTX-001).

Three patterns were evaluated: shared database read, a Catalog read API, and snapshotting nutrition values into the consuming aggregates at write time.

MVP1 is a web-only monolith with a single database. The product database is seeded from OpenFoodFacts (ADR-0001); nutritional values are relatively stable but may be corrected over time.

---

## Decision

**Nutrition Tracking and Meal Planning query Catalog's product and recipe tables directly via the shared database. No API hop or data duplication is introduced for MVP1.**

Access is read-only from the perspective of CTX-003 and CTX-004. The Catalog context retains write ownership of all product and recipe nutritional fields. Cross-context queries are performed through clearly named repository methods (e.g. `CatalogReadRepository`) to mark the boundary and provide a seam for future extraction.

---

## Consequences

### Positive

- **Zero overhead** — no network call, no duplication, no synchronization logic. Nutrition data is always the current catalog value.
- **Corrected values propagate immediately** — if a product's nutritional data is fixed in the catalog (e.g. an OpenFoodFacts entry is updated), all existing logs and plans reflect the correction on next read.
- **Simplest implementation** — a single ORM query across tables; no projection infrastructure, no snapshot update policy to design.
- **Named seam for extraction** — `CatalogReadRepository` in each consuming context is the single extraction point if contexts are ever separated into services.

### Negative

- **Schema coupling** — changes to Catalog's product/recipe table schema affect CTX-003 and CTX-004 queries. Must be managed through disciplined schema migration and the named repository abstraction; direct SQL joins outside the repository are prohibited.
- **No point-in-time accuracy** — if a product's nutrition values change after a meal is logged or planned, historical entries reflect the new values rather than the original ones. Acceptable for a meal planning app; would not be acceptable for a clinical nutrition record.
- **Harder to extract to services** — when Catalog is separated, `CatalogReadRepository` must be replaced with a Catalog API call or a read-model subscription. This is a bounded, one-time refactor.

### Neutral

- At the scale of MVP1 (single user base, read-heavy nutrition queries), shared DB read performance is not a concern. Query optimization can be deferred.
- The snapshot alternative (Option C) remains viable as a future optimization if point-in-time accuracy becomes a product requirement (e.g. a "history" feature that shows what you ate and its nutrition as of that date).

---

## Alternatives considered

**Catalog read API (open host service)** — rejected for MVP1. Correct pattern for a multi-service architecture where Catalog is a separate deployable unit. In a monolith with a shared database, introducing an internal HTTP or function-call API boundary adds indirection with no benefit. Revisit when contexts are extracted.

**Nutrition snapshot in log and plan aggregates** — rejected. Copying nutrition values into MealLog and MealPlan entries at write time provides runtime independence and point-in-time accuracy, but introduces a stale-data problem (old errors are preserved), storage duplication, and requires a snapshot update policy (what happens when a product is corrected?). The added complexity is not justified by the benefit for a meal planning app where historical precision is not a core requirement.
