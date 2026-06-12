# Prototype Test Cases — Meal Forge MVP

**App:** `http://localhost:3000`  
**Source:** `frontend/src/app/page.tsx` (single-page prototype, all client-rendered, dummy data)  
**Scope:** Manual exploratory + specification-based tests against the prototype only — not the full architecture described in `meta/architecture/handoff.md`.  
**Tested:** 2026-06-12 via Playwright headless + code review  
**Retested after fixes:** 2026-06-12  
**Issues log:** [`issues.md`](issues.md)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

> **⚠️ Note — test cases require update:** The prototype was significantly redesigned after these test cases were written. The following sections are affected and need new test cases written against the updated prototype:
> - **TC-PRD** — Products renamed to "All products"; list view now shows a nutrition table; "Week" button split into "This week" / "Next week"; filter toggles added.
> - **TC-PLN** — Planner redesigned: week-only navigation, three tabs (Weekly summary / Day cards / Calendar), summary grid grouped by meal slots (Breakfast/Lunch/Dinner/Snacks), servings/grams toggle per row, day cards split by meal section with add/delete/drag-drop.
> - **TC-NAV** — Navigation now has 7 items: Planner, All products, Products analyser, Recipes, Diets, Profile, Shopping list.
> - **TC-SHP** (new) — Shopping list is now a separate nav item with date range and grocery list grouped by category.

## Results summary

| Round | ✅ Pass | ❌ Fail | 🚫 N/A | ❓ Untested |
|---|---|---|---|---|
| Initial test | 40 | 10 | 18 | 4 |
| After fixes | 68 | 0 | 0 | 4 |

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

### Date range

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-001 | Default date range is current week (Mon–Sun) | Open Planner | Start = Monday of current week, End = Sunday | ✅ fixed ISSUE-002 |
| TC-PLN-002 | Seven day cards rendered by default | Open Planner | One card per day, 7 total | ✅ |
| TC-PLN-003 | Change start date | Move start date forward by 2 days | Day cards update to reflect new range | ✅ |
| TC-PLN-004 | Change end date | Move end date back | Day cards reduce | ✅ |
| TC-PLN-005 | End date before start date | Set end to a date before start | End date clamped to start date; range stays valid | ✅ fixed ISSUE-004 |
| TC-PLN-006 | Very large range | Set a 30-day range | 30 day cards render (performance may degrade) | ❓ |

### Meal-prep summary panel

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-010 | Weekly items auto-populate summary on load | Open Planner | Items with `weekly: true` appear in summary | ✅ — Berry overnight oats, Lentil tomato soup, Chicken quinoa bowl, Greek yogurt, Atlantic salmon |
| TC-PLN-011 | Summary is organised into sections | Open Planner | Breakfasts, Lunches, Dinners, Snacks sections visible | ✅ |
| TC-PLN-012 | Add a new summary section | Click + on summary panel > enter name | New section appears | ✅ |
| TC-PLN-013 | Add section with empty name | Click + > submit blank or cancel | Section not added | ✅ |
| TC-PLN-014 | Rename a summary section | Click pencil on section > enter new name | Section renamed; items in that section move with it | ✅ |
| TC-PLN-015 | Delete a summary section | Click trash on section | Section removed; items moved to first section | ✅ |
| TC-PLN-016 | Delete last summary section | Delete all sections one by one | Unclear behaviour — items have nowhere to go | ❓ |
| TC-PLN-017 | Move item between summary sections | Use "Move to" dropdown on a card | Item moves to selected section | ✅ |
| TC-PLN-018 | Remove item from summary | Click trash on summary card | Item removed from summary; all its day-card assignments also removed | ✅ |

### Day cards

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-020 | Each day card has default sections | Open Planner | Breakfast, Lunch, Dinner, Snacks in each card | ✅ |
| TC-PLN-021 | Day card shows macro strip | Open Planner on seeded day | Macro strip shows calories/protein/fat/carbs totals for that day | ✅ |
| TC-PLN-022 | Place item from summary onto a day card | In summary card, select day + section, click + | Item appears in that day/section | ✅ |
| TC-PLN-023 | Place same item twice | Place the same item twice on the same day/section | Second click is a no-op; only one assignment created | ✅ fixed ISSUE-009 |
| TC-PLN-024 | Item remains in summary after placement | After placing an item | Item still visible in summary panel | ✅ |
| TC-PLN-025 | Move placed item to different day via dropdown | Change day dropdown on a placed item | Item moves to chosen day | ✅ |
| TC-PLN-026 | Move placed item to different section via dropdown | Change section dropdown on a placed item | Item moves to chosen section | ✅ |
| TC-PLN-027 | Increase servings | Click + on servings counter | Servings increase by 0.5; kcal updates | ✅ — confirmed 1 → 1.5 |
| TC-PLN-028 | Decrease servings | Click - on servings counter | Servings decrease by 0.5; minimum 0.5 | ✅ |
| TC-PLN-029 | Decrease servings below 0.5 | Hold - past 0.5 | Stays at 0.5 (Math.max guard in code) | ✅ (code-verified) |
| TC-PLN-030 | Remove placed item from day card | Click trash on placed item | Item removed from that day; if no other placements, also removed from summary | ✅ — confirmed for Lentil tomato soup |
| TC-PLN-031 | Remove placed item that exists on another day | Place item on two days; remove from one | Item stays in summary | ✅ (code-verified) |
| TC-PLN-032 | Add section to a day card | Click + on day card > enter name | New section added to that card only | ✅ |
| TC-PLN-033 | Rename section on a day card | Click pencil on section > enter new name | Section renamed; assignments updated | ✅ |
| TC-PLN-034 | Delete section on a day card | Click trash on day section | Assignments removed; orphaned summary items cleaned up | ✅ fixed ISSUE-003 |
| TC-PLN-035 | Seeded assignments appear on load | Open Planner | Seeded items visible: Berry overnight oats (Breakfast), Chicken quinoa bowl (Dinner), Lentil tomato soup (Lunch) | ✅ |
| TC-PLN-036 | Day macro total reflects actual servings | Set Chicken quinoa bowl to 2 servings | Day macro total includes 2× item macros | ✅ |

### Shopping list

| ID | Description | Steps | Expected | Status |
|----|-------------|-------|----------|--------|
| TC-PLN-040 | Shopping list empty on load | Open Planner | "No list yet" shown; "Generate list" button visible | ✅ |
| TC-PLN-041 | Generate shopping list | Click "Generate list" | Ingredients aggregated by name+unit, sorted alphabetically | ✅ — Blueberries, Chicken breast, Cooked quinoa, Greek yogurt, Mixed greens, Red lentils, Rolled oats, Tomatoes, Vegetable broth |
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
