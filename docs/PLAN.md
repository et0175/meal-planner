# Catalog Service — Implementation Plan (CARD-003)

## Layers (ordered)

- [x] Read card + ADRs
- [ ] DB models (`db/models.py`) — products, product_units, nutrition_per_100g, week_flags
- [ ] DB engine (`db/engine.py`) — AsyncSession factory
- [ ] Alembic migration — initial schema + index on products.name
- [ ] Pydantic schemas — query, authoring, weekflag
- [ ] Query service + router — GET /products, GET /products/:id
- [ ] Authoring service + router — POST, PUT, DELETE /products
- [ ] Weekflag service + router — PUT /products/:id/week-flag
- [ ] Scheduler — Monday 00:00 rollover (APScheduler)
- [ ] Auth middleware usage — verify_token for all protected endpoints
- [ ] main.py — register routers, lifespan, scheduler start
- [ ] requirements.txt — add aiosqlite, apscheduler, httpx
- [ ] Tests — all AC-* covered (conftest with SQLite in-memory)
- [ ] pytest.ini
- [ ] ruff + mypy clean
- [ ] Commit

## Key decisions

- Auth: HTTP call to Identity service via `IDENTITY_SERVICE_URL` env var (shared pattern)
- Week flags: stored in `week_flags` table keyed by (product_id, user_id); upsert on set
- Flag rollover: APScheduler CronTrigger (Monday 00:00 UTC), runs inside app lifespan
- Soft-delete: `is_deleted=True` on products; all queries filter it out
- Owner check: `owner_id` null = global product → 403 on any edit/delete attempt
- Unit limit: check count before insert, raise 422 on 11th (INV-004)
- Product limit: check count before insert, raise 409 on 501st (INV-007)
- Negative nutrition: Pydantic `ge=0` validators (INV-005)
- Search: `ilike` on products.name with index for NFR-002
- Sorting: protein, calories, name, category — query param
- Week flag filter: supports `?week_flag=this_week&user_id=X` for ADR-0002
- Tests: aiosqlite in-memory, monkeypatch verify_token for auth

## Risks

- APScheduler async compatibility — use AsyncIOScheduler
- mypy strict with SQLAlchemy Mapped types — use `from __future__ import annotations`
- aiosqlite does not support ARRAY columns — use JSON for diet_tags in tests
- Dialect-specific: use `JSON` (not `ARRAY`) for diet_tags so tests run on SQLite
