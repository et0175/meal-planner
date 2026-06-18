# Test Cases — TC-AUTH: Authentication

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`08_authentication.md`](../requirements/08_authentication.md)  
**User stories:** [`authentication.md`](../user-stories/authentication.md) — US-AUTH-001 – US-AUTH-007  
**Test data:** User u-001 (registered); user u-002 (registered, different email); user u-003 (no diet set)  
**Note:** Authentication is not implemented in the prototype. All cases are 🚫.

---

### TC-AUTH-001: Registration form is accessible without sign-in
**AC:** US-AUTH-001 — registration form reachable by unauthenticated visitors  
**Priority:** High

**Preconditions:** No user is signed in

**Steps:**
1. Navigate to the app root.
2. Locate the registration / sign-up option.

**Expected result:**
- Registration form is accessible without credentials
- Form contains at minimum an email field and a password field

**Status:** 🚫

---

### TC-AUTH-002: Registration — validation rejects empty fields and short passwords
**AC:** US-AUTH-001 — empty fields rejected; passwords < 8 chars rejected  
**Priority:** High

**Steps (empty fields):**
1. Open registration form.
2. Submit without filling any fields.

**Expected result:**
- Submission blocked; error shown for each empty required field

**Steps (short password):**
3. Enter a valid email and a 7-character password; submit.

**Expected result:**
- Submission blocked; clear validation message states minimum password length (8 characters)

**Status:** 🚫

---

### TC-AUTH-003: Registration — duplicate email rejected without enumeration
**AC:** US-AUTH-001 — duplicate email rejected; error does not confirm address exists  
**Priority:** High

**Test data:** Email already registered to u-001

**Steps:**
1. Submit registration form with an email already in use.

**Expected result:**
- Registration is rejected
- Error message does not confirm whether the address is already registered (e.g. "If this email is available, your account has been created" or equivalent)

**Status:** 🚫

---

### TC-AUTH-004: Successful registration signs user in and lands on Planner
**AC:** US-AUTH-001 — successful registration auto signs in and redirects to Planner  
**Priority:** High

**Steps:**
1. Submit registration form with a unique email and password of 8+ characters.

**Expected result:**
- Account created
- User is signed in automatically
- Landing view is Planner (not sign-in screen)

**Status:** 🚫

---

### TC-AUTH-005: Sign in with correct credentials
**AC:** US-AUTH-002 — correct email + password grants access and lands on Planner  
**Priority:** High

**Preconditions:** Signed out

**Steps:**
1. Navigate to sign-in screen.
2. Enter email and password for u-001.
3. Submit.

**Expected result:**
- Access granted; landing view is Planner
- Sidebar and topbar are visible

**Status:** 🚫

---

### TC-AUTH-006: Sign in with wrong credentials shows generic error
**AC:** US-AUTH-002 — incorrect credentials show a generic error (no email/password specificity)  
**Priority:** High

**Steps:**
1. Enter a valid email and an incorrect password.
2. Submit.

**Expected result:**
- Access denied
- Error message is generic (e.g. "Invalid email or password") — does not specify which field is wrong

**Status:** 🚫

---

### TC-AUTH-007: Sign in — rate limiting after repeated failures
**AC:** US-AUTH-002 — account locked or rate-limited after configurable number of consecutive failures  
**Priority:** Medium

**Steps:**
1. Repeatedly submit wrong credentials for the same email address until the configured threshold is reached.

**Expected result:**
- After the threshold, sign-in attempts are blocked or delayed
- Message indicates when the user can try again (or how to unlock)

**Status:** 🚫

---

### TC-AUTH-008: Sign out — session invalidated, back button does not restore session
**AC:** US-AUTH-003 — sign out accessible from anywhere; session invalidated; back button does not restore  
**Priority:** High

**Preconditions:** Signed in as u-001

**Steps:**
1. Trigger sign-out action from the navigation or profile area.
2. Verify redirect to sign-in screen.
3. Press the browser back button.

**Expected result:**
- Redirect to sign-in after sign-out
- Back button does not return to an authenticated view; user remains on sign-in or is redirected there

**Status:** 🚫

---

### TC-AUTH-009: Password reset — link sent; no enumeration; link is single-use and expiring
**AC:** US-AUTH-004 — "Forgot password?" available; reset link sent; confirmation identical for registered and unregistered emails; link single-use and expires  
**Priority:** High

**Steps:**
1. Click **"Forgot password?"** on the sign-in screen.
2. Submit with the email of u-001 (registered).
3. Note the confirmation message.
4. Submit with a non-existent email.

**Expected result:**
- Confirmation message is identical in both cases (no enumeration)
- A reset link is sent to u-001's inbox (or captured by the test harness)
- Following the reset link opens a form to set a new password
- Following the same link a second time (after it has been used) shows an "expired or already used" message

**Status:** 🚫

---

### TC-AUTH-010: Unauthenticated access to protected routes redirects to sign-in
**AC:** US-AUTH-006 — direct URL to any protected route redirects to sign-in; after sign-in redirects to originally requested URL  
**Priority:** High

**Preconditions:** Signed out

**Steps:**
1. Navigate directly to a protected route (e.g. `/planner` or `/products`).
2. Sign in.

**Expected result:**
- Step 1: Redirected to sign-in screen; no application data visible
- Step 2: After sign-in, redirected to the originally requested URL (not the default Planner), or to Planner if no specific URL was requested

**Status:** 🚫

---

### TC-AUTH-011: Session persists across page reloads
**AC:** US-AUTH-005 — session persists within the same browser session without re-authentication  
**Priority:** Medium

**Preconditions:** Signed in as u-001

**Steps:**
1. Reload the browser tab.
2. Navigate between several modules.

**Expected result:**
- No re-authentication required within the same browser session
- All previously visible data remains accessible after reload

**Status:** 🚫

---

### TC-AUTH-012: User role and Nutritionist role have identical feature access in MVP1
**AC:** US-AUTH-007 — both roles see the same navigation and features in MVP1  
**Priority:** Low

**Steps:**
1. Sign in as a User-role account.
2. Note all visible navigation items and available actions.
3. Sign in as a Nutritionist-role account.
4. Note all visible navigation items and available actions.

**Expected result:**
- Navigation items are identical for both roles (no role-specific menu items hidden or shown)
- All functional views (Products, Analyser, Recipes, Diets, Planner, Shopping list, Personal cabinet) are accessible to both roles

**Status:** 🚫
