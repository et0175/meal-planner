# Meal Forge

A web app for meal planning, recipe management, and shopping lists.

## Architecture

| Component | Technology | Deployment |
|-----------|-----------|------------|
| Identity service | Python / FastAPI | Railway |
| Product Catalog service | Python / FastAPI | Railway |
| Meal Planning service | Python / FastAPI | Railway |
| Shopping List service | Python / FastAPI | Railway |
| Frontend | Next.js 16 / TypeScript | Vercel |

Each backend service has its own PostgreSQL database (Railway Postgres plugin).

## Quick start (Docker Compose)

```bash
# Clone and start everything
git clone <repo>
cd meal-forge

cp .env.example .env   # review and edit as needed
docker compose up --build
```

| URL | Service |
|-----|---------|
| http://localhost:3000 | Frontend |
| http://localhost:8001/docs | Identity API |
| http://localhost:8002/docs | Catalog API |
| http://localhost:8003/docs | Planning API |
| http://localhost:8004/docs | Shopping API |

## Local development (without Docker)

Each service can be run standalone with SQLite — no Postgres setup needed:

```bash
cd backend/identity
pip install -r requirements.txt
uvicorn main:app --reload --port 8001
```

See each service's `README.md` for details:
- [`backend/identity/README.md`](backend/identity/README.md)
- [`backend/catalog/README.md`](backend/catalog/README.md)
- [`backend/planning/README.md`](backend/planning/README.md)
- [`backend/shopping/README.md`](backend/shopping/README.md)
- [`frontend/README.md`](frontend/README.md)

## Running tests

```bash
# Backend services (run from each service directory)
cd backend/identity  && python3 -m pytest tests/ -v
cd backend/catalog   && python3 -m pytest tests/ -v
cd backend/planning  && python3 -m pytest tests/ -v
cd backend/shopping  && python3 -m pytest tests/ -v

# Frontend (RTL unit tests)
cd frontend && npm test

# Frontend (Playwright e2e — requires dev server on :3001)
cd frontend && npx playwright test
```

## Deployment

### Vercel (frontend)
Connect the GitHub repo in Vercel. `vercel.json` at the repo root points to the `frontend/` directory.

Set these environment variables in Vercel:
```
NEXT_PUBLIC_IDENTITY_URL=https://your-identity.railway.app
NEXT_PUBLIC_CATALOG_URL=https://your-catalog.railway.app
NEXT_PUBLIC_PLANNING_URL=https://your-planning.railway.app
NEXT_PUBLIC_SHOPPING_URL=https://your-shopping.railway.app
```

### Railway (backend services)
Create a Railway project with 4 services (one per `backend/<service>/` directory) plus a
Postgres plugin for each. Railway auto-detects the `Dockerfile` and `railway.toml`.

Each service needs:
```
DATABASE_URL=<injected by Railway Postgres plugin>
IDENTITY_SERVICE_URL=https://your-identity.railway.app   # for catalog/planning/shopping
```

Migrations run automatically on startup via the retry loop in `railway.toml`.

## Environment variables

See [`.env.example`](.env.example) for a full list with descriptions.

## Project docs

- [Architecture](meta/architecture/) — ADRs, component diagrams, handoff
- [Requirements](docs/requirements/) — FRs, NFRs
- [User stories](docs/user-stories/)
- [Test cases](docs/test-cases/)
- [Changelog](CHANGELOG.md)
