# Meal Planning Service

Python FastAPI microservice for meal plan assignment CRUD, nutrition targets, log-from-plan, plan summary, and PDF export.

## What it does

- Manage meal plan assignments (product + date + meal slot + quantity/unit) per user
- Track weekly nutrition targets (calories, protein, fat, carbs)
- Aggregate weekly nutrition totals for the topbar widget
- Log assigned meals to a TrackingEntry table (stub for Personal Cabinet v1.1)
- Export the week's meal plan as a PDF
- Surface "This Week" flagged products from the Catalog service on the current week view

## API endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/plan` | Bearer | List assignments for a week (`?week=YYYY-WW`); includes this-week flagged products for current week |
| POST | `/plan/assignments` | Bearer | Add assignment (EVT-011); 422 if qty=0, 409 if >10k assignments |
| PUT | `/plan/assignments/:id` | Bearer | Update quantity/unit (EVT-012) |
| DELETE | `/plan/assignments/:id` | Bearer | Remove assignment (EVT-013) |
| PUT | `/plan/assignments/:id/move` | Bearer | Move to different date/slot (EVT-014) |
| GET | `/plan/search` | Bearer | Search products: recently-used first, then user-owned, then alphabetical |
| GET | `/plan/target` | Bearer | Get user's daily nutrition target; 404 if not set |
| PUT | `/plan/target` | Bearer | Upsert nutrition target; 422 if calories < 0 |
| GET | `/plan/summary` | Bearer | Aggregate weekly kcal/protein/fat/carbs totals |
| POST | `/plan/log/day` | Bearer | Log all assignments for a date as TrackingEntries (EVT-015) |
| POST | `/plan/log/week` | Bearer | Log all assignments for a week as TrackingEntries (EVT-016) |
| POST | `/plan/log/item` | Bearer | Log a single assignment as a TrackingEntry (EVT-017) |
| POST | `/plan/export/pdf` | Bearer | Download week meal plan as PDF (EVT-018; < 3 s) |
| GET | `/health` | None | Service health check |

## Setup and local dev

```bash
cd backend/planning
pip install -r requirements.txt

# Run with local SQLite (dev only)
DATABASE_URL=sqlite+aiosqlite:///./planning.db uvicorn main:app --reload --port 8003
```

## How to run tests

```bash
cd backend/planning
python3 -m pytest tests/ -q
```

Tests use an in-memory SQLite database — no PostgreSQL required.

## Docker / Compose usage

```bash
# Build and run the full stack
docker compose up --build

# Seed test data
docker exec mealplanner_new_1-planning-1 python seed.py
```

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite+aiosqlite:///./planning.db` | PostgreSQL async URL for production |
| `IDENTITY_SERVICE_URL` | `http://identity:8000` | URL of the Identity service (token validation) |
| `CATALOG_SERVICE_URL` | `http://catalog:8000` | URL of the Catalog service (week flags, product search) |
| `PORT` | `8000` | Port for uvicorn (Railway sets this automatically) |

## Key invariants

- **INV-008**: assignment quantity must be > 0 (422 otherwise)
- **INV-009**: assignments are always user-scoped; no cross-user reads or writes
- **INV-010**: max 10,000 total assignments per user (409 on the 10,001st)
- **INV-013**: nutrition target calories must be >= 0 (422 otherwise)
- **INV-014**: exactly one nutrition target per user (upsert semantics)

## Deployment (Railway)

The `railway.toml` runs Alembic migrations before starting uvicorn:

```
bash -c 'until alembic upgrade head; do echo "DB not ready, retrying..."; sleep 3; done && uvicorn main:app --host 0.0.0.0 --port $PORT'
```
