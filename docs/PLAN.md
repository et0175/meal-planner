# CARD-009: Railway + Vercel Deployment Setup

## Implementation checklist

- [ ] Dockerfile for each of 4 Python services (identity, catalog, planning, shopping)
- [ ] railway.toml for each service (build + deploy + healthcheck)
- [ ] alembic.ini for each service (reads DATABASE_URL from env, no hard-coded strings)
- [ ] Alembic migrations bootstrap (versions/ dir + env.py placeholder)
- [ ] frontend/vercel.json (framework: nextjs, root: frontend/)
- [ ] .env.example at repo root (all env vars documented)
- [ ] .gitignore additions

## Order

1. Dockerfiles (each service independently buildable)
2. railway.toml per service (depends on Dockerfile)
3. alembic.ini + migrations bootstrap per service
4. frontend/vercel.json
5. .env.example
6. .gitignore
7. Commit

## Key decisions

- Alembic startCommand: `alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port $PORT`
  (migrations run before server start; Alembic is idempotent so safe on redeploy)
- DATABASE_URL uses asyncpg driver (`postgresql+asyncpg://`) in app code;
  alembic.ini reads the same env var and the async env.py handles the asyncio runner
- env.py is a placeholder — each python-pro card (CARD-001/003/005/007) fills in
  `target_metadata` from their service models
