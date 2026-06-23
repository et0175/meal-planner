# ADR-0011: Technology stack selection

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

Meal Forge is a greenfield MVP consisting of four backend bounded-context services
and one frontend application. Stack choices must support:

- Async I/O throughout (NFR-001: < 200 ms P95 latency on the critical read paths)
- Strong typing and validation at service boundaries (API contracts across 4 services)
- One PostgreSQL database per bounded context (data isolation requirement)
- Independent deployment of each service (Railway) and the frontend (Vercel)
- A small team (1–2 engineers) iterating quickly — low ceremony is preferred over
  maximum flexibility

CON-002 (six-month MVP deadline) and CON-004 (no dedicated infrastructure engineer)
constrain us toward managed platforms and conventional choices.

## Decision

### Backend services (×4: identity, catalog, planning, shopping)

| Component | Choice | Version |
|-----------|--------|---------|
| Language | Python | 3.12 |
| Web framework | FastAPI | ≥ 0.111 |
| ORM | SQLAlchemy (async, declarative) | ≥ 2.0 |
| PostgreSQL driver | asyncpg | ≥ 0.29 |
| Migration tool | Alembic | ≥ 1.13 |
| Validation / serialisation | Pydantic v2 | ≥ 2.7 |
| Password hashing | bcrypt (direct, not via passlib) | ≥ 4.0 |
| Test framework | pytest + pytest-asyncio | — |
| HTTP client (inter-service) | httpx (async) | ≥ 0.27 |

### Frontend

| Component | Choice | Version |
|-----------|--------|---------|
| Framework | Next.js App Router | 15 / 16 |
| Language | TypeScript (strict mode) | ≥ 5 |
| Styling | Tailwind CSS v4 | ≥ 4 |
| UI primitives | React 19 | 19 |
| Icons | lucide-react | — |
| Class composition | clsx + tailwind-merge | — |

### Database

PostgreSQL 16 (Alpine image locally; Railway Postgres plugin in production).
One database per bounded context — no shared schema, no cross-service SQL joins.

### Deployment

| Target | Platform |
|--------|----------|
| 4 Python services | Railway (Dockerfile + railway.toml per service) |
| Next.js frontend | Vercel (zero-config, rootDirectory = frontend/) |
| PostgreSQL (×4) | Railway Postgres plugin (one DB per service) |

---

## Alternatives considered

### Backend framework: Django REST Framework

Django is well-supported and widely known. Rejected because:
- Django's ORM is synchronous by default; async support is bolted on and more complex to configure than SQLAlchemy 2.0's native async API.
- DRF adds significant boilerplate for a microservice that owns a single bounded context.
- FastAPI produces OpenAPI docs automatically from type annotations, which lowers the cost of inter-service contract documentation.

### Backend framework: Flask + SQLAlchemy

Flask is lightweight and familiar. Rejected because it lacks native async support and
requires additional libraries (flask-async, marshmallow or similar) to reach the same
baseline that FastAPI provides out of the box.

### PostgreSQL driver: psycopg2-binary

psycopg2-binary is the traditional choice. Rejected because:
- It requires `libpq-dev` and a C compiler, which are absent from `python:3.12-slim`.
  Including them bloats the image by ~200 MB and introduces a native build step.
- asyncpg is a pure-Python async driver that works on slim images without native
  dependencies and is measurably faster for async workloads.
- This was discovered as a real build failure during CARD-009 and resolved by switching.

### Password hashing: passlib[bcrypt]

passlib is a common abstraction layer over bcrypt. Rejected because:
- passlib relies on Python's `crypt` module, which was deprecated in 3.11 and removed
  in 3.13. Combined with bcrypt ≥ 4.0, this causes import-time errors.
- The abstraction provides no benefit for a project that exclusively uses bcrypt — direct
  `bcrypt.hashpw` / `bcrypt.checkpw` calls are simpler, have no compatibility layer, and
  are explicit about the algorithm and round count.

### Frontend framework: SvelteKit / Remix / Astro

Each of these has merit, but Next.js was chosen because:
- The team already has Next.js experience from the prototype phase.
- Vercel's zero-config deployment is purpose-built for Next.js.
- The App Router's server/client component split maps cleanly onto Meal Forge's data
  access patterns (server components for initial data fetch, client components for
  interactive calendar and form state).

### Styling: CSS Modules / styled-components

Tailwind CSS v4 was preferred because:
- It eliminates the context switch between component files and style files for a small team.
- The constraint-based design token system (spacing scale, colour palette) enforces
  visual consistency without a separate design system library.
- Existing team familiarity from the prototype.

### Deployment: Fly.io / Render (Python), Netlify (frontend)

Railway was chosen over Fly.io because Railway's Postgres plugin injects `DATABASE_URL`
automatically into the service container with no manual configuration. Fly.io requires
explicit volume provisioning and connection string management. For an MVP under CON-004
(no infra engineer), Railway's lower ceremony is worth the reduced control.

Vercel was chosen over Netlify because it is the canonical deployment target for
Next.js (same company), has the most complete App Router support, and offers preview
deployments per branch at no extra cost.

## Consequences

### Positive
- SQLAlchemy async + asyncpg supports the < 200 ms latency target without blocking the
  event loop on DB calls.
- FastAPI + Pydantic v2 enforces typed request/response contracts at compile time
  (mypy) and at runtime (validation), reducing inter-service integration bugs.
- asyncpg on `python:3.12-slim` keeps Docker image sizes small and build times short.
- Railway's managed Postgres eliminates DBA work for the MVP.
- Next.js server components allow initial page loads to be data-complete with no
  client-side loading spinners for primary content.

### Negative
- asyncpg uses a different URL scheme (`postgresql+asyncpg://`) than psycopg2
  (`postgresql://`). All `DATABASE_URL` values — in `.env`, `docker-compose.yml`,
  and Alembic configuration — must use the `+asyncpg` dialect prefix, or connections
  will silently fall back to a synchronous driver. This has caused bugs once (CARD-009)
  and must be verified whenever a new connection string is introduced.
- Direct bcrypt usage means password hashing work factor is controlled by a single
  constant (`_BCRYPT_ROUNDS = 10` in `account/service.py`). There is no central
  configuration abstraction; changing it requires editing the source file.
- Railway's free tier has cold-start latency (≈ 1–3 s after inactivity). Not an issue
  for a development MVP; revisit before production launch.

### Neutral
- The async-first constraint (asyncpg, SQLAlchemy async, httpx) means all code in the
  service layer must be written with `async/await`. Synchronous helper functions are
  permitted, but database calls and inter-service HTTP calls must always be awaited.
- Alembic's async runner (`asyncio.run(_run_async_migrations())` in `env.py`) is the
  correct pattern when the ORM engine is async. This is always invoked from the CLI,
  never from inside a running event loop, so there is no loop-conflict risk.

## References

- CON-002 (six-month MVP deadline)
- CON-003 (session-based auth, no OAuth)
- CON-004 (no dedicated infrastructure engineer)
- NFR-001 (< 200 ms P95 latency)
- ADR-0005 (password reset token design — bcrypt choice applied here)
- ADR-0006 (rate limiting — bcrypt round count considered in timing)
- CARD-009 (DevOps setup — asyncpg/psycopg2 build failure discovered here)
- CARD-001 (Identity service — passlib/bcrypt incompatibility discovered here)

## History

- 2026-06-22: Created — stack formalised after CARD-001 and CARD-009 implementation
  revealed two consequential library-level decisions (asyncpg, direct bcrypt) worth
  preserving in the decision record.
