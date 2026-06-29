# Catalog Service — Claude context (CARD-003)

## Architecture decisions

- **Auth**: tokens validated by calling `GET /auth/session` on the Identity service (`IDENTITY_SERVICE_URL` env var). The `verify_token` FastAPI dependency is in `auth_middleware.py`. Tests override it via `app.dependency_overrides`.
- **diet_tags storage**: `JSON` column (not PostgreSQL `ARRAY`) so tests run on SQLite in-memory. The column stores a list of strings. Filtering uses SQLAlchemy's `.contains()`.
- **Week flag upsert**: the `week_flags` table stores one row per (product_id, user_id). `set_week_flag` does a select-then-update-or-insert pattern. Monday rollover: Step 1 promotes `next_week → this_week` (capturing the timestamp), Step 2 clears any `this_week` rows whose `updated_at` is still older than the rollover time.
- **Soft-delete**: `products.is_deleted = True`. All queries filter `is_deleted == False`. Hard deletes are never used.
- **INV-006**: global products have `owner_id = NULL`. Any edit/delete attempt by any user returns 403. User can only edit their own (non-null) products.
- **INV-004/007**: enforced in service layer (not DB). Unit limit checked at create time and at PUT time when units are replaced.
- **Scheduler**: APScheduler `AsyncIOScheduler` with `CronTrigger(day_of_week='mon', hour=0, minute=0, timezone='UTC')` started in `lifespan`.
- **mypy**: run with `--explicit-package-bases` to avoid module double-registration. APScheduler has no stubs — `[mypy-apscheduler.*] ignore_missing_imports = true` in `mypy.ini`.

## File map

- `main.py` — FastAPI app factory, router registration, APScheduler lifespan
- `auth_middleware.py` — `verify_token` dependency (HTTP call to Identity service)
- `db/models.py` — `Product`, `ProductUnit`, `NutritionPer100g`, `WeekFlag` ORM models
- `db/engine.py` — `AsyncEngine` / `AsyncSession` factory; `reset_engine()` for tests
- `db/migrations/env.py` — Alembic async migration runner
- `db/migrations/versions/0001_initial_schema.py` — initial schema migration
- `query/schemas.py` — read schemas: `ProductSummary`, `ProductDetail`, `ProductListResponse`
- `query/service.py` — `list_products`, `get_product`, `count_user_products`
- `query/router.py` — `GET /products`, `GET /products/:id`
- `authoring/schemas.py` — `CreateProductRequest`, `UpdateProductRequest`, `ProductResponse`
- `authoring/service.py` — `create_product`, `update_product`, `delete_product`; `UnitDict` TypedDict
- `authoring/router.py` — `POST /products`, `PUT /products/:id`, `DELETE /products/:id`
- `weekflag/schemas.py` — `SetWeekFlagRequest`, `WeekFlagResponse`
- `weekflag/service.py` — `set_week_flag`, `rollover_week_flags`
- `weekflag/router.py` — `PUT /products/:id/week-flag`
- `scheduler/jobs.py` — `run_weekly_rollover` async job
- `tests/conftest.py` — SQLite in-memory fixtures: `test_engine`, `db`, `client`, `client_user2`, `anon_client`
- `tests/test_query.py` — FR-010/011/012, NFR-002 tests
- `tests/test_authoring.py` — FR-013/014/032 tests
- `tests/test_weekflag.py` — FR-015 tests including rollover
- `seed.py` — idempotent seed with 5 realistic products
- `pytest.ini` — `asyncio_mode = auto`, testpaths = tests

## How to run tests

```bash
cd backend/catalog
python3 -m pytest tests/ -q
```

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./catalog.db` | PostgreSQL async URL for prod (`postgresql+asyncpg://...`) |
| `IDENTITY_SERVICE_URL` | `http://identity:8000` | Base URL of the Identity service for token validation |

## Constraints / invariants

- `INV-004`: max 10 units per product — enforced in `authoring/service.py:create_product` and `update_product`
- `INV-005`: all nutrition values >= 0 — enforced by Pydantic `ge=0` field validators in `NutritionIn`
- `INV-006`: only owner can edit/delete; global products (`owner_id=null`) → 403 always
- `INV-007`: max 500 user products per user — checked before insert in `create_product`
- `NFR-002`: `products.name` has a DB index (`ix_products_name`) for < 200 ms ilike search
- `ADR-0002`: `GET /products?week_flag=this_week&user_id=X` is the Planning service's read endpoint
- `ADR-0009`: Monday 00:00 UTC rollover via APScheduler CronTrigger
