# Prototype Test Cases — Meal Forge MVP

**App:** `http://localhost:3000`  
**Source:** `frontend/src/app/page.tsx` (single-page prototype, all client-rendered, dummy data)  
**Scope:** Manual exploratory + specification-based tests against the prototype only — not the full architecture described in `meta/architecture/handoff.md`.  
**Tested:** 2026-06-12 via Playwright headless + code review  
**Retested after fixes:** 2026-06-12  
**Issues log:** [`issues.md`](issues.md)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

> **⚠️ Note — TC-PRD and TC-NAV require update:** These sections still reference the old navigation structure and the pre-list-view product UI. TC-PLN, TC-CAL, and TC-SHP have been updated to match the current prototype.

## Results summary

| Round | ✅ Pass | ❌ Fail | 🚫 N/A | ❓ Untested |
|---|---|---|---|---|
| Initial test | 40 | 10 | 18 | 4 |
| After fixes | 68 | 0 | 0 | 4 |
| After calendar redesign | 13 | 0 | 0 | 57 |

> TC-PLN-001–039 and TC-CAL-001–030 are new or rewritten test cases that have not yet been manually verified against the updated prototype.

---

## TC-NAV — Navigation

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-NAV-001 | Sidebar shows all five views | Open app | Sidebar contains: Planner, Products, Recipes, Diets, Profile | ✅ |
| TC-NAV-002 | Active nav item is highlighted | Click each nav button | Clicked item receives `active` CSS class; content area changes | ✅ |
| TC-NAV-003 | Default view is Planner | Open app fresh | Planner view is shown and `active` on Planner nav item | ✅ |
| TC-NAV-004 | Topbar reflects current view name | Switch between views | `<h1>` in topbar matches the view label | ✅ |
| TC-NAV-005 | Top metrics update live | Add/remove items from plan | Summary count, placement count, and kcal total update in topbar | ✅ |

---

## TC-PRD — Products view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PRD-001 | Products view shows only products | Click Products | Only product-kind items visible; no recipes | ✅ |
| TC-PRD-002 | Search filters products by name | Type "yogurt" | Only "Greek yogurt" remains | ✅ |
| TC-PRD-003 | Search is case-insensitive | Type "SALMON" | "Atlantic salmon" is returned | ✅ |
| TC-PRD-004 | Search on category field | Type "dairy" | Products in Dairy category are returned | ✅ |
| TC-PRD-005 | Search on diet tag | Type "keto" | Products tagged with Keto diet appear | ✅ |
| TC-PRD-006 | Empty search shows all products | Clear search box | All products visible | ✅ |
| TC-PRD-007 | Category filter restricts list | Select "Dairy" from filter dropdown | Only dairy products shown | ✅ |
| TC-PRD-008 | Category filter "All" shows everything | Select "All" | All products shown | ✅ |
| TC-PRD-009 | Product card shows name, category, macros, diet tags | View product card | Name, eyebrow (Product / Category), serving, kcal/protein/fat/carbs, diet tags visible | ✅ |
| TC-PRD-010 | Toggle weekly flag on product | Click "Week" on a product not marked weekly | Button becomes active; item appears in Planner summary | ✅ |
| TC-PRD-011 | Untoggle weekly flag | Click "Week" again on a weekly product | Flag removed; product may still be in summary from previous add | ✅ |
| TC-PRD-012 | Add to Summary | Click "Summary" on a product | Item appears in Planner > Meal-prep summary | ✅ |
| TC-PRD-013 | Add to Summary is idempotent | Click "Summary" twice on the same product | Item appears only once in summary | ✅ |
| TC-PRD-014 | Search + category filter combine | Search "yogurt" then select "Dairy" | Only matching products shown | ✅ |
| TC-PRD-015 | Search resets when switching to Recipes | Type a search term in Products, switch to Recipes | Search cleared on switch | ✅ fixed ISSUE-001 |
| TC-PRD-016 | Filter dropdown contains only real categories | Open filter dropdown in Products | Only "All" + real categories (Dairy, Fish, etc.) | ✅ fixed ISSUE-005 |
| TC-PRD-017 | Add product (manual) | Click "Add product" button | Form modal opens; saved product appears in list | ✅ fixed ISSUE-014 |
| TC-PRD-018 | Edit/delete own product | Click edit/delete on a mine=true product card | Form pre-filled; save updates card; delete removes it | ✅ fixed ISSUE-014 |
| TC-PRD-019 | "Mine" filter | Toggle Mine button | Only user-owned products shown | ✅ fixed ISSUE-011 |
| TC-PRD-020 | Diet filter on product list | Select a diet from dropdown | Only products tagged with that diet shown | ✅ fixed ISSUE-012 |

---

## TC-RCP — Recipes view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-RCP-001 | Recipes view shows only recipes | Click Recipes | Only recipe-kind items; no products | ✅ |
| TC-RCP-002 | Search filters recipes by name | Type "oats" | "Berry overnight oats" visible | ✅ |
| TC-RCP-003 | Category filter on recipes | Select "Salads" | Only salad recipes shown | ✅ |
| TC-RCP-004 | Favorite indicator visible | View recipe list | "Berry overnight oats" and "Chicken quinoa bowl" show heart icon | ✅ |
| TC-RCP-005 | Toggle favorite on recipe | Click heart icon on any recipe | Heart toggles; fav-active style applied | ✅ fixed ISSUE-006 |
| TC-RCP-006 | Favorites-only filter | Toggle Favorites button in control band | Only favorited recipes shown | ✅ fixed ISSUE-011 |
| TC-RCP-007 | My Recipes filter | Toggle Mine button | Only user-owned recipes shown | ✅ fixed ISSUE-011 |
| TC-RCP-008 | Diet filter on recipe list | Select a diet from Diet dropdown | Only recipes tagged with that diet shown | ✅ fixed ISSUE-012 |
| TC-RCP-009 | Open full recipe card detail | Click card image or title | Modal opens with image, serving, calories, macros, ingredients | ✅ fixed ISSUE-013 |
| TC-RCP-010 | Recipe detail shows ingredients | Open detail modal | Ingredient list with amounts and units visible | ✅ fixed ISSUE-013 |
| TC-RCP-011 | Add recipe manually | Click "Add recipe" | Form modal opens; saved recipe appears in list | ✅ fixed ISSUE-014 |
| TC-RCP-012 | Import recipe from URL | Click Import, enter URL, click Parse | Mock recipe imported and visible in Recipes | ✅ fixed ISSUE-015 |
| TC-RCP-013 | Mark recipe for current week | Click "Week" on a recipe | Recipe appears in Planner summary | ✅ |
| TC-RCP-014 | Add recipe to Summary | Click "Summary" on a recipe | Recipe appears in Planner summary | ✅ |
| TC-RCP-015 | Search resets when switching views | Switch from Products (with search set) to Recipes | Search cleared | ✅ fixed ISSUE-001 |

---

## TC-DIT — Diets view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-DIT-001 | Diets view shows diet cards | Click Diets | Diet cards visible | ✅ |
| TC-DIT-002 | Each diet shows name, description, macro split | View diet cards | Name, description (note), and macro split percentage shown | ✅ |
| TC-DIT-003 | Required diets are present | Count diet cards | All 12 diets present: Mediterranean, Plant-based, MIND, DASH, Paleo, WeightWatchers, Intermittent fasting, Keto, Volumetrics, Protein-focused, Healthy fats, Hydration-focused | ✅ fixed ISSUE-010 |
| TC-DIT-004 | Mark product compatible with diet | Look for compatibility marking UI | Diet tags editable via product/recipe form; diet filter in catalog shows compatible items | ✅ fixed ISSUE-016 |
| TC-DIT-005 | Mark recipe compatible with diet | Look for compatibility marking UI | Diet tags editable via recipe form | ✅ fixed ISSUE-016 |

---

## TC-PLN — Planner view

### Week navigation

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-001 | Default week is current week | Open Planner | Week label shows Monday–Sunday of current week | ❓ |
| TC-PLN-002 | "Prev" navigates to previous week | Click Prev | Week shifts back 7 days; label and content update | ❓ |
| TC-PLN-003 | "Next" navigates to next week | Click Next | Week shifts forward 7 days | ❓ |
| TC-PLN-004 | "This week" returns to current week | Navigate away, click "This week" | Returns to current calendar week | ❓ |

### Weekly summary tab

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-010 | Summary tab is default view | Open Planner | "Weekly summary" tab is active; grid is visible | ❓ |
| TC-PLN-011 | Grid has four meal-slot sections | Open summary tab | Breakfast, Lunch, Dinner, Snacks sections each have their own tbody | ❓ |
| TC-PLN-012 | Seeded items appear in correct slots | Open Planner | Berry overnight oats in Breakfast row; Chicken quinoa bowl in Lunch row; Lentil tomato soup in Dinner row | ❓ |
| TC-PLN-013 | Servings cell shows assignment | Open Planner | Monday cell for Berry overnight oats shows 1 | ❓ |
| TC-PLN-014 | Editing a servings cell updates assignments | Type 2 in a Mon cell | Day card and calendar reflect 2 servings for that item | ❓ |
| TC-PLN-015 | Zeroing a cell removes assignment | Type 0 in a cell that had a value | Assignment removed; calendar cell clears | ❓ |
| TC-PLN-016 | Servings / grams toggle | Click "g" toggle on a row with servingG defined | Values convert to grams; secondary label shows equivalent servings | ❓ |
| TC-PLN-017 | Grams toggle hidden for items without servingG | View a recipe row without servingG | "g" toggle not shown or is disabled | ❓ |
| TC-PLN-018 | Add row to a meal slot | Click "Add breakfast item" | Blank row appended to Breakfast section | ❓ |
| TC-PLN-019 | Remove row from summary | Click × on a row | Row removed; assignments for that item+slot removed; other slots unaffected | ❓ |
| TC-PLN-020 | Mark item "This week" adds to Lunch slot | Toggle "This week" on a product | Product appears in Lunch section of summary | ❓ |

### Day cards tab

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-030 | Day cards tab shows seven cards | Click "Day cards" | Seven cards visible, horizontally scrollable | ❓ |
| TC-PLN-031 | Each card has four meal sections | Open Day cards | Breakfast, Lunch, Dinner, Snacks sections on each card | ❓ |
| TC-PLN-032 | Seeded items appear on correct day and slot | Open Day cards | Berry overnight oats in Monday Breakfast; Chicken quinoa bowl in Monday Lunch; Lentil tomato soup in Tuesday Dinner | ❓ |
| TC-PLN-033 | Day macro strip shows correct totals | View Monday with seeded items | kcal strip reflects summed macros for all Monday items | ❓ |
| TC-PLN-034 | Add item to a slot | Click "+ Add" in a slot, type item name, confirm | Item appears in that slot; also appears in Weekly summary | ❓ |
| TC-PLN-035 | Remove item from slot | Click × on an item | Assignment deleted; item removed from that cell; summary clears if no other assignments | ❓ |
| TC-PLN-036 | Increase servings | Click + on a placed item | Servings increase by 0.5; slot kcal and day strip update | ❓ |
| TC-PLN-037 | Decrease servings | Click − on a placed item | Servings decrease by 0.5; minimum 0.5 | ❓ |
| TC-PLN-038 | Drag item to different slot same day | Drag item from Breakfast to Lunch on the same card | Item moves to Lunch; Breakfast slot clears | ❓ |
| TC-PLN-039 | Drag item to different day | Drag item to the same meal slot on a different day card | Item moves; source clears; target shows item | ❓ |

### Calendar tab — week sub-view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-CAL-001 | Calendar tab is accessible | Click "Calendar" in planner tabs | Calendar view renders with Week/Month toggle | ❓ |
| TC-CAL-002 | Week sub-view is default | Open Calendar tab | "Week" button is active; 7-column grid visible | ❓ |
| TC-CAL-003 | Today is highlighted | Open Calendar tab on any day | Today's date cell has a teal circled day number | ❓ |
| TC-CAL-004 | Seeded items appear in correct day cells | Open Calendar week view | Berry overnight oats in Monday cell; Chicken quinoa bowl in Monday; Lentil tomato soup in Tuesday | ❓ |
| TC-CAL-005 | Item shows meal slot label and servings | View a calendar item | Shows thumbnail, name, slot label (e.g. "Breakfast"), and "1×" | ❓ |
| TC-CAL-006 | Add item via calendar cell | Click "+ Add" in a day cell, type name, select slot, click Add | Item appears in cell and in Weekly summary | ❓ |
| TC-CAL-007 | Add with no item selected | Click Add with search field empty or unmatched | Nothing added | ❓ |
| TC-CAL-008 | Remove item via × button | Hover item, click × | Assignment removed; cell updates | ❓ |
| TC-CAL-009 | Drag item to another day | Drag item from Mon cell, drop on Wed cell | Item moves to Wed; original slot preserved | ❓ |
| TC-CAL-010 | Drag reflects in Day cards | After calendar drag, switch to Day cards | Item appears on new day in the same meal slot | ❓ |
| TC-CAL-011 | Calendar reflects summary changes | Add servings in Weekly summary, switch to Calendar | Calendar cell shows the item | ❓ |

### Calendar tab — month sub-view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-CAL-020 | Switch to month view | Click "Month" toggle | 42-cell grid appears; day-of-week header visible (Mon–Sun) | ❓ |
| TC-CAL-021 | Correct month displayed | Open month view | Month label matches the month containing the selected week | ❓ |
| TC-CAL-022 | Other-month days are de-emphasised | View month grid | Cells outside the current month appear grayed | ❓ |
| TC-CAL-023 | Today highlighted in month view | Open month view | Today's cell has teal-circled day number | ❓ |
| TC-CAL-024 | Prev month navigation | Click ‹ in calendar header | Grid shifts to previous month | ❓ |
| TC-CAL-025 | Next month navigation | Click › in calendar header | Grid shifts to next month | ❓ |
| TC-CAL-026 | Week nav does not appear in month sub-view | View month | Prev/Next week buttons still present in week nav above tabs; month nav is separate inside calendar | ❓ |
| TC-CAL-027 | Add item in month view | Click "+ Add" in a month cell, fill search + slot, confirm | Item appears in cell; reflects in Weekly summary and Day cards | ❓ |
| TC-CAL-028 | Remove item in month view | Hover item in month cell, click × | Assignment removed | ❓ |
| TC-CAL-029 | Drag between cells in month view | Drag item from one month cell to another | Assignment updates to new day; slot preserved | ❓ |
| TC-CAL-030 | Switching back to week view preserves state | Toggle back to Week after using Month | All items and assignments intact | ❓ |

### Shopping list

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-040 | Shopping list empty on load | Open Planner | "No list yet" shown; "Generate list" button visible | ✅ |
| TC-PLN-041 | Generate shopping list | Click "Generate list" | Ingredients aggregated by name+unit, sorted alphabetically | ✅ |
| TC-PLN-042 | Ingredients multiplied by servings | Set oats to 2 servings, generate list | Rolled oats shows 140 g | ✅ (code-verified, 2 × 70) |
| TC-PLN-043 | Same ingredient from multiple items combined | Multiple items share an ingredient | Amounts summed under one line | ✅ |
| TC-PLN-044 | Shopping list shows "List stale" after plan change | Generate list, then add a placement | Status badge becomes "List stale" | ✅ |
| TC-PLN-045 | Refresh updates the list | After plan change, click "Refresh list" | List updated; status becomes "List fresh" | ✅ |
| TC-PLN-046 | Shopping list with no assignments | Remove all placements, generate | Empty list or "No list yet" | ❓ |

---

## TC-PRF — Profile view

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PRF-001 | Profile view shows diet preferences | Click Profile | Diet selector, calorie target, macro % inputs visible | ✅ |
| TC-PRF-002 | Diet selector works | Change diet dropdown | Value updates | ✅ |
| TC-PRF-003 | Calorie target input works | Change calorie value | Target updates; calorie corridor recalculates (±150 kcal) | ✅ |
| TC-PRF-004 | Macro % inputs work | Change protein/fat/carbs % | Values update | ✅ |
| TC-PRF-005 | Calorie corridor displayed | Set calories to 2000 | Corridor shows "1850 - 2150 kcal" | ✅ — confirmed |
| TC-PRF-006 | Macro percentage validation | Set protein=50, fat=50, carbs=50 | Warning shown when total ≠ 100% | ✅ fixed ISSUE-008 |
| TC-PRF-007 | Email / password management | Look for email/password fields | Present in Profile personal section | ✅ fixed ISSUE-017 |
| TC-PRF-008 | Language preference | Look for language selector | Language dropdown present | ✅ fixed ISSUE-017 |
| TC-PRF-009 | Unit system | Look for metric/imperial toggle | Metric/Imperial toggle present | ✅ fixed ISSUE-017 |
| TC-PRF-010 | Gender / age / weight fields | Look for demographic inputs | Gender, age, weight inputs present | ✅ fixed ISSUE-017 |
| TC-PRF-011 | Meal tracking log | Look for food intake log | Meal log section present in Profile with add entry and daily history | ✅ fixed ISSUE-018 |
| TC-PRF-012 | Profile diet affects planner | Set diet to Keto in Profile; check Planner | Planner topbar shows active diet label | ✅ fixed ISSUE-007 |
