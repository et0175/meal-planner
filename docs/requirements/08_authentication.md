# Business requirements: authentication

All application modules are accessible to authenticated users only. Unauthenticated visitors are redirected to the sign-in screen.

---

## Functional requirements

### Registration

- Users register with a unique email address and a password.
- Registering with an email that already exists is rejected with a clear message that does not confirm whether the address is in the system.
- Password must meet a minimum strength policy (at least 8 characters; exact rules defined by implementation).
- On successful registration, the user is signed in automatically and lands on the default application view (Planner).

### Sign-in

- Users sign in with email and password.
- Failed sign-in attempts show a generic error that does not reveal whether the email or the password was the cause.
- After a configurable number of consecutive failed attempts, the account is temporarily locked or rate-limited.

### Sign-out

- Users can sign out from any authenticated screen.
- Signing out invalidates the session and redirects to the sign-in screen.
- After sign-out, navigating back does not restore the authenticated session.

### Password reset

- A user who cannot sign in can request a password reset by entering their registered email address.
- The system sends a reset link to that address. The link expires after a defined time window.
- Following the link allows the user to set a new password.
- After a successful reset, the old password is invalidated and the user is redirected to sign-in.
- Requesting a reset for an email not in the system returns the same confirmation message as a valid request (no enumeration).

### Session management

- After sign-in, the session persists for the browser session by default.
- A signed-in session is invalidated on sign-out and on password change (see `05_personal_cabinet.md`).
- For MVP1, "session" means the current browser session only. Multi-device session invalidation (sign out all devices) is deferred to a later iteration.

### Roles

- All users register as a User (ACT-001). The role is not selectable at sign-up.
- The Nutritionist role (ACT-002) is assigned by a system administrator and is not self-selectable. For MVP1, there is no admin UI for role assignment; it is a back-end / operations procedure only.
- In MVP1, both roles share identical system permissions (see `actors.yml`).

### Out of scope for MVP1

- Social / OAuth login (Google, Apple, etc.)
- Two-factor authentication (2FA)
- Email verification on registration
- Remember-me / persistent sessions across browser closes

---

## UI / Prototype spec

- Standard sign-in and registration forms; no specific layout constraints defined for this module.
- The authentication module is not implemented in the current prototype (all test cases are 🚫 Not implemented).
