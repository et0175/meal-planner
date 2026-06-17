# Test Cases — TC-SHP: Shopping List

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`07_shopping_list.md`](../requirements/07_shopping_list.md)  
**User stories:** [`shopping-list.md`](../user-stories/shopping-list.md)  
**Test data:** `plannerSeeds._derivedShoppingList` from test-data.json

---

### TC-SHP-001: Shopping list is a top-level navigation item
**AC:** US-SL-001 — separate nav item  
**Priority:** High

**Steps:**
1. Open app.
2. Observe sidebar.

**Expected result:**
- "Shopping list" appears as a dedicated sidebar entry, separate from Planner
- Clicking it shows the shopping list view; Planner state unaffected

**Status:** ✅

---

### TC-SHP-002: Default date range is current calendar week
**AC:** US-SL-002 — default range Mon–Sun of current week  
**Priority:** High

**Steps:**
1. Navigate to **Shopping list**.

**Expected result:**
- "From" date = Monday of current week
- "To" date = Sunday of current week
- Plan summary populated from current week's seed assignments

**Status:** ✅

---

### TC-SHP-003: Plan summary shows seeded items with correct totals
**AC:** US-SL-003 — item name, total servings, kcal contribution  
**Priority:** High

**Preconditions:** Default date range (current week); seed assignments from test-data.json

**Steps:**
1. Open Shopping list with default range.
2. Inspect the plan summary section.

**Expected result** (from test-data.json seeds):

| Item | Total servings | kcal contribution |
|---|---|---|
| Berry overnight oats | 1 | 385 |
| Chicken quinoa bowl | 1 | 450 |
| Lentil tomato soup | 1 | 280 |
| Spinach omelette | 1 | 225 |
| Chickpea curry | 2 | 620 |
| Avocado toast | 1 | 310 |
| Greek salad | 1 | 265 |
| Turkey meatballs | 2 | 580 |

**Status:** ✅

---

### TC-SHP-004: Grocery list is grouped by category
**AC:** US-SL-004 — lines grouped under Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other  
**Priority:** High

**Steps:**
1. Generate grocery list from current week seeds.

**Expected result:**
- Lines appear under category headers
- **Dairy** group contains: Greek yogurt, Whole eggs, Whole milk
- **Produce** group contains: Baby spinach, Banana, Cherry tomatoes, Avocado
- **Meat** group contains: Chicken breast, Ground turkey
- **Grains** group contains: Quinoa, Rolled oats, Whole wheat bread
- **Legumes** group contains: Chickpeas, Red lentils
- **Condiments** group contains: Olive oil
- **Nuts & Seeds** group contains: Chia seeds

**Status:** ✅

---

### TC-SHP-005: Same ingredient aggregated across multiple recipes
**AC:** US-SL-004 — quantities for same ingredient summed on one line  
**Priority:** High

**Preconditions:** Current week seeds; Cherry tomatoes appear as ingredient in:
- Chicken quinoa bowl: 50 g
- Lentil tomato soup: 150 g
- Chickpea curry (×2 servings): 150 g × 2 = 300 g
- Greek salad: 100 g
- Turkey meatballs (×2 servings): 100 g × 2 = 200 g

**Steps:**
1. Generate grocery list.
2. Find Cherry tomatoes in the Produce category.

**Expected result:**
- One line: **Cherry tomatoes — 800 g** (50 + 150 + 300 + 100 + 200)
- Not listed separately per recipe

**Status:** ✅

---

### TC-SHP-006: Each grocery line shows name, quantity, and unit
**AC:** US-SL-004 — line format: name, total quantity, unit  
**Priority:** High

**Steps:**
1. Inspect any line in the grocery list.

**Expected result:**
- Format: `[Name] — [quantity] [unit]`
- Example: `Rolled oats — 70 g`, `Chia seeds — 53 g`, `Banana — 1 pc`

**Status:** ✅

---

### TC-SHP-007: Changing date range filters the list
**AC:** US-SL-002 — date change updates plan summary and grocery list  
**Priority:** High

**Steps:**
1. Change the **"To"** date to Wednesday of the current week.

**Expected result:**
- Plan summary now only shows: Berry overnight oats (Mon Breakfast), Chicken quinoa bowl (Mon Lunch), Lentil tomato soup (Tue Dinner), Spinach omelette (Wed Breakfast), Chickpea curry (Wed Lunch)
- Thursday–Sunday assignments excluded
- Grocery list recalculates to reflect only Mon–Wed items

**Status:** ✅

---

### TC-SHP-008: Invalid date range (end before start) is rejected
**AC:** US-SL-005 — validation error; list not generated  
**Priority:** Medium

**Steps:**
1. Set "From" = current Wednesday, "To" = current Monday.

**Expected result:**
- Validation error shown ("End date must be after start date" or similar)
- List not generated or cleared

**Status:** ✅

---

### TC-SHP-009: List stale after plan change
**AC:** US-SL-005 — stale indicator shown after plan change  
**Priority:** Medium

**Steps:**
1. Generate list from current week seeds.
2. Navigate to Planner and add **Chia pudding** to Thursday Snacks.
3. Return to Shopping list.

**Expected result:**
- Stale indicator shown ("List stale" or similar badge)
- Old list still visible until refreshed

**Status:** ✅

---

### TC-SHP-010: Refresh regenerates the list
**AC:** US-SL-005 — refresh clears stale indicator and regenerates from current plan  
**Priority:** Medium

**Preconditions:** Stale state (TC-SHP-009)

**Steps:**
1. Click **"Refresh list"**.

**Expected result:**
- List regenerates; Chia pudding ingredients included (chia seeds 28 g, whole milk 200 ml, banana 0.5 pc)
- Stale indicator clears

**Status:** ✅

---

### TC-SHP-011: Empty range produces empty list
**AC:** US-SL-002 / US-SL-003 — empty state  
**Priority:** Low

**Steps:**
1. Set date range to a future month with no assignments.
2. Generate list.

**Expected result:**
- Plan summary shows no items
- Grocery list is empty or shows "No items planned for this period"

**Status:** ✅

---

### TC-SHP-012: Grocery list auto-generates on navigation
**AC:** US-SL-006 — list is generated automatically on navigating to Shopping list  
**Priority:** High

**Steps:**
1. Ensure seed plan data is loaded.
2. Click **Shopping list** in the sidebar.

**Expected result:**
- Plan summary and grocery list are populated immediately on arrival — no "Generate" button press required
- Default date range is current calendar week
- Plan summary and grocery list match the seeded assignments (same content as TC-SHP-003 and TC-SHP-004)

**Status:** ✅

---

### TC-SHP-013: Changing date range auto-regenerates list
**AC:** US-SL-006 — date range change triggers immediate regeneration  
**Priority:** High

**Preconditions:** Shopping list is open and auto-generated for current week

**Steps:**
1. Change the **"To"** date to Wednesday of the current week.

**Expected result:**
- Plan summary and grocery list update immediately without a separate button press
- Only Mon–Wed assignments shown (same filtering as TC-SHP-007)

**Status:** ✅
