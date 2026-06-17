# Test Cases — TC-DAY: Meal Planner — Day Cards

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`06_meal_planner.md`](../requirements/06_meal_planner.md) — Tab 2  
**User stories:** [`meal-planner.md`](../user-stories/meal-planner.md) — US-MP-007 – US-MP-010  
**Test data:** `plannerSeeds` from test-data.json (8 assignments)

---

### TC-DAY-001: Day cards tab shows 7 cards
**AC:** US-MP-007 — one card per day, horizontally scrollable  
**Priority:** High

**Steps:**
1. Click the **Day cards** tab in Planner.

**Expected result:**
- 7 cards visible (Mon–Sun of selected week)
- Cards are horizontally scrollable if they overflow the viewport
- Each card shows day name and date

**Status:** ✅

---

### TC-DAY-002: Each card has four meal slots
**AC:** US-MP-007 — Breakfast, Lunch, Dinner, Snacks per card  
**Priority:** High

**Steps:**
1. Open Day cards tab.
2. Inspect Monday card.

**Expected result:**
- 4 sections: Breakfast, Lunch, Dinner, Snacks
- Monday Breakfast: Berry overnight oats (1 serving)
- Monday Lunch: Chicken quinoa bowl (1 serving)

**Status:** ✅

---

### TC-DAY-003: Day macro strip shows correct totals
**AC:** US-MP-007 — aggregated nutrition strip per day  
**Priority:** High

**Preconditions:** Monday has Berry overnight oats (Breakfast) + Chicken quinoa bowl (Lunch)

**Steps:**
1. View Monday day card.

**Expected result:**
- Nutrition strip shows summed values:
  - kcal: 385 + 450 = **835**
  - protein: 15 + 38 = **53 g**
  - fat: 8 + 12 = **20 g**
  - carbs: 65 + 42 = **107 g**

**Status:** ✅

---

### TC-DAY-004: Add item to a slot via day card
**AC:** US-MP-008 — inline search add; also appears in Weekly summary  
**Priority:** High

**Steps:**
1. On **Thursday** card (no assignments in seed data), click **"+ Add"** in Dinner slot.
2. Type `soup` — select **Broccoli cheddar soup** (r-007).
3. Confirm.

**Expected result:**
- Broccoli cheddar soup appears in Thursday Dinner slot
- Weekly summary shows Broccoli cheddar soup in the Dinner row with `1` in the Thursday cell
- Thursday macro strip updates: +220 kcal

**Status:** ✅

---

### TC-DAY-005: Remove item from a slot
**AC:** US-MP-008 — remove button deletes the assignment  
**Priority:** High

**Steps:**
1. Click **×** on **Lentil tomato soup** in Tuesday Dinner.

**Expected result:**
- Lentil tomato soup removed from Tuesday Dinner
- Weekly summary Tuesday Dinner cell clears
- If Lentil tomato soup has no other assignments, row may auto-remove from summary (or remain with empty cells)

**Status:** ✅

---

### TC-DAY-006: Increase servings with + button
**AC:** US-MP-009 — + increases servings by 0.5 per tap  
**Priority:** Medium

**Preconditions:** **Turkey meatballs** in Sunday Dinner at 2 servings

**Steps:**
1. Click **+** on Turkey meatballs in Sunday Dinner.

**Expected result:**
- Servings change from 2 to 2.5
- Sunday macro strip kcal increases by 145 (0.5 × 290)
- Weekly summary Sunday Dinner cell shows 2.5

**Status:** ✅

---

### TC-DAY-007: Decrease servings with − button — minimum is 0.5
**AC:** US-MP-009 — − decreases by 0.5; minimum 0.5; item not auto-removed  
**Priority:** Medium

**Preconditions:** Turkey meatballs in Sunday Dinner at 2 servings

**Steps:**
1. Click **−** three times (2.0 → 1.5 → 1.0 → 0.5).
2. Click **−** a fourth time when at 0.5.

**Expected result:**
- After 3 clicks: servings show 0.5
- 4th click: servings remain at 0.5 (does not go below 0.5; item not removed)
- To remove the item, the × button must be used

**Status:** ✅

---

### TC-DAY-008: Drag item to a different meal slot on the same card
**AC:** US-MP-010 — drag within a card reassigns meal slot  
**Priority:** Low

**Steps:**
1. Drag **Berry overnight oats** from Monday Breakfast to Monday Lunch.

**Expected result:**
- Berry overnight oats appears in Monday Lunch
- Monday Breakfast slot is cleared of Berry overnight oats
- Weekly summary row for Berry overnight oats updates: Monday column moves from Breakfast slot to Lunch slot

**Status:** 🚫

---

### TC-DAY-009: Drag item to a different day card
**AC:** US-MP-010 — drag across cards changes day  
**Priority:** Low

**Steps:**
1. Drag **Greek salad** from Friday Lunch to Saturday Lunch.

**Expected result:**
- Greek salad in Saturday Lunch
- Friday Lunch cleared
- Weekly summary: Friday cell clears; Saturday cell shows the assignment

**Status:** 🚫
