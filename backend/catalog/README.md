# Product Catalog Service

Manages products, their nutritional data, unit conversions, and week-flag tagging for meal planning. Part of the Meal Forge backend.

## What it does

- CRUD for user-owned products (name, category, diet tags, nutrition per 100 g, unit conversion table)
- Read-only access for global/shared products (created via seed or admin tooling)
- Week flag system (`this_week` / `next_week` / `none`) per user per product; supports the Planning service's week render (ADR-0002)
- Monday 00:00 UTC cron job that promotes `next_week` flags to `this_week` and clears stale flags (ADR-0009)

## API endpoint table

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/products` | Public | List products. Filters: `category`, `diet_tag`, `search`. Sort: `sort_by` + `sort_dir`. Week flag: `week_flag` + `user_id` |
| `GET` | `/products/{id}` | Public | Product detail with nutrition and unit conversion table |
| `POST` | `/products` | Bearer | Create user product. Enforces INV-004/005/007 |
| `PUT` | `/products/{id}` | Bearer | Update own product. 403 on global/other-user products |
| `DELETE` | `/products/{id}` | Bearer | Soft-delete own product. 403 on global products |
| `PUT` | `/products/{id}/week-flag` | Bearer | Set week flag (`this_week`, `next_week`, `none`) |
| `GET` | `/health` | Public | Health check |

### Query parameters for `GET /products`

| Param | Type | Description |
|-------|------|-------------|
| `category` | string | Exact category match |
| `diet_tag` | string | Exact diet tag match (e.g. `Vegan`) |
| `search` | string | Case-insensitive search on the locale-resolved name (ilike) |
| `sort_by` | `name` \| `category` \| `protein` \| `calories` | Sort field (default: `name`); `name` sorts the resolved locale name |
| `sort_dir` | `asc` \| `desc` | Sort direction (default: `asc`) |
| `week_flag` | `this_week` \| `next_week` \| `none` | Filter by flag (requires `user_id`) |
| `user_id` | int | User whose flags to filter by (for Planning service ADR-0002) |
| `locale` | string (BCP-47) | Language for product names; falls back to English when missing (default: `en`, FR-037) |
| `limit` | int (1–200) | Page size (default: `50`) |
| `offset` | int (≥0) | Page offset (default: `0`) |

`GET /products/{id}` also accepts `locale`. `total` in the list response is the full match count, not the page size. `POST`/`PUT /products` accept an optional `locale` (default `en`) — the authored name is stored as that locale's translation (CON-007: user products are single-locale).

## Setup and local dev

### Requirements

- Python 3.12
- PostgreSQL 16 (or SQLite for tests via aiosqlite)

### Install dependencies

```bash
cd backend/catalog
pip install -r requirements.txt
```

### Environment variables

| Variable | Default | Required |
|---|---|---|
| `DATABASE_URL` | `sqlite+aiosqlite:///./catalog.db` | Yes (PostgreSQL in prod) |
| `IDENTITY_SERVICE_URL` | `http://identity:8000` | Yes |

### Run migrations

```bash
cd backend/catalog
DATABASE_URL=postgresql+asyncpg://user:pass@localhost/catalog_db alembic upgrade head
```

### Run the service

```bash
cd backend/catalog
uvicorn main:app --reload --port 8002
```

### Run tests

```bash
cd backend/catalog
python3 -m pytest tests/ -q
```

Tests use an in-memory SQLite database (no PostgreSQL needed) and mock the Identity service via FastAPI dependency overrides.

## Docker / Compose

The service is part of the docker-compose stack:

```bash
docker compose up --build catalog
```

Or the full stack:

```bash
docker compose up --build
```

## Seeding realistic data

```bash
docker exec mealplanner_new_1-catalog-1 python seed.py
```

The seed script is idempotent — it skips products that already exist by name.
