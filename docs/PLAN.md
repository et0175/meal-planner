# Planning Service — Implementation Plan (CARD-005)

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
