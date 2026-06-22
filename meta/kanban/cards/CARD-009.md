# CARD-009: Set up Railway services and Vercel project

**Status:** ready
**Priority:** P2
**Category:** enabler
**Estimate:** 1d
**Revision pending:** false
**Skill:** devops
**TDD:** false
**Branch:** card/009-railway-vercel-setup
**Worktree:** —
**Source:** quick
**Depends on:** —
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Set up Railway services and Vercel project for the Meal Forge app.

Deployment topology:
- **Vercel** → `frontend/` (Next.js App Router, zero-config)
- **Railway** → `backend/identity`, `backend/catalog`, `backend/planning`, `backend/shopping` (each with its own managed PostgreSQL)

Deliverables:
1. `Dockerfile` in each of the 4 Python service directories
2. `railway.toml` in each of the 4 Python service directories
3. `alembic.ini` in each of the 4 Python service directories
4. `frontend/vercel.json` pointing root to `frontend/`
5. `.env.example` at the repo root documenting all required env vars
6. `.gitignore` additions for `.env`, `__pycache__`, `.next/`, `node_modules/`

## Acceptance criteria

- [ ] AC-1: Each `backend/<service>/Dockerfile` builds successfully (`docker build`) and starts the service with `uvicorn main:app --host 0.0.0.0 --port 8000`
- [ ] AC-2: Each `backend/<service>/railway.toml` has `startCommand` that runs `alembic upgrade head` before starting uvicorn, and a `/health` healthcheck path
- [ ] AC-3: Each `backend/<service>/alembic.ini` reads `DATABASE_URL` from the environment (no hard-coded connection string)
- [ ] AC-4: `frontend/vercel.json` sets `framework: nextjs` and the build works from the `frontend/` root directory
- [ ] AC-5: `.env.example` documents every env var used across all services (`DATABASE_URL`, `IDENTITY_SERVICE_URL`, `CATALOG_SERVICE_URL`, `PLANNING_SERVICE_URL`, `NEXT_PUBLIC_*` URLs)
- [ ] AC-6: `.gitignore` covers `backend/**/.env`, `backend/**/__pycache__/`, `frontend/.next/`, `frontend/node_modules/`
- [ ] AC-7: `docker compose up --build` starts all services and all `/health` endpoints return `{"status": "ok"}`

## Architecture context

Source: quick (no architecture trace)

Relevant agent guidance: `.claude/agents/devops.md`
Docker Compose: `docker-compose.yml` (already exists at repo root)
Backend stubs: `backend/*/main.py` with `/health` endpoint already present

## Worktree notes

—
