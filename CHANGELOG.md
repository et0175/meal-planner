# Changelog

## 2026-06-30
- CARD-008 (feature): Implemented Shopping List UI — auto-load on nav, items grouped by category (alphabetical), date range picker pre-filled to ISO week (ADR-0007), stale banner with refresh, plan summary panel, PDF print via blob URL, 25 RTL tests (138 total).
- CARD-006 (feature): Implemented Meal Planning UI — week nav, Week Summary spreadsheet grid, Calendar tab with HTML5 DnD and 3 layout modes, Plan Summary Panel, nutrition progress bars, log-day/week/item actions, PDF export, 31 RTL tests.
- CARD-007 (feature): Implemented Shopping List service — auto-generate from Planning (concurrent ISO-week fetch), date-range generation, aggregation by product+unit, staleness flag, reportlab PDF grouped by category, 32 pytest tests (NFR-003 < 500ms, NFR-004 < 3s).

## 2026-06-29
- CARD-004 (feature): Implemented Product Catalog UI — category card grid, sortable table with filter bar (name search, category, diet-tag multi-select), SVG macro pie chart, unit conversion table, week-flag toggle, add/edit form with ownership gating, 76 RTL tests and Playwright e2e suite.
- CARD-005 (feature): Implemented Meal Planning service — assignment CRUD with ISO-week navigation, nutrition targets, plan summary endpoint (ADR-0004), log-from-plan to TrackingEntry stub (ADR-0001), reportlab PDF export (<3s NFR-004), week-flag reader with catalog fallback (ADR-0002), 56 pytest tests.
- CARD-002 (feature): Implemented Navigation Shell + Auth UI — sign-in/register/forgot-password forms, auth-guard layout with sessionStorage + identity token validation, sidebar with active-state highlight, topbar with week-stats widget, 22 RTL integration tests and 8 Playwright e2e tests.
- CARD-003 (feature): Implemented Product Catalog service — product CRUD with ownership rules, category/diet-tag/name filtering, unit conversion, week-flag endpoints (this_week/next_week/none), Monday rollover scheduler, GIN trigram index for <200ms search, 36 pytest integration tests.

## 2026-06-23
- CARD-001 (compliance): Implemented Identity service — account registration/sign-in/sign-out, bcrypt password hashing, rate-limiting with 1h lockout, single-use password reset tokens, session validation endpoint, 20 tests.
- CARD-009 (enabler): Added Railway/Vercel deployment infrastructure — Dockerfiles, railway.toml with alembic retry, alembic.ini, docker-compose with healthchecks, frontend Dockerfile, .env.example, .gitignore.
