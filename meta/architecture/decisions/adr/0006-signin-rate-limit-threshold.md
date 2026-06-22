# ADR-0006: Sign-in rate-limit threshold and lockout window

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

FR-003 requires rate-limiting sign-in attempts after a configurable number of
consecutive failures to protect against brute-force attacks (US-002). The requirement
specifies neither a threshold nor a cooldown duration. The trade-off is between
security (fewer attempts, shorter window) and user experience (more attempts,
shorter window for legitimate users who mistype passwords).

CON-003 constrains auth to session-based email + password with no OAuth/SSO, making
the password the sole credential and brute-force protection correspondingly important.

## Decision

We will lock sign-in for 1 hour after 10 consecutive failed attempts from the same
account. This reduces disruption for typo-prone users while still providing
meaningful brute-force protection. Both the threshold and the lockout duration should
be stored as configurable values so they can be tightened without a code change if
operational data suggests abuse.

## Alternatives considered

### 5_attempts_15min_window
Lock for 15 minutes after 5 consecutive failures. Provides tighter brute-force
protection and is the more common industry default. Rejected because a 5-attempt
threshold is easily triggered by legitimate users who mistype their password on a
mobile keyboard, and a 15-minute lockout with no self-service unlock creates
noticeable friction for a consumer-facing meal planning tool.

## Consequences

### Positive
- Meaningful protection against automated brute-force attacks while minimising
  lockouts for legitimate users who occasionally mistype.
- Configurable thresholds allow operational tuning without a deployment.

### Negative
- A 10-attempt threshold gives a determined attacker more guesses per hour than
  the 5-attempt alternative. For accounts with weak passwords this marginally
  increases risk.
- A 1-hour lockout with no admin unlock UI (there is no admin panel in MVP1) means
  a locked user must wait the full hour; support cannot unblock them manually in MVP1.

### Neutral
- Failed attempt counters should reset on successful sign-in, not just on lockout
  expiry, to avoid penalising users who eventually remember their password.
- The lockout message shown to the user should indicate when they can try again
  (FR-003) without revealing the exact threshold or counter state.

## References

- DEC-002 (resolved by this ADR)
- FR-003 (rate-limiting requirement)
- US-002 (sign-in story)

## History

- 2026-06-22: Created — 10-attempt / 1-hour lockout chosen to favour UX over
  maximum brute-force resistance for MVP1 consumer audience.
