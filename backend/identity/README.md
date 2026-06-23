# Identity Service

Authentication microservice for Meal Forge. Manages accounts, sessions, and password resets.

## API

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/register` | — | Create account; returns `{id, email, role}` |
| POST | `/auth/sign-in` | — | Authenticate; returns `{token, account_id, role}` |
| POST | `/auth/sign-out` | Bearer | Invalidate the current session |
| POST | `/auth/reset-request` | — | Send a password-reset email (silent on unknown email) |
| POST | `/auth/reset-confirm` | — | Set a new password using the reset token |
| GET | `/auth/session` | Bearer | Validate a token; returns `{account_id, email, role}` |
| GET | `/health` | — | `{"status": "ok"}` |

## Local development

```bash
cd backend/identity
pip install -r requirements.txt

# SQLite — no database setup needed
uvicorn main:app --reload --port 8001
```

Interactive docs: http://localhost:8001/docs

## Running with PostgreSQL

```bash
export DATABASE_URL=postgresql+asyncpg://identity:identity@localhost:5432/identity
alembic upgrade head
uvicorn main:app --reload --port 8001
```

## Tests

```bash
cd backend/identity
python3 -m pytest tests/ -v
```

Tests use an in-memory SQLite database — no Postgres or running server required.

## Docker

```bash
# From repo root
docker build -t identity ./backend/identity
docker run -p 8001:8000 \
  -e DATABASE_URL=postgresql+asyncpg://identity:identity@host.docker.internal:5432/identity \
  identity
```

Or use Docker Compose from the repo root:

```bash
docker compose up identity db-identity
```

## Cross-service token validation

Other services authenticate their requests by calling this service:

```http
GET /auth/session
Authorization: Bearer <token>
```

Returns `200 {"account_id": 1, "email": "...", "role": "user"}` or `401`.
See `backend/shared/auth_middleware.py` for the helper pattern.

## Environment variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | SQLite file | `postgresql+asyncpg://user:pass@host/db` in production |
| `RATE_LIMIT_MAX_ATTEMPTS` | `10` | Sign-in failures before 1-hour lockout |
| `RATE_LIMIT_LOCKOUT_MINUTES` | `60` | Lockout duration |
| `RESET_TOKEN_EXPIRY_MINUTES` | `60` | Password-reset link TTL |
| `EMAIL_BACKEND` | `stdout` | Set to `stdout` to print reset links to console |
