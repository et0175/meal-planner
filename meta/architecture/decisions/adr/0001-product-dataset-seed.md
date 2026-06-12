# ADR-0001: Pre-seeded product database uses OpenFoodFacts

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-001, CON-003, EXT-002

---

## Context

The Product Analyser module requires a pre-seeded product database with nutritional breakdown per product (FR-001). Users can extend the catalog with custom products (FR-004), but the baseline dataset must cover common foods without requiring manual entry.

Three dataset sources were evaluated: USDA FoodData Central, OpenFoodFacts, and a custom-curated dataset.

The app targets Ukrainian users first (Ukrainian language support confirmed by US-PC-002, CON-001 MVP1 is web). This makes geographic product coverage a primary selection criterion alongside data quality and licensing.

---

## Decision

**Use OpenFoodFacts as the pre-seeded product database, importing only products with complete core nutritional fields (calories, protein, fat, carbohydrates).**

A one-time (and periodically refreshable) bulk import pulls from the OpenFoodFacts dataset, filtered to entries that have all four core macro fields populated. This produces a smaller but trustworthy starting catalog. User-contributed custom products (FR-004) fill coverage gaps over time.

---

## Consequences

### Positive

- **Ukrainian and European product coverage** — OpenFoodFacts has active contributions from Eastern European communities, making it the only viable pre-seeded option for the target market.
- **Free and open** — licensed under ODbL; no licensing cost or usage cap.
- **Global breadth** — covers products from many countries; relevant as the app eventually expands beyond Ukraine.
- **Filterable import** — the filtered-import strategy (complete macros only) addresses data quality concerns at the seed stage. Incomplete entries are excluded from the seed but can be added by users later.
- **API available** — OpenFoodFacts provides a read API, enabling future delta syncs or on-demand lookups for products not in the local seed.

### Negative

- **Variable data quality** — community-maintained entries vary in accuracy. Filtering mitigates this at import time but does not eliminate stale or incorrect values already in the database.
- **Ongoing maintenance** — if the seed is refreshed periodically, a delta-import process must reconcile updated nutritional values against user edits to the same products.
- **Schema mapping required** — OpenFoodFacts uses its own field naming and unit conventions; a mapping layer is needed to normalize entries into the application's product data model.

### Neutral

- USDA FoodData Central remains a viable supplement for a future "core science reference" dataset (e.g., raw ingredients with lab-verified values), but is not needed for MVP1.
- The import pipeline (EXT-002) is a one-time or scheduled batch job; it is not on the user-facing critical path.

---

## Alternatives considered

**USDA FoodData Central** — rejected. High data quality and public domain, but US-centric product coverage. Ukrainian users would find most everyday products missing. Scientific rigor is irrelevant if the catalog does not match the target market's grocery reality.

**Custom-curated dataset** — rejected. Full quality control and Ukrainian-market targeting are attractive properties, but the manual effort and ongoing maintenance burden are not feasible for MVP1 with a small team.
