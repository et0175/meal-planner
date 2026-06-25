# CARD-003: Product Catalog service (Python)

**Status:** ready
**Priority:** P1
**Category:** feature
**Estimate:** 5d
**Revision pending:** false
**Skill:** python-pro
**TDD:** —
**Branch:** card/003-product-catalog-service
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-2
**Depends on:** CARD-001
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Python Product Catalog service (CTX-003, COMP-008–012):

**Product query (COMP-008):**
- `GET /products` — list products with filters (category, diet tag, name search, sort); search must return in < 200 ms at 1,000 products (NFR-002)
- `GET /products/:id` — product detail with nutrition per 100 g and unit-conversion table
- Support category-card view (grouped by category) and flat list/table view

**Product authoring (COMP-009):**
- `POST /products` — add user product: name, category, nutrition per 100 g, up to 10 alternative units with gram-conversion factors; enforce: no empty name (422), no negative nutrition (422, INV-005), max 500 user products (409, INV-007), max 10 units (422, INV-004); emit EVT-006
- `PUT /products/:id` — edit own product only; deny other users' and global products with 403 (INV-006); emit EVT-007
- `DELETE /products/:id` — soft-delete own products only; deny global products with 403 (INV-006); emit EVT-008

**Week flag (COMP-010):**
- `PUT /products/:id/week-flag` — set flag to `this_week` / `next_week` / `none`; emit EVT-009
- `GET /products?week_flag=this_week&user_id=…` — filtered endpoint used by Planning service (ADR-0002: sync REST query at render time)

**Flag rollover scheduler (COMP-011):**
- Cron job fires every Monday 00:00 (ADR-0009): promotes all `next_week` flags to `this_week`; clears `this_week` flags from prior week; emit EVT-010

**PostgreSQL schema (COMP-012):**
- `products`, `product_units`, `week_flags` tables + migrations
- Index on `products.name` for < 200 ms search (NFR-002)

Gate: search returns in < 200 ms at 1,000 products; week flags persist and promote correctly on Monday rollover.

## Acceptance criteria

**FR-010 — Browse**
- AC-024: card view → category cards; clicking reveals that category's products
- AC-025: list view → table with nutrition columns
- AC-026: no products → empty state (no error)

**FR-011 — Filter/search/sort**
- AC-027: filter by category "Dairy" → only Dairy products
- AC-028: filter by diet tag "Vegan" → only Vegan products
- AC-029: search "chick" → case-insensitive name match
- AC-030: search "zzz" → empty list (no error)
- AC-031: sort by "Protein" descending → highest-protein first

**FR-012 — Product detail**
- AC-032: product detail card → macro pie chart data + unit conversion table
- AC-111: single-unit product → pie chart + one-row unit table (no error)

**FR-013 — Add product**
- AC-033: valid payload → product persisted, EVT-006 emitted
- AC-034: calories = -10 → 422 (INV-005)
- AC-035: empty name → 422
- AC-036: 501st product → 409 (INV-007)
- AC-037: 11 alternative units → 422 (INV-004)
- AC-038: anonymous request → 401

**FR-014 — Edit/delete**
- AC-039: edit own product → updated, EVT-007 emitted
- AC-040: edit another user's product → 403 (INV-006)
- AC-041: delete own product → soft-deleted, EVT-008 emitted
- AC-042: delete global product → 403 (INV-006)

**FR-015 — Week flags (ADR-0002, ADR-0009)**
- AC-043: set "This week" → EVT-009 emitted, appears in planner
- AC-044: clear flag → EVT-009 emitted, removed from planner summary
- AC-045: Monday 00:00 scheduler fires → "Next week" flags promoted, EVT-010 emitted
- AC-112: "Next week" flag mid-week → not shown in current week summary

**FR-032 — Unit limit**
- AC-078: 10 units already → 11th unit rejected 422 (INV-004)

## Architecture context

- **FR:** FR-010, FR-011, FR-012, FR-013, FR-014, FR-015, FR-032
- **NFR:** NFR-002 (search < 200ms at 1,000 products), NFR-010 (max 500 user products), NFR-011 (max 10 units per product)
- **ADR:** ADR-0002 (week-flag sync REST query from CTX-004), ADR-0009 (Monday rollover auto-promote)
- **Components:** COMP-008 (ProductQuery), COMP-009 (ProductAuthoring), COMP-010 (WeekFlagService), COMP-011 (WeekFlagScheduler), COMP-012 (CatalogDB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Implementation complete. All 35 tests pass. ruff and mypy clean.

Key decisions made:
- `diet_tags` stored as JSON column (not PG ARRAY) — keeps tests running on SQLite in-memory
- Week flag upsert uses select-then-update-or-insert (no UPSERT SQL) for portability
- Monday rollover: Step 1 promotes next_week→this_week (captures timestamp), Step 2 clears stale this_week rows by comparing updated_at < now
- Scheduler: APScheduler `AsyncIOScheduler` with CronTrigger; started in FastAPI lifespan
- mypy run with `--explicit-package-bases` (workaround for service-as-root-package pattern)
- `apscheduler` has no stubs — added `[mypy-apscheduler.*] ignore_missing_imports = true` to repo mypy.ini
- Auth dependency overridden in tests via `app.dependency_overrides[verify_token]`

Commit: babda03
