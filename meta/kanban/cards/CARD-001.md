# CARD-001: Identity service (Python)

**Status:** in_progress
**Priority:** P1
**Category:** compliance
**Estimate:** 5d
**Revision pending:** false
**Skill:** python-pro
**TDD:** —
**Branch:** card/001-identity-service
**Worktree:** ../project-CARD-001
**Source:** meta/architecture/handoff.md#increment-1
**Depends on:** —
**Review score:** —
**Started:** 2026-06-22T00:00:00Z
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Python Identity service (CTX-001, COMP-001–005):

- `POST /auth/register` — create account with email + password; hash password; emit EVT-001; enforce unique-email constraint (INV-001); validate role enum (INV-003)
- `POST /auth/sign-in` — verify credentials; create session token; enforce rate-limiting: 10 consecutive failures → 1-hour lockout (ADR-0006); return 429 + Retry-After on lockout
- `POST /auth/sign-out` — invalidate session token
- `POST /auth/reset-request` — generate single-use reset token with 1-hour expiry (ADR-0005); send email (COMP-004 stub); return 200 even for unknown email (no enumeration)
- `POST /auth/reset-confirm` — verify token is unexpired and unused; update password; mark token used; return 410 for expired/used
- Session middleware — validate Bearer token on every protected route; return 401 for missing/expired/invalidated tokens
- PostgreSQL schema (COMP-005): `accounts`, `sessions`, `reset_tokens` tables + migrations
- Email sender stub (COMP-004): log to stdout in dev; real SMTP wiring deferred

Gate: unauthenticated requests to any protected endpoint return 401; session persists within tab; all TC-AUTH-* pass.

## Acceptance criteria

**FR-001 — Register**
- AC-001: email "alice@example.com" + valid password → account persisted, redirect to Planner
- AC-002: duplicate email → 409, no second account
- AC-003: empty password → 422, nothing persisted
- AC-004: malformed email → 422, nothing persisted
- AC-100: role field is "user" or "nutritionist" only (INV-003)

**FR-002 — Sign-in**
- AC-005: valid credentials → session token created, redirect to Planner
- AC-006: wrong password → 401, no session
- AC-007: unknown email → 401, no session
- AC-008: sign-in then navigate between pages → stays signed in

**FR-003 — Rate-limiting (ADR-0006)**
- AC-009: 5 consecutive failures → 6th attempt rejected 429 + retry-after
- AC-010: after cooldown expires → sign-in succeeds

**FR-004 — Sign-out**
- AC-011: click sign out → session invalidated, redirect to sign-in
- AC-012: invalidated token used → 401

**FR-005 — Password reset (ADR-0005)**
- AC-013: registered email → single-use reset link sent, EVT-004 emitted
- AC-014: valid unexpired token + new password → password updated, EVT-005 emitted
- AC-015: already-used token → 410
- AC-016: expired token → 410
- AC-017: unregistered email → 200, no email sent (no enumeration)

**FR-006 — Auth guard**
- AC-018: request to authenticated route with no session → 302 or 401
- AC-019: expired session token → invalidated, redirect to sign-in

## Architecture context

- **FR:** FR-001, FR-002, FR-003, FR-004, FR-005, FR-006
- **NFR:** NFR-006 (password hashed bcrypt ≥ 10 rounds), NFR-007 (reset token min 128 bits), NFR-008 (HTTPS only)
- **ADR:** ADR-0005 (1-hour reset token expiry), ADR-0006 (10 attempts / 1-hour lockout)
- **Components:** COMP-001 (AccountService), COMP-002 (SessionService), COMP-003 (ResetService), COMP-004 (EmailSender), COMP-005 (IdentityDB)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

[Build gate] PASSED — 19/19 tests green (python3 -m pytest tests/)
[Scope] backend/identity/account/router.py, backend/identity/account/schemas.py, backend/identity/account/service.py, backend/identity/alembic.ini, backend/identity/db/engine.py, backend/identity/db/migrations/env.py, backend/identity/db/migrations/script.py.mako, backend/identity/db/migrations/versions/0001_initial_schema.py, backend/identity/db/models.py, backend/identity/email_adapter/__init__.py, backend/identity/email_adapter/sender.py, backend/identity/main.py, backend/identity/pytest.ini, backend/identity/requirements.txt, backend/identity/reset/router.py, backend/identity/reset/schemas.py, backend/identity/reset/service.py, backend/identity/session/router.py, backend/identity/session/service.py, backend/identity/tests/conftest.py, backend/identity/tests/test_account.py, backend/identity/tests/test_reset.py, backend/shared/auth_middleware.py, docs/PLAN.md

Implementation complete on branch `card/001-identity-service`.

**Files created:**
- `backend/identity/db/models.py` — SQLAlchemy 2.0 ORM models: `accounts`, `sessions`, `reset_tokens`; `RoleEnum(StrEnum)` for role invariant (INV-003)
- `backend/identity/db/engine.py` — AsyncEngine / AsyncSession factory with `get_db` dependency; `reset_engine()` for test teardown
- `backend/identity/db/migrations/env.py` — Alembic async env; imports `target_metadata` from `db.models`
- `backend/identity/db/migrations/versions/0001_initial_schema.py` — Initial migration: all 3 tables + indexes
- `backend/identity/account/schemas.py`, `service.py`, `router.py` — Register, sign-in, sign-out
- `backend/identity/reset/schemas.py`, `service.py`, `router.py` — Reset-request, reset-confirm
- `backend/identity/session/service.py`, `router.py` — Token validation; `GET /auth/session` for cross-service use
- `backend/identity/email_adapter/sender.py` — Stdout stub (renamed from `email/` to avoid stdlib shadow)
- `backend/shared/auth_middleware.py` — `verify_token` FastAPI dependency
- `backend/identity/main.py` — Updated with lifespan, router registration
- `backend/identity/tests/conftest.py` — per-test in-memory SQLite fixtures
- `backend/identity/tests/test_account.py` — 14 tests (AC-001–012, AC-018–019, AC-100)
- `backend/identity/tests/test_reset.py` — 5 tests (AC-013–017)
- `docs/PLAN.md` — Implementation checklist

**Key decisions:**
- bcrypt used directly (passlib 1.7.4 incompatible with bcrypt 5.x)
- `email/` package renamed to `email_adapter/` to avoid shadowing stdlib `email` module
- Rate-limit threshold configurable via `RATE_LIMIT_MAX_ATTEMPTS` env var (default 10 per ADR-0006)
- Reset token uses `secrets.token_urlsafe(32)` = 256 bits (NFR-007)
- All 19 tests pass; ruff clean; mypy clean (--explicit-package-bases)
