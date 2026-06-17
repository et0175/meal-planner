# CARD-005: Product browsing — list, filter, search

**Status:** ready
**Priority:** P1
**Category:** feature
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/005-product-browsing
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2
**Depends on:** CARD-004
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the product browsing surface: paginated list with full nutrition display, category filter, and name search.

**Scope:**
- **COMP-001 Product Catalog Service (write path already from CARD-004; read path for list/filter/search here):**
  - `ListProducts(page, pageSize, category?, query?)` — paginated, returns products with full nutrition summary
  - `FilterByCategory(category)` — returns matching products; empty category returns all
  - `SearchProducts(query)` — full-text match on product name; empty results return `[]` + HTTP 200 (not 404)
- **UI — Product list page:**
  - Products displayed as list or cards with toggle (US-PA-004 reference pattern)
  - Inline nutrition columns: calories, protein, fat, carbs
  - Filter panel (category dropdown), search input (live or on-submit)
  - Pagination controls
- **NFR-003:** p95 product search latency ≤ 500ms at 50 concurrent users / 50k products — add an index on product name in COMP-008 if not already present

## Acceptance criteria

**FR-001** — Paginated list with nutrition:
- Given: 25 products, page 1 size 10 → 10 products returned each with nutrition fields (AC-001)
- Given: no products → empty array + HTTP 200 (AC-002)
- Given: page 4 of 25 products (size 10) → empty array + HTTP 200 (AC-003)

**FR-002** — Category filter:
- Given: 5 dairy + 10 vegetables, filter "dairy" → exactly 5 products all dairy (AC-004)
- Given: filter cleared → all products returned (AC-005)
- Given: filter "exotic" (no products) → empty array + HTTP 200 (AC-006)

**FR-003** — Search:
- Given: products "Apple", "Apricot", "Banana", search "app" → Apple and Apricot in results; Banana absent (AC-007)
- Given: search "xylophone" → empty array + HTTP 200 (AC-008)

**NFR-003** — Performance:
- Product search with name index: measure or note p95 target of ≤ 500ms

## Architecture context

- **FR:** FR-001, FR-002, FR-003
- **NFR:** NFR-002 (ownership — not applicable to browse), NFR-003 (search latency)
- **ADR:** ADR-0001 (OFF data, already imported)
- **Components:** COMP-001 (Product Catalog Service), COMP-006 (Catalog Read Repository — read path), COMP-008 (Catalog DB + name index)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
