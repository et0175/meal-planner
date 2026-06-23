# Identity Service — Implementation Plan (CARD-001)

## Layers (ordered)

- [x] Read card + ADRs
- [ ] DB models (`db/models.py`) — accounts, sessions, reset_tokens
- [ ] Alembic migration — initial schema
- [ ] Pydantic schemas — account, session, reset
- [ ] Email sender stub (`email/sender.py`)
- [ ] Account service + router (register, sign-in, sign-out)
- [ ] Reset service + router (reset-request, reset-confirm)
- [ ] Session service (token validation, verify_token dependency)
- [ ] shared auth_middleware (`shared/auth_middleware.py`)
- [ ] main.py — register routers, lifespan
- [ ] requirements.txt — finalize deps
- [ ] Tests — all AC-* covered
- [ ] ruff + mypy clean
- [ ] Commit

## Key decisions

- Passwords: bcrypt via passlib, rounds=10 (NFR-006)
- Session tokens: `secrets.token_urlsafe(32)` stored in DB (not JWT); validated via `GET /auth/session` pattern
- Reset tokens: `secrets.token_urlsafe(32)`, 60-min expiry (ADR-0005, NFR-007)
- Rate limit: configurable threshold via env `RATE_LIMIT_MAX_ATTEMPTS` (default 10 per ADR-0006), lockout 1 hour; reset on success
- AC-009 tests 5 failures → test overrides env var to 5
- 410 for expired/used reset tokens (ADR-0005)
- 429 + Retry-After header on lockout (ADR-0006)
- No enumeration on reset-request: always 200
- Role enum: "user" | "nutritionist" (INV-003)
- Email backend: stdout print by default (`EMAIL_BACKEND=stdout`)
- AsyncSession + asyncpg driver; DATABASE_URL from env
- Migration: single initial migration covering all 3 tables

## Risks

- asyncpg not available at test time (use `aiosqlite` for test DB OR use postgres via docker-compose)
- mypy strict mode requires complete type annotations
- passlib bcrypt requires `bcrypt` package at runtime
