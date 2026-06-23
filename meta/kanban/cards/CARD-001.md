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

—
