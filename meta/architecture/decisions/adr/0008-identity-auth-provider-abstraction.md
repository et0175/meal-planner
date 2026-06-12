# ADR-0008: Identity context uses a provider-agnostic AuthProvider abstraction from Increment 1

**Status:** Accepted  
**Date:** 2026-06-12  
**Deciders:** product owner  
**References:** DEC-008, CON-002, CTX-002, EXT-003

---

## Context

MVP1 implements email/password authentication only (CON-002). Social login (Google, Apple, or similar) is explicitly deferred — not rejected — and is expected to be added in a future increment. The Identity context (CTX-002) owns all authentication and credential management; downstream contexts receive identity data via JWT claims (ADR-0006).

The question is whether to build an abstraction layer in the Identity context from the start — so social providers can be added as plug-in implementations — or to implement email/password directly and introduce the abstraction when the first social provider is added.

The synthesis phase identified this decision as needing resolution before Increment 1 to avoid a refactoring COMP-009 (AuthService) on a live system.

---

## Decision

**Introduce a lightweight `AuthProvider` interface in the Identity context in Increment 1. Email/password authentication is implemented as `EmailPasswordProvider`, the sole concrete implementation in MVP1.**

The abstraction is thin: the interface exposes `authenticate(credentials) → identity` and `registerCredentials(userId, credentials) → void`. The `AuthService` component depends on the interface, not on any concrete provider. At the composition root, `EmailPasswordProvider` is injected.

No OAuth client, no social provider SDK, and no callback endpoints are implemented in MVP1. The abstraction is interface-only.

---

## Consequences

### Positive

- **Social login added without touching existing code** — adding Google or Apple login in a future increment means implementing a new `OAuthProvider` class and registering it at the composition root. The `AuthService`, JWT issuance logic, and all downstream JWT consumers are unchanged.
- **Low upfront cost** — one interface, one implementation. The email/password logic is identical to what it would be without the abstraction; it simply sits behind the interface.
- **Reduced refactor risk on a live system** — refactoring auth middleware on a running application with active users is higher risk than introducing an interface before any users exist.
- **ACL slot is cleanly defined** — the `AuthProvider` interface is the anti-corruption layer (ACL) reserved for EXT-003 in the context map. Its boundary is explicit from day one.

### Negative

- **Minimal upfront abstraction cost** — one interface definition and one indirection in the composition root. This is the full cost; it is small but nonzero compared to a direct implementation.
- **Interface must be kept stable** — if the `authenticate` contract needs to change (e.g., to support MFA), all implementations must be updated. The interface should be designed conservatively: thin, with no provider-specific leakage.

### Neutral

- The `defer_abstraction` alternative would require refactoring `AuthService`, session handling, and token issuance when the first social provider is added. On a live system with active users, that refactor carries meaningful regression risk. The abstraction cost now is lower than the refactor cost later.
- Future providers (OAuth2, OIDC, magic link) all map cleanly to `authenticate(credentials) → identity` — the interface is general enough to accommodate them without modification.

---

## Alternatives considered

**Defer abstraction until social provider is added** — rejected. Social login is a near-certain future requirement (explicitly deferred in vision, not out-of-scope). The abstraction cost at Increment 1 (one interface, zero implementations beyond email/password) is lower than the refactor cost after launch. The YAGNI principle is most applicable when future requirements are uncertain; this one is not.
