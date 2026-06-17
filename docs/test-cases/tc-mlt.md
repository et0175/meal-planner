# Test Cases — TC-MLT: Meal Tracking

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`05_personal_cabinet.md`](../requirements/05_personal_cabinet.md) — Meal tracking section  
**User stories:** [`personal-cabinet.md`](../user-stories/personal-cabinet.md) — US-PC-006 – US-PC-009  
**Test data:** Users u-001 (Mediterranean, 2000 kcal target); products p-001, r-001 for log entries

---

### TC-MLT-001: Meal tracking section present in Profile
**AC:** US-PC-006 — log section visible  
**Priority:** High

**Steps:**
1. Open Profile.

**Expected result:**
- Meal tracking / food log section present
- "Add entry" button visible
- Daily history area visible

**Status:** ✅

---

### TC-MLT-002: Add a product log entry
**AC:** US-PC-006 — add log entry for a product  
**Priority:** High

**Steps:**
1. Click **"Add entry"** in Meal tracking.
2. Search for **Greek yogurt** (p-001).
3. Enter quantity: 200 g.
4. Confirm.

**Expected result:**
- Entry appears in today's log: "Greek yogurt — 200 g — 117 kcal" (88 kcal per 150 g × 200/150)
- Daily total updates: kcal increases by 117

**Status:** ✅

---

### TC-MLT-003: Add a recipe log entry
**AC:** US-PC-006 — add log entry for a recipe  
**Priority:** High

**Steps:**
1. Click **"Add entry"**.
2. Search for **Berry overnight oats** (r-001).
3. Enter quantity: 1 serving.
4. Confirm.

**Expected result:**
- Entry appears: "Berry overnight oats — 1 serving — 385 kcal"
- Daily kcal total increases by 385

**Status:** ✅

---

### TC-MLT-004: Daily nutrition summary totals across entries
**AC:** US-PC-006 — daily view aggregates nutrition  
**Priority:** High

**Preconditions:** Add Greek yogurt 200 g (TC-MLT-002) and Berry overnight oats 1 serving (TC-MLT-003)

**Steps:**
1. View daily summary in Meal tracking.

**Expected result:**
- Total kcal: 117 + 385 = **502 kcal**
- Total protein: approx. 20 + 15 = **35 g**
- Total fat: approx. 0.8 + 8 = **8.8 g**
- Total carbs: approx. 7.2 + 65 = **72.2 g**

**Status:** ✅

---

### TC-MLT-005: Meal tracking does not create a planner assignment
**AC:** US-PC-006 — tracking and planning are independent  
**Priority:** High

**Steps:**
1. Log **Chicken quinoa bowl** (r-004) in Meal tracking.
2. Navigate to Planner > Weekly summary.

**Expected result:**
- No new assignment for Chicken quinoa bowl created by the log entry
- Only the pre-existing seed assignment (Monday Lunch) appears

**Status:** ✅

---

### TC-MLT-006: Planner assignment does not create a log entry
**AC:** US-PC-006 — planning an item does not log it as eaten  
**Priority:** High

**Steps:**
1. In Planner, add **Almond energy snack** (r-011) to Friday Snacks.
2. Navigate to Meal tracking.

**Expected result:**
- No entry for Almond energy snack in today's Meal tracking log

**Status:** ✅

---

### TC-MLT-007: Edit a log entry
**AC:** US-PC-006 — entries are editable  
**Priority:** Medium

**Preconditions:** Greek yogurt 200 g entry added (TC-MLT-002)

**Steps:**
1. Click edit on the Greek yogurt entry.
2. Change quantity from 200 g to 300 g.
3. Save.

**Expected result:**
- Entry updates: 300 g, kcal recalculated (≈ 176 kcal)
- Daily total recalculates

**Status:** ✅

---

### TC-MLT-008: Delete a log entry
**AC:** US-PC-006 — entries can be removed  
**Priority:** Medium

**Preconditions:** Berry overnight oats entry added (TC-MLT-003)

**Steps:**
1. Click delete on the Berry overnight oats log entry.

**Expected result:**
- Entry removed from today's log
- Daily total decreases by 385 kcal

**Status:** ✅

---

### TC-MLT-009: Meal tracking calendar view is accessible
**AC:** US-PC-007 — calendar view shows logged days  
**Priority:** High

**Steps:**
1. Log **Greek yogurt 200 g** (TC-MLT-002) and **Berry overnight oats 1 serving** (TC-MLT-003).
2. In Profile > Meal tracking, switch to the calendar view.

**Expected result:**
- Calendar view renders with day cells for the current week
- Today's cell shows Greek yogurt and Berry overnight oats (or total kcal 502)
- A visual indicator shows whether today's logged kcal is within the calorie corridor

**Status:** 🚫

---

### TC-MLT-010: Calendar tracking view navigates between weeks
**AC:** US-PC-007 — week/month navigation in tracking calendar  
**Priority:** Medium

**Steps:**
1. In the tracking calendar view, click **Prev week**.
2. Click **Next week**.

**Expected result:**
- Calendar shifts to the previous / next week
- Empty cells shown for days with no logged entries

**Status:** 🚫

---

### TC-MLT-011: Daily goal corridor summary — within target
**AC:** US-PC-008 — "Within goal" shown when kcal is in corridor  
**Priority:** High

**Test data:** User u-001: calorie target 2000 kcal → corridor 1850–2150 kcal

**Preconditions:** Log entries totalling **1950 kcal** for today

**Steps:**
1. Log entries summing to 1950 kcal.
2. View the goal corridor summary panel.

**Expected result:**
- Panel shows today's logged kcal: 1950
- Status label: "Within goal" (or equivalent positive indicator)
- Corridor shown: 1850–2150 kcal

**Status:** 🚫

---

### TC-MLT-012: Daily goal corridor summary — below target
**AC:** US-PC-008 — "Below target" shown when kcal is under corridor  
**Priority:** Medium

**Preconditions:** Log entries totalling **1200 kcal** for today; user corridor 1850–2150

**Steps:**
1. Log entries summing to 1200 kcal.
2. View corridor summary panel.

**Expected result:**
- Status label: "Below target" (or equivalent warning indicator)

**Status:** 🚫

---

### TC-MLT-013: Weekly corridor summary — days on target count
**AC:** US-PC-008 — weekly summary shows days on target out of 7  
**Priority:** Medium

**Preconditions:** Mock scenario: 4 days this week have logged kcal within 1850–2150; 3 days do not

**Steps:**
1. View the weekly corridor summary in Meal tracking.

**Expected result:**
- Summary shows: "4 / 7 days on target" (or equivalent)

**Status:** 🚫

---

### TC-MLT-014: Daily nutrition progress percentages
**AC:** US-PC-009 — consumed macros shown as % of target  
**Priority:** High

**Test data:** User u-001: calorie target 2000 kcal; macros protein 30% (150 g), fat 35% (78 g), carbs 35% (175 g)  
**Preconditions:** Log entries: Greek yogurt 200 g + Berry overnight oats 1 serving → total kcal 502

**Steps:**
1. View daily nutrition progress in Meal tracking.

**Expected result:**
- kcal consumed: 502 → **25%** of 2000 target shown
- Protein: ~35 g → ~23% of 150 g target shown
- Fat: ~8.8 g → ~11% of 78 g target shown
- Carbs: ~72 g → ~41% of 175 g target shown
- Percentage values update when a new entry is added or removed

**Status:** 🚫
