# Changelog

## 2026-06-29
- CARD-004 (feature): Implemented Product Catalog UI — category card grid, sortable table with filter bar (name search, category, diet-tag multi-select), SVG macro pie chart, unit conversion table, week-flag toggle, add/edit form with ownership gating, 76 RTL tests and Playwright e2e suite.
- CARD-005 (feature): Implemented Meal Planning service — assignment CRUD with ISO-week navigation, nutrition targets, plan summary endpoint (ADR-0004), log-from-plan to TrackingEntry stub (ADR-0001), reportlab PDF export (<3s NFR-004), week-flag reader with catalog fallback (ADR-0002), 56 pytest tests.
- CARD-002 (feature): Implemented Navigation Shell + Auth UI — sign-in/register/forgot-password forms, auth-guard layout with sessionStorage + identity token validation, sidebar with active-state highlight, topbar with week-stats widget, 22 RTL integration tests and 8 Playwright e2e tests.
- CARD-003 (feature): Implemented Product Catalog service — product CRUD with ownership rules, category/diet-tag/name filtering, unit conversion, week-flag endpoints (this_week/next_week/none), Monday rollover scheduler, GIN trigram index for <200ms search, 36 pytest integration tests.

## 2026-06-23
- CARD-001 (compliance): Implemented Identity service — account registration/sign-in/sign-out, bcrypt password hashing, rate-limiting with 1h lockout, single-use password reset tokens, session validation endpoint, 20 tests.
- CARD-009 (enabler): Added Railway/Vercel deployment infrastructure — Dockerfiles, railway.toml with alembic retry, alembic.ini, docker-compose with healthchecks, frontend Dockerfile, .env.example, .gitignore.
