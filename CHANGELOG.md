# Changelog

## 2026-06-23
- CARD-001 (compliance): Implemented Identity service — account registration/sign-in/sign-out, bcrypt password hashing, rate-limiting with 1h lockout, single-use password reset tokens, session validation endpoint, 20 tests.
- CARD-009 (enabler): Added Railway/Vercel deployment infrastructure — Dockerfiles, railway.toml with alembic retry, alembic.ini, docker-compose with healthchecks, frontend Dockerfile, .env.example, .gitignore.
