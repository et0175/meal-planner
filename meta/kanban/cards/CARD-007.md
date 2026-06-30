# CARD-007: Shopping List service (Python)

**Status:** done
**Priority:** P2
**Category:** feature
**Estimate:** 3d
**Revision pending:** false
**Skill:** python-pro
**TDD:** —
**Branch:** card/007-shopping-list-service
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-4
**Depends on:** CARD-005
**Review score:** —
**Started:** 2026-06-29T00:00:00Z
**Closed:** 2026-06-29T00:00:00Z
**Actual:** 3d
**Merge commit:** —
**Blocked by:** —

## What to implement

Python Shopping List service (CTX-005, COMP-020–023):

**List generation (COMP-020):**
- `GET /shopping` — auto-generate shopping list on navigation using default date range: current ISO week Mon–Sun (ADR-0007); emit EVT-020
- `POST /shopping/generate` — (re)generate for explicit from–to date range; reject from_date > to_date (422, INV-011)
- Aggregation logic: fetch plan assignments from Planning service for the date range; sum quantities per product; group by product category
- Single active list per user — upsert model (ADR-0008): generating a new list replaces the previous one

**Staleness detection (COMP-021, ADR-0003):**
- Listen for plan events: EVT-012 (PlanAssignmentUpdated), EVT-013 (PlanAssignmentRemoved), EVT-014 (PlanAssignmentMoved)
- On any such event where the affected assignment falls within the current list's date range → mark list stale (emit EVT-023, INV-012)
- `POST /shopping/refresh` — regenerate from current plan; emit EVT-021; clear stale flag

**PDF export (COMP-022):**
- `POST /shopping/export/pdf` — generate PDF grouped by category; omit empty categories; emit EVT-022; must complete in < 3 s (NFR-004)

**PostgreSQL schema (COMP-023):**
- `shopping_lists`, `shopping_list_items` tables + migrations
- Upsert on generate: delete existing items, insert new items for same user (ADR-0008)

**Performance:**
- List generation must complete in < 500 ms for a fully planned 31-day range (NFR-003)
- Benchmark test at 31 days × 4 meal slots × 5 items per slot

Gate: list generates in < 500 ms for a fully planned 2-week range; stale indicator appears on plan change; PDF downloads correctly with empty categories omitted.

## Acceptance criteria

**FR-027 — Auto-generate on navigation (ADR-0007)**
- AC-070: navigate to Shopping List with assignments in default range → EVT-020 + list displayed immediately
- AC-071: no plan assignments → empty list (no error)

**FR-028 — Custom date range**
- AC-072: from=2026-07-01 to=2026-07-07 → list reflects only that range
- AC-073: from_date after to_date → 422 (INV-011)

**FR-029 — Aggregate and group**
- AC-074: Oats 100 g Mon + 50 g Tue → Oats 150 g under Grains
- AC-119: empty plan for range → empty list (no error)

**FR-030 — Staleness (ADR-0003)**
- AC-075: plan assignment changes → list marked stale, "Refresh" indicator shown (POL-002)
- AC-076: click "Refresh" → EVT-021 + list regenerated
- AC-103: EVT-012 (PlanAssignmentUpdated) within range → list stale (EVT-023) (POL-003, INV-012)
- AC-104: EVT-013 (PlanAssignmentRemoved) within range → list stale (POL-004)
- AC-105: EVT-014 (PlanAssignmentMoved) assignment moves outside range → list stale (POL-005)

**FR-031 — PDF export**
- AC-077: generated list → EVT-022 + print dialog within 3 s
- AC-120: empty list → empty-list PDF (no error)

## Architecture context

- **FR:** FR-027, FR-028, FR-029, FR-030, FR-031
- **NFR:** NFR-003 (generation < 500ms for 31-day range), NFR-004 (PDF < 3s)
- **ADR:** ADR-0003 (check-on-read staleness), ADR-0007 (default Mon–Sun ISO week range), ADR-0008 (single active list per user, upsert)
- **Components:** COMP-020 (ShoppingListGenerator), COMP-021 (StalenessService), COMP-022 (ShoppingListPdfExport), COMP-023 (ShoppingListDB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

Implementation complete (2026-06-29):

- DB: `shopping_lists` (unique per user, ADR-0008) + `shopping_list_items` (aggregated by product_id + unit)
- Alembic migration 0001 created; `env.py` wired to `Base.metadata`
- Generator: concurrent Planning calls (asyncio.gather per ISO week) + concurrent Catalog calls for category enrichment
- Aggregation by `(product_id, unit)` — different units kept separate; same product same unit summed
- Staleness: `is_stale` flag; set via `POST /shopping/events/plan-changed` (event-bus stub); cleared on generate/refresh
- PDF: reportlab, grouped by category (alphabetical), "Uncategorized" last, empty categories omitted (AC-120)
- 32 tests all green: generator, staleness, PDF, performance (NFR-003 31-day benchmark << 500ms, NFR-004 PDF < 3s)
- Key decision: `GET /shopping` returns existing list if present (does not always regenerate); generates only on first access
- FastAPI 0.138: HTTPBearer returns 401 (not 403) for missing credentials — tests accept both
- Index fix: `list_id` column in `shopping_list_items` uses `index=False` to avoid duplicate with `__table_args__` explicit Index
