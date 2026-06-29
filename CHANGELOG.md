# Changelog

## 2026-06-29
- CARD-002 (feature): Implemented Navigation Shell + Auth UI — sign-in/register/forgot-password forms, auth-guard layout with sessionStorage + identity token validation, sidebar with active-state highlight, topbar with week-stats widget, 22 RTL integration tests and 8 Playwright e2e tests.
- CARD-003 (feature): Implemented Product Catalog service — product CRUD with ownership rules, category/diet-tag/name filtering, unit conversion, week-flag endpoints (this_week/next_week/none), Monday rollover scheduler, GIN trigram index for <200ms search, 36 pytest integration tests.

## 2026-06-23
- CARD-001 (compliance): Implemented Identity service — account registration/sign-in/sign-out, bcrypt password hashing, rate-limiting with 1h lockout, single-use password reset tokens, session validation endpoint, 20 tests.
- CARD-009 (enabler): Added Railway/Vercel deployment infrastructure — Dockerfiles, railway.toml with alembic retry, alembic.ini, docker-compose with healthchecks, frontend Dockerfile, .env.example, .gitignore.
