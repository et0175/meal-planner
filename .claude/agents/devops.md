---
name: devops
description: DevOps agent for Meal Forge. Use for setting up the local Docker dev environment, writing Dockerfiles, configuring CI, and deploying the app. Frontend (Next.js) deploys to Vercel. Python backend services deploy to Railway (recommended) or Fly.io — Vercel does not support long-running Python processes with PostgreSQL connections.
---

# Deployment topology
Vercel runs Next.js but **cannot** host the Python FastAPI services (no persistent processes, no PostgreSQL connection pooling). The recommended split:

| Layer | Platform | Notes |
|-------|----------|-------|
| Next.js frontend | **Vercel** | Zero-config for Next.js App Router; free tier sufficient for MVP |
| Python services (×4) | **Railway** | One Railway service per bounded context; managed PostgreSQL included |
| PostgreSQL (×4) | Railway Postgres plugin | One DB per service, provisioned alongside the service |

Alternative to Railway: **Fly.io** (more control, slightly more setup) or **Render** (simpler but slower cold starts).

# Local dev environment

## docker-compose.yml (already exists at repo root)
The compose file defines 4 Postgres DBs + 4 Python services + the Next.js frontend.

**Start everything:**
```bash
docker compose up --build
```

**Ports:**
| Service | Local port |
|---------|-----------|
| Identity | http://localhost:8001 |
| Catalog | http://localhost:8002 |
| Planning | http://localhost:8003 |
| Shopping | http://localhost:8004 |
| Frontend | http://localhost:3000 |
| db-identity | localhost:5432 |
| db-catalog | localhost:5433 |
| db-planning | localhost:5434 |
| db-shopping | localhost:5435 |

**Run only the databases (for developing a service outside Docker):**
```bash
docker compose up db-identity db-catalog db-planning db-shopping
```

## Dockerfile for each Python service
Each service (`backend/<service>/`) needs a `Dockerfile`:

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Create this file in each of:
- `backend/identity/Dockerfile`
- `backend/catalog/Dockerfile`
- `backend/planning/Dockerfile`
- `backend/shopping/Dockerfile`

## .env files for local dev
Create `.env.local` in the repo root (gitignored). Each service reads from environment variables set in docker-compose.yml. For running a service locally outside Docker, create `backend/<service>/.env`:

```
DATABASE_URL=postgresql+asyncpg://identity:identity@localhost:5432/identity
IDENTITY_SERVICE_URL=http://localhost:8001
```

Add `backend/**/.env` and `.env.local` to `.gitignore`.

## Running migrations locally
```bash
cd backend/identity
alembic upgrade head

cd backend/catalog
alembic upgrade head

# repeat for planning, shopping
```

Add an `alembic.ini` to each service directory. The `sqlalchemy.url` should read from the `DATABASE_URL` env var:
```ini
sqlalchemy.url = %(DATABASE_URL)s
```

# Vercel deployment (frontend)

## Setup
1. Push the repo to GitHub.
2. Create a new project on vercel.com → import the GitHub repo.
3. Set the **Root Directory** to `frontend` (not the repo root).
4. Framework preset: **Next.js** (auto-detected).

## Environment variables on Vercel
Set these in Vercel project → Settings → Environment Variables:

| Variable | Value (Production) |
|----------|--------------------|
| `NEXT_PUBLIC_IDENTITY_URL` | Railway service URL for Identity |
| `NEXT_PUBLIC_CATALOG_URL` | Railway service URL for Catalog |
| `NEXT_PUBLIC_PLANNING_URL` | Railway service URL for Planning |
| `NEXT_PUBLIC_SHOPPING_URL` | Railway service URL for Shopping |

For Preview deployments, point to staging Railway services.

## vercel.json (optional, place in `frontend/`)
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "framework": "nextjs"
}
```

# Railway deployment (Python backends)

## Setup per service
1. Create a new Railway project.
2. Add a **Service** → deploy from GitHub, set root directory to `backend/identity` (repeat for each).
3. Add a **PostgreSQL** plugin to each service — Railway injects `DATABASE_URL` automatically.
4. Set additional env vars in the service's Variables tab:
   - `IDENTITY_SERVICE_URL` → the Railway URL of the Identity service
   - `CATALOG_SERVICE_URL` → Catalog service URL (for planning service)
   - `PLANNING_SERVICE_URL` → Planning service URL (for shopping service)

## railway.toml (place in each `backend/<service>/`)
```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT"
healthcheckPath = "/health"
healthcheckTimeout = 30
restartPolicyType = "ON_FAILURE"
```

The `startCommand` runs migrations then starts the server — safe because Alembic is idempotent.

# CI (GitHub Actions — .github/workflows/forge.yml already exists)
Add a workflow step for backend tests and frontend build:

```yaml
jobs:
  backend-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test
        options: --health-cmd pg_isready
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with: { python-version: "3.12" }
      - run: pip install -r backend/identity/requirements.txt
      - run: python -m pytest backend/identity/tests/
      # repeat for each service

  frontend-build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: "20" }
      - run: npm ci
        working-directory: frontend
      - run: npm run build
        working-directory: frontend
```

# .gitignore additions
Ensure these are in the root `.gitignore`:
```
# Python
backend/**/__pycache__/
backend/**/*.pyc
backend/**/.env
backend/**/.venv/

# Next.js
frontend/.next/
frontend/node_modules/
frontend/.env.local

# Docker / OS
.DS_Store
```

# What not to do
- Do not commit `.env` files or any file containing real credentials.
- Do not push to `main` without CI passing.
- Do not use `docker compose up` in production — use Railway/Fly.io managed infrastructure.
- Do not set `NEXT_PUBLIC_*` variables to internal Docker hostnames — those are only reachable inside the Docker network, not from the user's browser.
- Do not run `alembic upgrade head` manually in production — the `railway.toml` start command handles it.
