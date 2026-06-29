# CARD-004: Product Catalog UI (Next.js)

**Status:** done
**Priority:** P2
**Category:** feature
**Estimate:** 4d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/004-product-catalog-ui
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2#ui
**Depends on:** CARD-003
**Review score:** —
**Started:** 2026-06-29T00:00:00Z
**Closed:** 2026-06-29T00:00:00Z
**Actual:** 4d
**Merge commit:** aad18ab
**Blocked by:** —

## What to implement

Next.js Product Catalog UI (CTX-003, COMP-008–009 frontend):

**Category card view:**
- Grid of category cards; clicking a card filters to that category's products

**List / table view:**
- Toggle between card and list views
- Table columns: name, category, diet tags, calories, protein, fat, carbs per 100 g
- Sort by any column (client-side or via query param)
- Filter bar: category dropdown + diet-tag multi-select + name search input
- Empty state when no products match

**Product detail modal:**
- Macro pie chart (calories/protein/fat/carbs)
- Unit conversion table (base unit + alternative units with gram factors)
- Week flag toggle: None / This week / Next week

**Add / edit product form:**
- Fields: name, category, nutrition per 100 g (calories, protein, fat, carbs), up to 10 alternative units
- Client-side validation mirrors backend rules (empty name, negative values, 11 units)
- Edit and delete buttons visible only for own products; delete disabled for global products

## Acceptance criteria

**FR-010 — Browse**
- AC-024: card view → category cards; clicking reveals that category's products
- AC-025: list view → table with nutrition columns
- AC-026: no products → empty state shown

**FR-011 — Filter/search/sort**
- AC-027: filter by category → filtered list
- AC-028: filter by diet tag → filtered list
- AC-029: search by name (case-insensitive)
- AC-030: no results → empty list (no error)
- AC-031: sort by column → ordered list

**FR-012 — Product detail**
- AC-032: modal shows macro pie chart + unit conversion table
- AC-111: single-unit product → one-row table (no error)

**FR-013 — Add product (UI flow)**
- AC-033: valid form → product appears in catalog
- Client shows validation errors for negative nutrition, empty name

**FR-014 — Edit/delete (UI gating)**
- AC-039: edit own product → changes reflected
- AC-040/042: edit/delete controls hidden or disabled for others' and global products

**FR-015 — Week flag toggle**
- AC-043: set "This week" → product surfaces in planner
- AC-044: clear flag → removed from planner summary

## Architecture context

- **FR:** FR-010, FR-011, FR-012, FR-013, FR-014, FR-015
- **NFR:** NFR-013 (WCAG 2.1 AA contrast), NFR-014 (responsive ≥ 1280px)
- **ADR:** ADR-0002 (week-flag toggle calls backend, not local state)
- **Components:** COMP-008 (ProductQuery), COMP-009 (ProductAuthoring)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Implemented the full Product Catalog UI on branch `card/004-product-catalog-ui` (commit c2fa435). The products page replaces the placeholder stub with two views: a category card grid (default, AC-024) that groups products by category and switches to the list view on click, and a sortable table view (AC-025) with a filter bar supporting debounced name search, category dropdown, and diet-tag multi-select (AC-027–031). A product detail modal (AC-032, AC-111) renders an SVG donut macro chart (no external charting library), a unit conversion table, and a week flag toggle that calls PUT /products/:id/week-flag immediately per ADR-0009 (AC-043/044). The add/edit form (AC-033, AC-039) validates client-side (empty name, negative values, 11+ units) and gates edit/delete buttons to the owning account (AC-040/042). Loading, error, and empty states are implemented throughout. State is managed with `useReducer` for async fetch state (to comply with the `react-hooks/set-state-in-effect` ESLint rule). 76 RTL integration tests pass across 8 suites; Playwright e2e tests (catalog.spec.ts) cover all key flows with mocked API calls.
