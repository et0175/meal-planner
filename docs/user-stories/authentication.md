# User stories: authentication

Requirements: [08_authentication.md](../requirements/08_authentication.md)

---

## US-AUTH-001 Register a new account

**As a** new visitor  
**I want** to create an account with my email address and a password  
**So that** I can access the application and my data is stored under my identity.

**Acceptance criteria**

- [ ] A registration form is accessible without signing in.
- [ ] Form requires email and password; submission with either field empty is rejected.
- [ ] Registering with an email already in use is rejected; the error message does not confirm whether the address exists.
- [ ] Successful registration signs the user in automatically and lands on the default view (Planner).
- [ ] Passwords shorter than 8 characters are rejected with a clear validation message.

---

## US-AUTH-002 Sign in with email and password

**As a** registered user  
**I want** to sign in with my email and password  
**So that** I can access my personal data and plans.

**Acceptance criteria**

- [ ] A sign-in form is shown to unauthenticated visitors on any protected route.
- [ ] Entering correct email and password grants access and lands on the default view (Planner).
- [ ] Entering incorrect credentials shows a generic error that does not specify whether the email or password was wrong.
- [ ] After a configurable number of consecutive failed attempts the account is locked or rate-limited, with a message indicating when the user can try again.

---

## US-AUTH-003 Sign out

**As a** signed-in user  
**I want** to sign out explicitly  
**So that** my session is closed, especially on shared devices.

**Acceptance criteria**

- [ ] A sign-out action is accessible from any authenticated screen (e.g. in the navigation or profile area).
- [ ] Signing out invalidates the session and redirects to the sign-in screen.
- [ ] After sign-out, using the browser back button does not restore the authenticated session.

---

## US-AUTH-004 Reset a forgotten password

**As a** user who cannot remember their password  
**I want** to request a password reset link by email  
**So that** I can regain access to my account without contacting support.

**Acceptance criteria**

- [ ] A "Forgot password?" link is available on the sign-in screen.
- [ ] Entering a registered email sends a reset link to that address.
- [ ] The confirmation message is identical whether or not the email exists in the system (no enumeration).
- [ ] Following the reset link opens a form to set a new password.
- [ ] The reset link is single-use and expires after a defined time window; expired or already-used links show a clear message.
- [ ] After a successful reset, the old password is invalidated and the user is redirected to sign-in.

---

## US-AUTH-005 Stay signed in during a browser session

**As a** signed-in user  
**I want** my session to persist while the browser tab is open  
**So that** I do not have to sign in again every time I navigate within the app.

**Acceptance criteria**

- [ ] Navigating between pages or reloading the app does not require re-authentication within the same browser session.
- [ ] Session is automatically invalidated on sign-out.
- [ ] Session is automatically invalidated when the user changes their password (see US-PC-001).

---

## US-AUTH-006 Unauthenticated users cannot access the app

**As a** product owner  
**I want** all application modules to require authentication  
**So that** user data is protected and the product is accessed only by registered users.

**Acceptance criteria**

- [ ] Any direct URL to a protected route redirects unauthenticated visitors to the sign-in screen.
- [ ] After signing in, the user is redirected to the originally requested URL (or the default view if no specific URL was requested).
- [ ] No application data (products, recipes, plans) is accessible or visible before sign-in.

---

## US-AUTH-007 User and Nutritionist roles have identical permissions in MVP1

**As a** system  
**I want** both the User and Nutritionist roles to have identical access in MVP1  
**So that** role infrastructure is in place without exposing unimplemented permission differences.

Source: [08_authentication.md](../requirements/08_authentication.md) — Roles

**Acceptance criteria**

- [ ] Users register with the User role by default; the Nutritionist role is not selectable at sign-up.
- [ ] The Nutritionist role can only be assigned by a system administrator.
- [ ] In MVP1, both roles see the same navigation, features, and data — no permission differences are enforced.
- [ ] The system stores the user's role on the account but does not expose role-specific UI in MVP1.
