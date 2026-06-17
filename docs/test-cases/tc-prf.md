# Test Cases — TC-PRF: Personal Cabinet / Profile

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`05_personal_cabinet.md`](../requirements/05_personal_cabinet.md)  
**User stories:** [`personal-cabinet.md`](../user-stories/personal-cabinet.md)  
**Test data:** Users u-001 (Mediterranean, 2000 kcal), u-002 (Keto, 1800 kcal), u-003 (empty profile)

---

### TC-PRF-001: Profile view sections are present
**AC:** US-PC-001 – US-PC-006 — all profile sections visible  
**Priority:** High

**Steps:**
1. Click **Profile** in the sidebar.

**Expected result:**
All sections present:
- Personal: email/password, language, unit system, gender, age, weight
- Diet preferences: diet selector, calorie target, macro % inputs, calorie corridor
- Meal tracking log

**Status:** ✅

---

### TC-PRF-002: Calorie corridor calculates correctly
**AC:** US-PC-005 — corridor = target ± 150  
**Priority:** High

**Test data:** `formInputs.profileForm.calorieTarget`

**Steps:**
1. Set calorie target to **2000**.
2. Observe corridor display.

**Expected result:**
- Corridor shows **"1850 – 2150 kcal"**

**Steps:**
3. Change target to **1500**.

**Expected result:**
- Corridor shows **"1350 – 1650 kcal"**

**Status:** ✅

---

### TC-PRF-003: Macro validation — sums to 100% is accepted (VALID-MAC-001)
**AC:** US-PC-005 — no warning when sum = 100%  
**Priority:** High

**Test data:** `formInputs.profileForm.validMacros[0]` — protein 30, fat 35, carbs 35 (sum = 100)

**Steps:**
1. Set protein = 30%, fat = 35%, carbs = 35%.
2. Observe UI.

**Expected result:**
- No warning shown
- Values accepted

**Status:** ✅

---

### TC-PRF-004: Macro validation — over 100% shows warning (INVALID-MAC-001)
**AC:** US-PC-005 — warning when sum ≠ 100%  
**Priority:** High

**Test data:** `formInputs.profileForm.invalidMacros[0]` — protein 50, fat 50, carbs 50 (sum = 150)

**Steps:**
1. Set protein = 50%, fat = 50%, carbs = 50%.
2. Observe UI.

**Expected result:**
- Warning message shown: "Macro percentages must sum to 100%" (or equivalent)
- Warning visible without requiring form submission

**Status:** ✅

---

### TC-PRF-005: Macro validation — under 100% shows warning (INVALID-MAC-002)
**AC:** US-PC-005 — warning when sum < 100%  
**Priority:** Medium

**Test data:** `formInputs.profileForm.invalidMacros[1]` — protein 10, fat 10, carbs 10 (sum = 30)

**Steps:**
1. Set protein = 10%, fat = 10%, carbs = 10%.

**Expected result:**
- Same warning as TC-PRF-004

**Status:** ✅

---

### TC-PRF-006: Active diet shown in Planner header
**AC:** US-PC-005 / US-MP-015 — active diet label in planner header  
**Priority:** High

**Steps:**
1. In Profile, set active diet to **Ketogenic**.
2. Navigate to Planner.

**Expected result:**
- Planner header shows "Ketogenic" (or "Keto") diet label
- Label is informational only — no foods are filtered or blocked

**Status:** ✅

---

### TC-PRF-007: No active diet — label hidden in Planner
**AC:** US-MP-015 — label not shown when no diet selected  
**Priority:** Medium

**Steps:**
1. In Profile, clear / deselect the active diet.
2. Navigate to Planner.

**Expected result:**
- No diet label shown in Planner header

**Status:** ✅

---

### TC-PRF-008: Language preference selector is present
**AC:** US-PC-002 — language setting available  
**Priority:** Low

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Language dropdown present (options: English, Ukrainian at minimum)

**Status:** ✅

---

### TC-PRF-009: Unit system toggle is present
**AC:** US-PC-003 — metric / US customary toggle  
**Priority:** Medium

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Metric / US customary (imperial) toggle present

**Status:** ✅

---

### TC-PRF-010: Demographic fields are present
**AC:** US-PC-004 — gender, age, weight, body composition  
**Priority:** Medium

**Steps:**
1. Open Profile > Personal section.

**Expected result:**
- Fields present: Gender (selector), Age (numeric input), Weight (numeric input)

**Status:** ✅

---

### TC-PRF-011: Keto macro split — correct corridor (VALID-MAC-002)
**AC:** US-PC-005 — keto split (25/70/5) accepted with no warning  
**Priority:** Medium

**Test data:** `formInputs.profileForm.validMacros[1]` — protein 25, fat 70, carbs 5

**Steps:**
1. Set protein = 25%, fat = 70%, carbs = 5%.
2. Set calorie target to 1800.

**Expected result:**
- No macro warning (sums to 100%)
- Corridor: **"1650 – 1950 kcal"**

**Status:** ✅

---

### TC-PRF-012: Change email address
**AC:** US-PC-001 — email change requires password confirmation and new address must be unique  
**Priority:** High

**Test data:** User u-001 (ol.melnikowa@gmail.com); existing user u-002 has a different email

**Steps (happy path):**
1. Open Profile.
2. Locate the **Change email** control.
3. Enter a new unique email address and the current password.
4. Submit.

**Expected result:**
- Email is updated; new address is shown in the profile
- No error shown

**Steps (duplicate email):**
5. Repeat with an email address already in use by another account.

**Expected result:**
- Change is rejected with an error message
- Error does not reveal whether the address belongs to an existing account (per US-AUTH-001 enumeration rule)

**Steps (wrong password):**
6. Repeat with the correct new email but an incorrect current password.

**Expected result:**
- Change is rejected with a "wrong password" error

**Status:** 🚫

---

### TC-PRF-013: Change password
**AC:** US-PC-001 — password change requires current password; after change, current session is invalidated  
**Priority:** High

**Test data:** User u-001; current password known

**Steps (happy path):**
1. Open Profile.
2. Locate the **Change password** control.
3. Enter the current password and a new password of 8+ characters.
4. Submit.

**Expected result:**
- Password is changed
- Current session is invalidated immediately
- User is redirected to the sign-in screen
- Old password no longer grants access

**Steps (short new password):**
5. Attempt with a new password of 7 characters.

**Expected result:**
- Change is rejected with a clear minimum-length validation message
- Session is not invalidated

**Steps (wrong current password):**
6. Attempt with an incorrect current password and a valid new password.

**Expected result:**
- Change is rejected with a "wrong password" error
- Session is not invalidated

**Status:** 🚫
