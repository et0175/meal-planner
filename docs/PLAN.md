# Shopping List Service — Implementation Plan (CARD-007)

## Layers (ordered)

- [ ] DB models (`db/models.py`) — shopping_lists, shopping_list_items
- [ ] DB engine (`db/engine.py`) — AsyncSession factory (same pattern as planning)
- [ ] Alembic migration env.py — wire models metadata
- [ ] Alembic migration 0001 — initial schema (shopping_lists + shopping_list_items)
- [ ] Auth middleware (`auth_middleware.py`) — same pattern as planning/catalog
- [ ] Pydantic schemas (`generator/schemas.py`) — request/response models
- [ ] Planning client (`generator/planning_client.py`) — HTTP calls to planning (with token forwarding)
- [ ] Catalog client (`generator/catalog_client.py`) — category lookup (best-effort)
- [ ] Generator service (`generator/service.py`) — aggregation logic, upsert
- [ ] Generator router (`generator/router.py`) — GET /shopping, POST /shopping/generate
- [ ] Staleness router (`staleness/router.py`) — POST /shopping/refresh, POST /shopping/events/plan-changed
- [ ] PDF service (`pdf/service.py`) — reportlab grouped by category
- [ ] PDF router (`pdf/router.py`) — POST /shopping/export/pdf
- [ ] main.py — register all routers, lifespan
- [ ] requirements.txt — add aiosqlite, httpx, reportlab, pytest deps
- [ ] pytest.ini
- [ ] Tests — conftest + test_generator + test_staleness + test_pdf + test_performance
- [ ] CLAUDE.md + README.md
- [ ] Commit

## Key decisions

- Auth: HTTP call to Identity service (IDENTITY_SERVICE_URL env var), same pattern as planning
- Planning client: GET /plan?week=YYYY-WW with Bearer token forwarding; concurrent asyncio.gather for multiple weeks
- Catalog client: GET /products/{id} for each unique product to get category; best-effort, falls back to None
- Single active list per user (ADR-0008): upsert — delete items + update list on each generate
- Staleness (ADR-0003): is_stale flag on shopping_list; set via POST /shopping/events/plan-changed (event bus stub)
- GET /shopping: return existing list if it exists, else generate for current ISO week
- POST /shopping/generate: always regenerate for explicit date range
- POST /shopping/refresh: regenerate using stored from_date/to_date, clear stale
- PDF: reportlab, group by category, omit empty categories, no external calls
- INV-011: from_date <= to_date enforced in Pydantic model_validator (422)
- Tests: aiosqlite in-memory, mock planning + catalog HTTP calls, mock verify_token

## Risks

- Planning service doesn't return category → must call catalog separately for each unique product
- Token forwarding: shopping must pass the user's bearer token to planning
- Concurrent week calls to planning: asyncio.gather for 31-day range (5 weeks max)
- Catalog concurrent calls: asyncio.gather per unique product_id, fall back to None on error
- Performance (NFR-003): 500ms budget includes DB upsert; index on shopping_list_items.list_id is critical
- Performance test with mocked services will be fast; warn if unmocked calls would exceed budget

---

# Planning Service — Implementation Plan (CARD-005) [DONE]

## Layers (ordered)

- [x] Read card + ADRs
- [x] DB models (`db/models.py`) — meal_plan_assignments, nutrition_targets, tracking_entries
- [x] DB engine (`db/engine.py`) — AsyncSession factory
- [x] Alembic migration env.py — wire models metadata
- [x] Alembic migration 0001 — initial schema
- [x] Auth middleware (`auth_middleware.py`) — same pattern as catalog
- [x] Pydantic schemas — mealplan, target, summary, pdf, logplan
- [x] WeekFlagReader service — HTTP call to catalog with graceful fallback
- [x] MealPlan service + router — assignment CRUD, search
- [x] Target service + router — GET/PUT /plan/target
- [x] Summary service + router — GET /plan/summary
- [x] LogPlan service + router — POST /plan/log/day|week|item
- [x] PDF service + router — POST /plan/export/pdf (reportlab)
- [x] main.py — register all routers, lifespan
- [x] requirements.txt — add aiosqlite, httpx, reportlab
- [x] pytest.ini
- [x] Tests — conftest + test_mealplan + test_target + test_log + test_pdf + test_summary
- [x] seed.py
- [x] CLAUDE.md + README.md
- [x] ruff + mypy clean
- [x] Commit

## Key decisions

- Auth: HTTP call to Identity service (IDENTITY_SERVICE_URL env var)
- Week flags: sync REST call to Catalog (CATALOG_SERVICE_URL env var), graceful fallback to []
- Assignment nutrition stored inline (kcal_per_unit etc.) for PDF/summary without catalog call
- product_name stored inline in assignments for PDF without catalog call
- INV-008: quantity > 0 enforced in Pydantic validator
- INV-010: max 10,000 total assignments per user, enforced in service layer (409)
- INV-013: target_calories >= 0 enforced in Pydantic validator
- INV-014: NutritionTarget unique per user (UPSERT on PUT)
- Log-from-plan: writes to tracking_entries table in planning DB (ADR-0001)
- PDF: reportlab (< 3s NFR-004), no external calls
- logplan/ package (not logging/ to avoid shadowing stdlib)
- Tests: aiosqlite in-memory, monkeypatch verify_token + catalog calls
- Week param: ISO YYYY-WW string; "current" or missing → current ISO week

## Risks

- stdlib logging shadowing: do NOT use planning/logging/ — use logplan/
- Enum in SQLite: SQLAlchemy Enum works as VARCHAR on SQLite (no CREATE TYPE)
- reportlab import: add to requirements.txt; no native dep issues on slim Python image
- Cross-service isolation: no cross-DB joins; product data copied inline to assignments
