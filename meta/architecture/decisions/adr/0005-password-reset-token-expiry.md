# ADR-0005: Password reset token expiry window

**Status:** Accepted  
**Date:** 2026-06-22  
**Deciders:** @omelnikova  
**Revised:** —

## Context

FR-005 and US-004 require that password reset links be single-use and expire after
a defined time window. The requirement does not specify the duration. The token is
delivered by email (EXT-001) and must be usable for long enough to survive email
delivery delays while being short enough to limit the exposure window if intercepted.
CON-003 constrains auth to session-based email + password with no OAuth/SSO.

## Decision

We will set the password reset token expiry to 60 minutes from issuance. This is the
standard industry default, limits the attack window to one hour in the event of email
interception, and is sufficient for all but the most delayed email delivery scenarios.

## Alternatives considered

### 24_hours
Token valid for 24 hours. More forgiving for users on slow or filtered email
systems. Rejected because a 24-hour window significantly extends the exposure
period if the reset email is forwarded, leaked, or intercepted — the security
trade-off is not justified for a one-hour convenience gain.

## Consequences

### Positive
- Short exposure window reduces risk of token interception abuse.
- Consistent with industry norms; users familiar with other products will expect this behaviour.

### Negative
- Users whose email delivery is delayed beyond 60 minutes will receive an expired
  link and must request a new one. A clear expiry message and easy re-request flow
  mitigate this friction.

### Neutral
- The expiry duration should be stored as a configurable value (environment variable
  or config file) so it can be adjusted without a code change if operational data
  suggests the 60-minute window causes excessive re-requests.

## References

- DEC-001 (resolved by this ADR)
- FR-005 (single-use expiring reset token requirement)
- INV-002 (token invariant in UserAccount aggregate)
- US-004 (password reset story)

## History

- 2026-06-22: Created — 1-hour expiry chosen as standard industry default.
