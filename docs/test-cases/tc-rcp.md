# Test Cases — TC-RCP: Recipe Analyser

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`04_recipe_analyser.md`](../requirements/04_recipe_analyser.md)  
**User stories:** [`recipe-analyser.md`](../user-stories/recipe-analyser.md)  
**Test data:** Recipes r-001 – r-012 from test-data.json

---

### TC-RCP-001: Recipes view opens in category cards view by default
**AC:** US-RA-014 — recipes opens in category cards view; no cards view  
**Priority:** High

**Steps:**
1. Click **Recipes** in the sidebar.

**Expected result:**
- Recipes view opens in **category cards view** (one card per recipe category)
- No individual recipe cards shown in the default state
- No product items appear

**Status:** ✅

---

### TC-RCP-002: Recipe list view shows all 12 recipes with macro summary
**AC:** US-RA-002 — list is scannable without opening each item  
**Priority:** High

**Preconditions:** Recipes view in list view (switched from default category cards)

**Steps:**
1. Toggle to **list view**.
2. Locate **Berry overnight oats** (r-001) in the list.
3. Inspect the row without opening it.

**Expected result:**
- All 12 seed recipes visible in the list
- Row shows: name "Berry overnight oats", category "Breakfasts", kcal 385 (or macro strip)
- Heart icon visible (r-001 has `favorite: true`)
- No product items appear (e.g. "Greek yogurt" must not appear)

**Status:** ✅

---

### TC-RCP-003: Search filters recipes by name
**AC:** US-RA-006 — search updates list  
**Priority:** High

**Steps:**
1. Type `oats` in the search box.

**Expected result:**
- Only **Berry overnight oats** (r-001) visible
- All other recipes hidden

**Status:** ✅

---

### TC-RCP-004: Category filter — "Soups"
**AC:** US-RA-003 — category filter restricts list  
**Priority:** High

**Steps:**
1. Select **Soups** from the category dropdown.

**Expected result:**
- Only **Lentil tomato soup** (r-006) and **Broccoli cheddar soup** (r-007) visible

**Status:** ✅

---

### TC-RCP-005: Diet filter — "Plant-based"
**AC:** US-RA-005 — diet filter shows only compatible recipes  
**Priority:** Medium

**Steps:**
1. Select **Plant-based** from the diet filter.

**Expected result:**
- Recipes tagged `plant-based` shown: Berry overnight oats, Lentil tomato soup, Chickpea curry, Chia pudding (verify against test-data.json)
- Recipes without the tag (e.g. Spinach omelette, Greek salad) hidden

**Status:** ✅

---

### TC-RCP-006: Mark recipe as favorite
**AC:** US-RA-007 — favorite can be toggled; state persists in session  
**Priority:** Medium

**Preconditions:** **Lentil tomato soup** (r-006) has `favorite: false`

**Steps:**
1. Click the heart icon on Lentil tomato soup.
2. Observe the icon state.

**Expected result:**
- Heart icon becomes filled/active
- r-006 now appears when "Favorites" filter is active

**Steps:**
3. Click the heart again to unfavorite.

**Expected result:**
- Heart returns to inactive state
- r-006 no longer in favorites filter

**Status:** ✅

---

### TC-RCP-007: Favorites-only filter
**AC:** US-RA-004 — toggle shows only favorited recipes  
**Priority:** Medium

**Preconditions:** Seed data: r-001 (Berry overnight oats) and r-004 (Chicken quinoa bowl) have `favorite: true`

**Steps:**
1. Click **Favorites** toggle.

**Expected result:**
- Only Berry overnight oats and Chicken quinoa bowl shown (2 items)
- All non-favorited recipes hidden

**Status:** ✅

---

### TC-RCP-008: Mine filter — user-owned recipes only
**AC:** US-RA-004 — "mine" toggle shows only user-created recipes  
**Priority:** Medium

**Preconditions:** **Turkey meatballs** (r-009) has `isUserAdded: true, userId: "u-001"`

**Steps:**
1. Click **Mine** toggle.

**Expected result:**
- Only Turkey meatballs shown (1 item from seed data)
- All system-owned recipes hidden

**Status:** ✅

---

### TC-RCP-009: Open recipe detail card — pie chart, units conversion, instructions, prep time
**AC:** US-RA-011 — card shows image, ingredients, nutrition pie chart, units conversion, servings, kcal/serving, prep time, and instructions  
**Priority:** High

**Steps:**
1. Click the title of **Chicken quinoa bowl** (r-004).

**Expected result:**
- Detail modal or expanded card opens
- Visible: image (or placeholder), servings "1", kcal/serving "450"
- Ingredients listed: Chicken breast 150 g, Quinoa 85 g, Baby spinach 30 g, Cherry tomatoes 50 g, Olive oil 0.5 tbsp
- Nutrition summary: protein 38 g / fat 12 g / carbs 42 g
- **Pie chart** visible showing caloric proportions: protein / fat / carbs slices
- **Units conversion reference** visible (g per serving, and 1 serving values)
- **Preparation time** shown when the field is populated
- **Step-by-step cooking instructions** shown when populated
- Optional fields are hidden (not shown as blank) when not provided

**Status:** ✅

---

### TC-RCP-010: "This week" flag on recipe
**AC:** US-RA-008 — "This week" adds recipe to Planner Lunch slot  
**Priority:** High

**Preconditions:** **Lentil tomato soup** (r-006) has `thisWeek: false`

**Steps:**
1. Click **"This week"** on Lentil tomato soup.
2. Navigate to **Planner > Weekly summary**.

**Expected result:**
- Lentil tomato soup appears in the **Lunch** slot of the weekly summary
- "This week" badge active on the recipe card

**Status:** ✅

---

### TC-RCP-011: "Next week" flag independent of "This week"
**AC:** US-RA-008 — both flags work independently, same rules as products  
**Priority:** Medium

**Preconditions:** **Chia pudding** (r-012) has both flags false

**Steps:**
1. Click **"Next week"** on Chia pudding only.

**Expected result:**
- "Next week" badge shown
- No "This week" badge
- Chia pudding appears in Next week filter

**Status:** ✅

---

### TC-RCP-012: Add recipe manually (VALID-RCP-001)
**AC:** US-RA-009 — manual recipe creation  
**Priority:** High

**Test data:** `formInputs.recipeForm.valid[0]` (VALID-RCP-001)
```
name: Simple tuna salad
category: Salads
servings: 1
ingredients: Tuna in water 100 g, Cherry tomatoes 80 g
dietTags: keto, mediterranean
```

**Steps:**
1. Click **"Add recipe"**.
2. Fill form with VALID-RCP-001 values.
3. Add ingredients: select "Tuna in water" (p-006), amount 100 g; add "Cherry tomatoes" (p-014), amount 80 g.
4. Submit.

**Expected result:**
- Modal closes
- "Simple tuna salad" appears in recipe list
- Card shows auto-calculated nutrition: kcal ≈ 131 (116 + 14.4), protein ≈ 26.7 g
- Appears in Mine filter

**Status:** ✅

---

### TC-RCP-013: Add recipe with no ingredients (VALID-RCP-002)
**AC:** US-RA-009 — recipe with no ingredients can be saved; nutrition shows all zeros  
**Priority:** Medium

**Test data:** `formInputs.recipeForm.valid[1]` (VALID-RCP-002)
```
name: Empty recipe
category: Snacks
servings: 1
ingredients: (none)
```

**Steps:**
1. Add recipe "Empty recipe" with no ingredients.
2. Submit.

**Expected result:**
- Recipe saved successfully
- Card shows: kcal 0, protein 0 g, fat 0 g, carbs 0 g
- No error or warning about missing ingredients

**Status:** ✅

---

### TC-RCP-014: Import recipe from URL
**AC:** US-RA-010 — website URL import (mock)  
**Priority:** Medium

**Steps:**
1. Click **Import** or **"Add from URL"**.
2. Enter any valid URL (the prototype uses a mock parser).
3. Click **Parse**.

**Expected result:**
- Mock recipe data populated in the form
- User can review and save
- Saved recipe appears in the list and in Mine filter

**Status:** ✅

---

### TC-RCP-015: Delete user-owned recipe — blocked by current/future planner assignment
**AC:** US-RA-012 — delete blocked when recipe has assignments in current or future week  
**Priority:** High

**Preconditions:** **Turkey meatballs** (r-009) is user-owned and has a **Sunday Dinner** assignment in the current week's planner seed

**Steps:**
1. In Recipes, locate Turkey meatballs.
2. Click **delete** on the card.

**Expected result:**
- Deletion blocked
- Error message shows which day and slot the recipe is assigned to (Sunday, Dinner)
- Turkey meatballs remains in the recipe list

**Status:** ✅

---

### TC-RCP-016: Delete user-owned recipe — only past assignments → succeeds
**AC:** US-RA-012 — delete allowed when all assignments are in past weeks; removed silently  
**Priority:** Medium

> In the prototype (no persistence), simulate by adding a recipe, navigating to a past week, placing it, returning to current week, then deleting.

**Steps:**
1. Add a new recipe "Past week test".
2. Navigate to **previous week** in Planner.
3. Add "Past week test" to any day slot.
4. Return to current week.
5. Navigate to Recipes and delete "Past week test".

**Expected result:**
- Recipe deleted successfully without a confirmation prompt about active assignments
- Recipe removed from list

**Status:** ✅

---

### TC-RCP-017: Edit own recipe — change ingredients updates nutrition
**AC:** US-RA-013 — nutrition updates after ingredient change  
**Priority:** High

**Preconditions:** **Turkey meatballs** (r-009) is user-owned

**Steps:**
1. Click **edit** on Turkey meatballs.
2. Increase Ground turkey from 200 g to 300 g.
3. Save.

**Expected result:**
- Card nutrition updates: protein increases (extra 100 g turkey ≈ +17 g protein, +149 kcal)
- New values visible immediately on the card

**Status:** ✅

---

### TC-RCP-018: System recipes do not show edit/delete controls
**AC:** US-RA-012 — edit/delete only for owned recipes  
**Priority:** Medium

**Steps:**
1. Locate **Berry overnight oats** (r-001, `isUserAdded: false`).
2. Inspect the card for edit/delete controls.

**Expected result:**
- No edit or delete buttons visible on system recipes
- Turkey meatballs (user-owned) does show edit/delete controls

**Status:** ✅

---

### TC-RCP-019: Recipe category cards — click a category to see its recipes
**AC:** US-RA-014 — clicking a category card navigates to filtered list with category pre-set  
**Priority:** High

**Preconditions:** Recipes view in category cards view (default)

**Steps:**
1. Click the **Breakfasts** category card.

**Expected result:**
- View switches to list view showing only Breakfasts recipes
- Category filter is pre-set to "Breakfasts"
- Recipes shown include: Berry overnight oats (r-001), Chia pudding (r-012) (verify against test-data.json)
- A "back" or breadcrumb control returns to category cards view

**Status:** ✅

---

### TC-RCP-020: Recipe list view includes fiber column
**AC:** US-RA-015 — fiber (g) column present in recipe list  
**Priority:** Medium

**Preconditions:** Recipes view in list view

**Steps:**
1. Inspect the recipe list table header.
2. Locate **Berry overnight oats** (r-001) row.
3. Click the **Fiber** column header.
4. Click it again.

**Expected result:**
- Column header "Fiber" (or "Fiber (g)") is visible in the list
- Berry overnight oats row shows fiber value in that column
- After step 3: recipes sort by fiber ascending (lowest first)
- After step 4: recipes sort by fiber descending (highest first)
- Sort behaviour matches the other sortable nutrition columns

**Status:** ✅

---

### TC-RCP-021: Next-week flag auto-promotes to this-week on week rollover
**AC:** US-RA-008 — on Monday of a new week, recipes flagged "Next week" become "This week"  
**Priority:** Medium

**Preconditions:** **Chia pudding** (r-012) has `thisWeek: false`, `nextWeek: true`

**Steps:**
1. Simulate a week rollover: advance the application's reference date to the following Monday.
2. Navigate to **Recipes** and locate Chia pudding.

**Expected result:**
- Chia pudding now shows "This week" flag active
- "Next week" flag is cleared on Chia pudding
- Chia pudding appears in the Planner Lunch slot for the new current week

**Status:** 🚫

---

### TC-RCP-022: Edit form shows live nutrition summary at top; recalculates as ingredients change
**AC:** US-RA-013 — nutrition summary shown at top of edit form; updates live during editing  
**Priority:** High

**Preconditions:** **Turkey meatballs** (r-009) is user-owned; current nutrition: kcal ≈ 405, protein ≈ 36 g (verify against test-data.json)

**Steps:**
1. Open Recipes and click **edit** on Turkey meatballs.
2. Observe the top of the edit form **before changing anything**.
3. Locate Ground turkey in the ingredient list; increase its amount from 200 g to 300 g (do **not** save yet).
4. Observe the nutrition summary at the top of the form.

**Expected result:**
- Step 2: A nutrition summary (kcal, protein, fat, carbs, fiber) is visible **at the top of the edit form**, above the ingredient list, before any changes are made.
- Step 4 (before save): The nutrition summary updates **immediately** after the quantity change — protein increases by approximately +17 g, kcal by +149. The form still shows "unsaved" state.
- No save or submit action is required for the nutrition values to update.

**Steps (save and verify):**
5. Click **Save**.

**Expected result:**
- Recipe card now shows the updated nutrition values matching what was shown in the live preview.

**Status:** ✅
