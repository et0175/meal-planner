# CARD-002: Auth Service + JWT issuance

**Status:** ready
**Priority:** P1
**Category:** enabler
**Estimate:** 2d
**Revision pending:** false
**Skill:** nextjs-developer
**TDD:** —
**Branch:** card/002-auth-service-jwt-issuance
**Worktree:** —
**Source:** meta/architecture/handoff.md#increment-1
**Depends on:** CARD-001
**Review score:** —
**Started:** —
**Closed:** —
**Actual:** —
**Merge commit:** —
**Blocked by:** —

## What to implement

Implement the authentication layer: user registration, sign-in, JWT issuance, and auth middleware. This is the identity foundation everything else gates on.

**Scope:**
- **COMP-009 Auth Service:** `RegisterUser` (email + password, unique email), `SignIn` (returns JWT), `UpdateCredentials` (email/password change)
- **COMP-012 JWT Token Issuer:** JWT must embed `user_id`, `diet_preference_id`, and `calorie_corridor` (ADR-0006). Token refresh triggered on any `UpdateUserProfile` that touches calorie-corridor inputs
- **Auth middleware:** all state-mutating routes return 401 for unauthenticated requests (NFR-001). Wire in Next.js middleware or API route wrappers
- **COMP-013 Social Login ACL:** define the abstraction interface only (no implementation) per ADR-0008; CON-002 means social login is deferred

**Key constraints from handoff:**
> `UpdateUserProfile` must trigger token refresh whenever any calorie-corridor input changes (ADR-0006 mandatory rule).
> JWT must embed `user_id`, `diet_preference_id`, and `calorie_corridor`.

## Acceptance criteria

**FR-020** — User registration:
- Given: valid email + password → `RegisterUser` → HTTP 201, user persisted
- Given: duplicate email → `RegisterUser` → HTTP 409
- Given: unauthenticated request on any mutating endpoint → HTTP 401 (NFR-001)

**FR-021** — Update credentials:
- Given: authenticated user, new valid email → `UpdateCredentials` → HTTP 200, email updated
- Given: authenticated user, new password → `UpdateCredentials` → HTTP 200, sign-in with new password succeeds

**CON-002** — Social login deferred:
- `SignIn` accepts only email/password; no OAuth endpoints in MVP1

## Architecture context

- **FR:** FR-020, FR-021
- **NFR:** NFR-001 (all mutating endpoints → 401 for unauthenticated), NFR-004 (structured log on every command)
- **CON:** CON-002 (email/password only in MVP1)
- **ADR:** ADR-0006 (JWT claims structure — mandatory), ADR-0008 (provider-agnostic auth abstraction)
- **Components:** COMP-009 (Auth Service), COMP-012 (JWT Token Issuer), COMP-013 (Social Login ACL interface only), COMP-014 (Identity DB — full identity tables)
- **Trace:** meta/architecture/trace.yml

## Worktree notes

—
