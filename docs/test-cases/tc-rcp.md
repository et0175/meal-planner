# Test Cases — TC-RCP: Recipe Analyser

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`04_recipe_analyser.md`](../requirements/04_recipe_analyser.md)  
**User stories:** [`recipe-analyser.md`](../user-stories/recipe-analyser.md)  
**Test data:** Recipes r-001 – r-012 from test-data.json

---

### TC-RCP-001: Recipes view shows only recipes
**AC:** US-RA-001 — recipe list is scoped to recipes  
**Priority:** High

**Steps:**
1. Click **Recipes** in the sidebar.

**Expected result:**
- All 12 seed recipes visible
- No product items appear (e.g. "Greek yogurt" must not appear)

**Status:** ✅

---

### TC-RCP-002: Each recipe card shows title, category, and macro summary
**AC:** US-RA-002 — list is scannable without opening each item  
**Priority:** High

**Steps:**
1. Locate **Berry overnight oats** (r-001) in the list.
2. Inspect the card without opening it.

**Expected result:**
- Visible without opening: name, category "Breakfasts", kcal 385 (or macro strip showing 15g protein / 8g fat / 65g carbs)
- Heart icon visible (r-001 has `favorite: true`)

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

### TC-RCP-006: Mark recipe as favourite
**AC:** US-RA-007 — favourite can be toggled; state persists in session  
**Priority:** Medium

**Preconditions:** **Lentil tomato soup** (r-006) has `favorite: false`

**Steps:**
1. Click the heart icon on Lentil tomato soup.
2. Observe the icon state.

**Expected result:**
- Heart icon becomes filled/active
- r-006 now appears when "Favourites" filter is active

**Steps:**
3. Click the heart again to unfavourite.

**Expected result:**
- Heart returns to inactive state
- r-006 no longer in favourites filter

**Status:** ✅

---

### TC-RCP-007: Favourites-only filter
**AC:** US-RA-004 — toggle shows only favourited recipes  
**Priority:** Medium

**Preconditions:** Seed data: r-001 (Berry overnight oats) and r-004 (Chicken quinoa bowl) have `favorite: true`

**Steps:**
1. Click **Favourites** toggle.

**Expected result:**
- Only Berry overnight oats and Chicken quinoa bowl shown (2 items)
- All non-favourited recipes hidden

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

### TC-RCP-009: Open recipe detail card
**AC:** US-RA-011 — card shows image, ingredients, nutrition, servings, kcal/serving  
**Priority:** High

**Steps:**
1. Click the card image or title of **Chicken quinoa bowl** (r-004).

**Expected result:**
- Detail modal or expanded card opens
- Visible: image (or placeholder), servings "1", kcal/serving "450"
- Ingredients listed: Chicken breast 150 g, Quinoa 85 g, Baby spinach 30 g, Cherry tomatoes 50 g, Olive oil 0.5 tbsp
- Nutrition summary: protein 38 g / fat 12 g / carbs 42 g

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

**Status:** 🚫

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
