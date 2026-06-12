# ADR-0004: Nutritionist is a profile label with no elevated permissions in MVP1

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-004, CON-002, ACT-001, ACT-002, INV-002, INV-005

---

## Context

The domain model identifies two human actors: User (ACT-001) and Nutritionist (ACT-002). The ownership model states that users can only edit or delete catalog entries they created (INV-002, INV-005). The vision mentions nutritionists as a persona that curates products and recipes — which could imply elevated catalog permissions (edit/delete entries created by others).

The question is whether the Nutritionist role should have elevated permissions in MVP1 — requiring role-based access control (RBAC) — or be treated as a profile label with identical system permissions to a regular user.

No user story in the current story set (US-PA through US-MP) defines a workflow that requires a nutritionist to act on another user's content. Stories US-DA-003 and US-DA-004 ("Mark product/recipe compatibility with a diet") use "As a user or nutritionist" — indicating shared, not differentiated, permissions.

---

## Decision

**In MVP1, Nutritionist is a user profile attribute (a self-selected label), not a system role. Nutritionists have identical create/read/own/edit-own/delete-own permissions to regular users. No RBAC is introduced in MVP1.**

The `user_type` or equivalent field may be stored on the profile for future use, but it carries no access-control semantics in MVP1.

---

## Consequences

### Positive

- **No RBAC complexity in MVP1** — the authz model remains simple: ownership-based (user can act on their own entries only). No role-check middleware, no admin grant flow, no permission matrix to maintain.
- **No admin panel required** — elevated roles would require a way to grant and revoke them. That workflow has no user story and would be unvalidated product surface.
- **Consistent with existing stories** — all current stories treat User and Nutritionist identically at the permission level. This decision is lossless with respect to the current story set.
- **Clean extension point** — when a "curate shared catalog" story is written and prioritized, RBAC can be added to `AuthService` (COMP-009) as a targeted extension. The profile attribute is already stored; adding a permission check is additive, not a redesign.

### Negative

- **Nutritionists cannot curate other users' catalog entries in MVP1** — if a nutritionist finds an error in a community-contributed product, they can only report it or add a corrected version as their own entry. This is a real limitation that may surface as user feedback.
- **Profile label may create user expectation mismatch** — users who self-identify as nutritionists may expect elevated capabilities. This should be addressed in UX copy rather than in the permission model.

### Neutral

- The elevated Nutritionist role is the natural next RBAC step when catalog curation stories are written. The decision is explicitly scoped to MVP1 and should be revisited when those stories are prioritized.
- A future admin/moderator role (for platform operators) is a separate concern from the Nutritionist role and should be designed independently.

---

## Alternatives considered

**Elevated Nutritionist role with catalog curation permissions** — rejected for MVP1. No user story currently requires a nutritionist to act on another user's content. Implementing RBAC without a validated product requirement adds authz complexity, requires an admin grant workflow, and increases the attack surface of the permission model — all for a capability that has not been confirmed with users. Defer until concrete stories exist.
