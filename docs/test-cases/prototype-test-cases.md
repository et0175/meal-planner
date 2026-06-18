# Prototype Test Cases — Meal Forge MVP

> **⚠️ Deprecated:** This file records results from early prototype testing rounds (before the `tc-*.md` split). It is retained as a historical log only. The authoritative test cases are the individual `tc-*.md` files in this directory. Do not add new test cases here.

**App:** `http://localhost:3001`  
**Source:** `prototype/frontend/app/page.tsx` (single-page prototype, all client-rendered, dummy data)  
**Scope:** Manual exploratory + specification-based tests against the prototype only.  
**Test data:** [`../test-data/test-data.json`](../test-data/test-data.json) · [`../test-data/test-data.xlsx`](../test-data/test-data.xlsx)  
**Tested:** 2026-06-12 (round 1), updated 2026-06-17 (requirements-driven revision)  
**Issues log:** [`issues.md`](issues.md)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

> **Authoritative test document:** [`test-cases-detailed.md`](test-cases-detailed.md) is the canonical source for all spec-based test cases with full traceability to requirements and test data. This file is the historical results log from prototype testing rounds and should be used for pass/fail tracking against the prototype only.

> **2026-06-17 revision:** TC-NAV updated to 6-item sidebar. TC-PRD updated with list/cards view toggle, Next week flag, and delete-blocked-by-recipe tests. TC-RCP updated with Next week flag and recipe deletion edge cases. TC-MLT added for Meal tracking log.

## Results summary

| Round | ✅ Pass | ❌ Fail | 🚫 N/A | ❓ Untested |
|---|---|---|---|---|
| Initial test (2026-06-12) | 40 | 10 | 18 | 4 |
| After fixes (2026-06-12) | 68 | 0 | 0 | 4 |
| After calendar redesign | 13 | 0 | 0 | 57 |
| **2026-06-17 requirements revision** | **14** | **0** | **15** | **~75** |

> Round 4 reflects the prototype rebuild phase: TC-AUTH, TC-SHP, TC-PAN marked 🚫; many new tests (TC-PRD-021–027, TC-RCP-016–020, TC-PRF-013–018, TC-MLT-001–007, TC-SHP-012) added as ❓. Pass count carried over only for tests confirmed against prototype screenshots or code review.

---

## TC-AUTH — Authentication

> **Note:** Authentication is not implemented in the prototype (the app starts in a signed-in state with no sign-in screen). All cases below are specification-based (🚫).

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-AUTH-001 | Sign-in screen shown to unauthenticated users | Open app URL without a session | Sign-in screen displayed; no application data visible | 🚫 |
| TC-AUTH-002 | Sign-in with valid credentials | Enter correct email and password, submit | User is signed in and lands on Planner | 🚫 |
| TC-AUTH-003 | Sign-in with wrong password | Enter correct email, wrong password | Generic error shown; does not say which field was wrong | 🚫 |
| TC-AUTH-004 | Sign-in with unknown email | Enter an email not in the system | Same generic error as TC-AUTH-003 | 🚫 |
| TC-AUTH-005 | Rate-limit on repeated failures | Fail sign-in 5+ times in a row | Account locked or rate-limited; message shown | 🚫 |
| TC-AUTH-006 | Registration with new email | Fill form with unique email + valid password | Account created; user signed in automatically; lands on Planner | 🚫 |
| TC-AUTH-007 | Registration with duplicate email | Submit form with an email already in the system | Error shown; does not confirm email exists | 🚫 |
| TC-AUTH-008 | Registration with weak password | Submit form with a password under 8 characters | Validation error shown; form not submitted | 🚫 |
| TC-AUTH-009 | Sign-out clears session | Click sign-out | Session invalidated; redirected to sign-in screen | 🚫 |
| TC-AUTH-010 | Back button after sign-out | Sign out, then click browser back | Redirected to sign-in; authenticated content not shown | 🚫 |
| TC-AUTH-011 | Forgot password sends reset link | Click "Forgot password?", enter registered email | Confirmation message shown (same for known and unknown emails) | 🚫 |
| TC-AUTH-012 | Reset link allows new password | Follow a valid reset link | Password change form shown; new password accepted; old password invalid after | 🚫 |
| TC-AUTH-013 | Expired reset link rejected | Follow a reset link after it has expired | Clear error message; user prompted to request a new link | 🚫 |
| TC-AUTH-014 | Session persists on page reload | Sign in, then reload the page | User remains signed in; no re-authentication required | 🚫 |
| TC-AUTH-015 | Direct URL redirects to sign-in when unauthenticated | Navigate directly to /planner without a session | Redirected to sign-in; after sign-in, lands on /planner | 🚫 |

---

## TC-NAV — Navigation

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-NAV-001 | Sidebar shows all seven views | Open app | Sidebar contains exactly 7 items in this order: **Planner, Products, Products analyser, Recipes, Diets, Shopping list, Personal cabinet**. Shopping list and Products analyser are top-level nav items. | ❓ |
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
| TC-PRD-011 | Untoggle weekly flag — summary only | Click "Week" on a product with no day-card assignments | Flag removed; product removed from Weekly summary automatically | ❓ |
| TC-PRD-011b | Untoggle weekly flag — with day assignments | Click "Week" on a product that has day-card placements | Confirmation prompt shown before any assignments are removed | ❓ |
| TC-PRD-012 | Add to Summary | Click "Summary" on a product | Item appears in Planner > Meal-prep summary | ✅ |
| TC-PRD-013 | Add to Summary is idempotent | Click "Summary" twice on the same product | Item appears only once in summary | ✅ |
| TC-PRD-014 | Search + category filter combine | Search "yogurt" then select "Dairy" | Only matching products shown | ✅ |
| TC-PRD-015 | Search resets when switching to Recipes | Type a search term in Products, switch to Recipes | Search cleared on switch | ✅ fixed ISSUE-001 |
| TC-PRD-016 | Filter dropdown contains only real categories | Open filter dropdown in Products | Only "All" + real categories (Dairy, Fish, etc.) | ✅ fixed ISSUE-005 |
| TC-PRD-017 | Add product (manual) | Click "Add product" button | Form modal opens; saved product appears in list | ✅ fixed ISSUE-014 |
| TC-PRD-018 | Edit/delete own product | Click edit/delete on a mine=true product card | Form pre-filled; save updates card; delete removes it | ✅ fixed ISSUE-014 |
| TC-PRD-019 | "Mine" filter | Toggle Mine button | Only user-owned products shown | ✅ fixed ISSUE-011 |
| TC-PRD-020 | Diet filter on product list | Select a diet from dropdown | Only products tagged with that diet shown | ✅ fixed ISSUE-012 |
| TC-PRD-021 | Switch to list view | Click the list-view toggle in the control band | Products displayed in a table with columns: Name, Category, Protein (g), Fat (g), Carbs (g), kcal | ❓ |
| TC-PRD-022 | Switch back to cards view | Click the cards-view toggle | Products displayed as cards with image, macros strip, and diet tags | ❓ |
| TC-PRD-023 | List view respects active filters | Set category filter to "Dairy", switch to list view | Only Dairy products shown in table; filter state preserved on view toggle | ❓ |
| TC-PRD-024 | Next week flag independent of This week | Click "Next week" on a product that has no "This week" flag | Product gets "Next week" badge; "This week" badge unchanged; product appears when "Next week" filter is active | ❓ |
| TC-PRD-025 | Both week flags can be set simultaneously | Toggle both "This week" and "Next week" on the same product | Both badges visible on the card; product appears in both week filters | ❓ |
| TC-PRD-026 | Delete product used in a recipe is blocked | Click delete on a product that is an ingredient in any recipe (e.g. "Whole eggs" used in Spinach omelette) | Deletion blocked; message shows which recipes reference the product; product remains in the list | ❓ |
| TC-PRD-027 | Delete product not used in any recipe succeeds | Click delete on a user-owned product with no recipe references (e.g. "Hemp seeds") | Product deleted immediately; removed from All products and Mine filter | ❓ |

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
| TC-RCP-016 | Next week flag on recipe | Click "Next week" on a recipe | Recipe gets "Next week" badge independently of "This week"; appears in Next week filter | ❓ |
| TC-RCP-017 | Delete recipe with future/current week assignments is blocked | Click delete on a user-owned recipe that has planner assignments in the current or a future week (e.g. "Turkey meatballs" — Sunday Dinner) | Deletion blocked; message shows which day+slot assignments exist; recipe remains in list | ❓ |
| TC-RCP-018 | Delete recipe with only past-week assignments succeeds | Click delete on a user-owned recipe whose only assignments are in past weeks | Recipe deleted; past-week assignments removed silently; recipe not visible in list | ❓ |
| TC-RCP-019 | Recipe with no ingredients can be saved | Add recipe, leave ingredients empty, save | Recipe saved with all-zero nutrition (0/0/0/0); contributes no lines to shopping list | ❓ |
| TC-RCP-020 | Edit recipe ingredients updates nutrition | Edit an owned recipe, add or remove an ingredient, save | Nutrition totals recalculated to reflect the change; shopping list goes stale | ❓ |

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

## TC-PAN — Products analyser view

> **Note:** Products analyser is not yet implemented in the prototype. All cases below are specification-based (🚫).

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PAN-001 | Products analyser opens empty | Navigate to Products analyser | View shown with no rows; "Add row" button visible | 🚫 |
| TC-PAN-002 | Product selector narrows as user types | Type partial product name in column 1 | Suggestions from database appear; selecting one pins the product | 🚫 |
| TC-PAN-003 | Unit dropdown defaults to g | Add a row | Column 2 shows "g" by default; options include g, ml, pc, tbsp, tsp, serving | 🚫 |
| TC-PAN-004 | Nutrition calculated live | Select product, set unit and quantity | Protein, fat, carbs, kcal columns populate and update instantly on any change | 🚫 |
| TC-PAN-005 | Totals row sums all rows | Add two or more rows with quantities | Totals row shows sum of each nutrient column | 🚫 |
| TC-PAN-006 | Per-100g row normalises totals | Add rows with quantities | "Per 100 g" row shows nutrients scaled to 100 g of total weight | 🚫 |
| TC-PAN-007 | This week / Next week flags mirror All products | Toggle "This week" on a product row | Flag state appears on the same product in All products | 🚫 |
| TC-PAN-008 | Catalog flag change reflected in analyser | Toggle a product's flag in All products, open analyser with that product | Flag column pre-fills from catalog state | 🚫 |
| TC-PAN-009 | Remove a row | Click × on a row | Row removed; totals update immediately; catalog flags unaffected | 🚫 |
| TC-PAN-010 | Add new product without leaving | Trigger "add new product" from product search | Form opens inline or as modal; saved product is selected in the row; appears in All products | 🚫 |

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
| TC-PLN-011 | Grid has four meal slots | Open summary tab | Breakfast, Lunch, Dinner, Snacks meal slots each have their own tbody | ❓ |
| TC-PLN-012 | Seeded items appear in correct slots | Open Planner | Berry overnight oats in Breakfast row; Chicken quinoa bowl in Lunch row; Lentil tomato soup in Dinner row | ❓ |
| TC-PLN-013 | Servings cell shows assignment | Open Planner | Monday cell for Berry overnight oats shows 1 | ❓ |
| TC-PLN-014 | Editing a servings cell updates assignments | Type 2 in a Mon cell | Day card and calendar reflect 2 servings for that item | ❓ |
| TC-PLN-015 | Zeroing a cell removes assignment | Type 0 in a cell that had a value | Assignment removed; calendar cell clears | ❓ |
| TC-PLN-016 | Servings / grams toggle | Click "g" toggle on a row with servingG defined | Values convert to grams; secondary label shows equivalent servings | ❓ |
| TC-PLN-017 | Grams toggle hidden for items without servingG | View a recipe row without servingG | "g" toggle not shown or is disabled | ❓ |
| TC-PLN-018 | Add row to a meal slot | Click "Add breakfast item" | Blank row appended to Breakfast meal slot | ❓ |
| TC-PLN-019 | Remove row from summary | Click × on a row | Row removed; assignments for that item+slot removed; other slots unaffected | ❓ |
| TC-PLN-020 | Mark item "This week" adds to Lunch slot | Toggle "This week" on a product | Product appears in Lunch meal slot of summary | ❓ |

### Day cards tab

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-030 | Day cards tab shows seven cards | Click "Day cards" | Seven cards visible, horizontally scrollable | ❓ |
| TC-PLN-031 | Each card has four meal slots | Open Day cards | Breakfast, Lunch, Dinner, Snacks meal slots on each card | ❓ |
| TC-PLN-032 | Seeded items appear on correct day and slot | Open Day cards | Berry overnight oats in Monday Breakfast; Chicken quinoa bowl in Monday Lunch; Lentil tomato soup in Tuesday Dinner | ❓ |
| TC-PLN-033 | Day macro strip shows correct totals | View Monday with seeded items | kcal strip reflects summed macros for all Monday items | ❓ |
| TC-PLN-034 | Add item to a slot | Click "+ Add" in a slot, type item name, confirm | Item appears in that slot; also appears in Weekly summary | ❓ |
| TC-PLN-035 | Remove item from slot | Click × on an item | Assignment deleted; item removed from that cell; summary clears if no other assignments | ❓ |
| TC-PLN-036 | Increase servings | Click + on a placed item | Servings increase by 0.5; slot kcal and day strip update | ❓ |
| TC-PLN-037 | Decrease servings | Click − on a placed item | Servings decrease by 0.5; minimum is 0.5 (item is not auto-removed — use × to remove, see TC-PLN-035) | ❓ |
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

### Shopping list (prototype — embedded in Planner)

> **⚠️ Prototype gap (ISSUE-019):** In the prototype the shopping list lives inside the Planner view. Requirements specify it as a standalone navigation item with date range selection and a plan summary panel. TC-PLN-040–046 test the embedded prototype behaviour. TC-SHP (below) covers the full spec.

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
| TC-PRF-013 | No active diet hides planner diet label | Set Profile diet to none / clear selection | No diet label shown in Planner header | ❓ |
| TC-PRF-014 | Change email requires password confirmation | Navigate to email change form, submit new email without entering current password | Form blocked; error prompts for password confirmation | ❓ |
| TC-PRF-015 | Change password invalidates session | Change password via Profile | After password change, current session is ended and user is redirected to sign-in screen | ❓ |
| TC-PRF-016 | Macro validation — exact 100% accepted | Set protein=30, fat=35, carbs=35 (sum=100) | No warning; values saved | ❓ |
| TC-PRF-017 | Macro validation — under 100% shows warning | Set protein=20, fat=20, carbs=20 (sum=60) | Warning shown: "Macro percentages must sum to 100%" | ❓ |
| TC-PRF-018 | Unit system change propagates to Products | Switch to US customary; open Products list | Product weights shown in oz/lb; volumes in fl oz/cups | ❓ |

---

## TC-MLT — Meal tracking log

> **Requirement:** `US-PC-006` — Log food intake (products and recipes) and view daily nutrition summary. Tracking is independent from the Meal Planner.

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-MLT-001 | Meal tracking section visible in Profile | Open Profile | Meal tracking / food intake log section present | ✅ fixed ISSUE-018 |
| TC-MLT-002 | Add a log entry | Click "Add entry"; select a product or recipe; enter quantity | Entry appears in today's log with name, quantity, and kcal | ❓ |
| TC-MLT-003 | Daily nutrition summary totals | Add multiple log entries for the same day | Daily summary shows sum of kcal, protein, fat, carbs across all entries | ❓ |
| TC-MLT-004 | Meal tracking does not affect planner | Add a log entry for a recipe | No new assignment appears in Meal Planner | ❓ |
| TC-MLT-005 | Planner assignment does not create a log entry | Add an item to the Meal Planner | No entry appears in Meal tracking log | ❓ |
| TC-MLT-006 | Edit log entry | Open an existing log entry; change quantity | Entry updated; daily totals recalculate | ❓ |
| TC-MLT-007 | Delete log entry | Click remove on a log entry | Entry removed; daily totals recalculate | ❓ |

---

## TC-SHP — Shopping list (standalone view — spec)

> **Requirement:** US-SL-001–004. The functional aggregation logic (ingredient summing, stale/refresh) was verified via TC-PLN-040–046 when the shopping list was embedded in Planner. Now that it is a standalone nav item (ISSUE-019 resolved), the TC-PLN-040–046 tests remain valid for the generation logic; TC-SHP tests verify the full spec.

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-SHP-001 | Shopping list is a top-level nav item | Open app | Sidebar contains a "Shopping list" entry separate from Planner | ❓ |
| TC-SHP-002 | Default date range is current calendar week | Open Shopping list | From and To date inputs pre-filled with Mon–Sun of current week | ❓ |
| TC-SHP-003 | Changing date range filters list | Set To = yesterday | Only items planned within the new range shown | ❓ |
| TC-SHP-004 | Plan summary shows planned items | Open Shopping list with items in range (use planner seeds from test-data.json) | Item name, total servings, and kcal contribution listed per item | ❓ |
| TC-SHP-005 | Grocery list grouped by category | Generate list with recipes in range | Lines grouped under Produce, Dairy, Meat, Fish, Grains, Legumes, Nuts & Seeds, Beverages, Condiments, Other | ❓ |
| TC-SHP-006 | Each grocery line shows name, quantity, unit | View grocery list | Each line: ingredient name, aggregated quantity, unit | ❓ |
| TC-SHP-007 | Same ingredient aggregated across recipes | Use planner seed: Cherry tomatoes appear in Chicken quinoa bowl, Lentil tomato soup, Chickpea curry, Greek salad, Turkey meatballs | Cherry tomatoes quantities summed on one line (expected total: 475 g — see test-data.json derivedShoppingList) | ❓ |
| TC-SHP-008 | Standalone products appear under their category | Add a product (not a recipe ingredient) directly to the planner; generate list | Product appears as a single line under its product category | ❓ |
| TC-SHP-009 | List stale indicator after plan change | Generate list, then add or modify a planner assignment | Stale indicator shown | ❓ |
| TC-SHP-010 | Refresh updates list | With stale indicator, click refresh | List regenerated from current plan within date range | ❓ |
| TC-SHP-011 | Empty range produces empty list | Set date range with no assignments | Empty state shown | ❓ |
| TC-SHP-012 | Invalid date range (end before start) | Set From = today, To = yesterday | Validation error shown; list not generated | ❓ |
