# Shopping List Service

Python microservice that generates, manages, and exports shopping lists from meal plan assignments.

## What it does

- Auto-generates a shopping list for the current ISO week on first navigation (ADR-0007)
- Aggregates meal plan assignments from the Planning service by product and unit
- Enriches items with product categories from the Catalog service
- Maintains one active list per user — re-generating replaces the previous list (ADR-0008)
- Detects staleness when plan assignments change (ADR-0003)
- Exports the current list as a PDF grouped by product category (NFR-004: < 3s)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/shopping` | Bearer | Return existing list or generate for current ISO week |
| `POST` | `/shopping/generate` | Bearer | (Re)generate for an explicit date range |
| `POST` | `/shopping/refresh` | Bearer | Regenerate from stored date range, clear stale flag |
| `POST` | `/shopping/export/pdf` | Bearer | Download current list as PDF (grouped by category) |
| `POST` | `/shopping/events/plan-changed` | Bearer | Mark list stale when a plan assignment changes |
| `GET` | `/health` | None | Health check |

### GET /shopping

Returns the user's current shopping list. Generates one for the current ISO Mon–Sun week if no list exists yet.

**Response:**
```json
{
  "id": 1,
  "user_id": 42,
  "from_date": "2026-06-29",
  "to_date": "2026-07-05",
  "is_stale": false,
  "generated_at": "2026-06-30T10:00:00Z",
  "items": [
    {
      "id": 1,
      "product_id": 101,
      "product_name": "Oats",
      "category": "Grains",
      "total_quantity": 700.0,
      "unit": "g"
    }
  ]
}
```

### POST /shopping/generate

(Re)generate for an explicit date range. Replaces the previous list (upsert model).

**Request body:**
```json
{
  "from_date": "2026-07-01",
  "to_date": "2026-07-31"
}
```

Returns 422 if `from_date > to_date` (INV-011).

### POST /shopping/refresh

Regenerates using the stored `from_date`/`to_date`. Clears the `is_stale` flag.

### POST /shopping/events/plan-changed

Marks the list stale when a plan assignment in the list's date range changes.

**Request body:**
```json
{
  "event_type": "assignment_updated",
  "assignment_date": "2026-07-03"
}
```

`event_type` options: `assignment_updated`, `assignment_removed`, `assignment_moved`

### POST /shopping/export/pdf

Returns `application/pdf` stream of the current list, grouped by product category.
Empty categories are omitted. Empty list produces a valid "No items" PDF.

## Setup and local dev

### Prerequisites

- Python 3.12+
- PostgreSQL 16 (or use SQLite for development/tests)

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run the service

```bash
export DATABASE_URL="postgresql+asyncpg://shopping:shopping@localhost:5435/shopping"
export IDENTITY_SERVICE_URL="http://localhost:8001"
export PLANNING_SERVICE_URL="http://localhost:8003"
export CATALOG_SERVICE_URL="http://localhost:8002"

# Apply migrations
alembic upgrade head

# Start server
uvicorn main:app --reload --port 8004
```

## How to run tests

Tests use aiosqlite (in-memory SQLite) — no PostgreSQL needed.
Planning and Catalog HTTP calls are mocked per-test.

```bash
cd backend/shopping
python3 -m pytest -v
```

## Docker / Compose usage

```bash
# Start all services including Shopping
docker compose up --build

# Shopping only
docker compose up shopping db-shopping
```

The service runs on port 8004 (host) → 8000 (container).

## Environment variables

| Variable | Default | Required in prod | Description |
|----------|---------|-----------------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./shopping.db` | Yes | PostgreSQL async URL |
| `IDENTITY_SERVICE_URL` | `http://identity:8000` | Yes | Token validation endpoint |
| `PLANNING_SERVICE_URL` | `http://planning:8000` | Yes | Meal plan assignments source |
| `CATALOG_SERVICE_URL` | `http://catalog:8000` | No | Product category enrichment (falls back to `null` if unavailable) |

## Architecture notes

- **Cross-service auth**: Forwards the user's Bearer token to Planning. Validates all tokens via Identity.
- **Staleness**: `is_stale` flag on the list record. Set by `POST /events/plan-changed` (stub for event bus). Cleared by generate/refresh.
- **PDF grouping**: Items are sorted alphabetically by category, then by product name within each category. "Uncategorized" items appear last.
- **Performance (NFR-003)**: 31 days × 4 slots × 5 items aggregates in < 500ms (DB upsert indexed on `list_id`).
