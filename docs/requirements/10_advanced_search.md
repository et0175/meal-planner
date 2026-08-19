# Business Requirements: Advanced Search

A dedicated module that allows users to search and filter across **both products and recipes** in one place, using structured filters that are not available within the Products or Recipe modules individually.

---

## Functional requirements

### Entry point

- Advanced Search is a standalone navigation item (shown in the sidebar alongside Products, Recipes, etc.). 🚫 Note: the Dietary Analyser is deferred to post-MVP1 (OQ-011) and is not an MVP1 sidebar item — see `03_dietary_analyser.md`.
- It opens an empty state with the filter panel visible and no results shown until the user applies at least one filter or types a search query.

### Search input

- A free-text input searches by **name** across products and recipes simultaneously (case-insensitive, partial match).
- The search input is optional — the user may leave it blank and rely on filters alone.
- Results update as the user types; a debounce of at most 300 ms is applied to avoid excessive re-renders.

### Filters

All filters are optional and combine with AND logic: each active filter narrows the result set further.

#### Diet 🚫 Deferred to post-MVP1

> **Deferred (OQ-011):** the Diet filter depends on the Dietary Analyser module (`03_dietary_analyser.md`) and diet tagging of products/recipes, both of which are deferred to post-MVP1. The filter is not part of MVP1 Advanced Search. See `TODO_later.md`.

- ~~A single-select dropdown for the 12 diet patterns defined in `03_dietary_analyser.md`.~~
- ~~Selecting a diet shows only products and recipes tagged as compatible with that diet.~~

#### Calorie range

- Two numeric inputs: **min kcal** and **max kcal** (both optional).
- The range applies to **kcal per serving** (products: per serving as defined by `servingAmount`; recipes: per serving as stored on the recipe record).
- Entering only a minimum shows items at or above that value; entering only a maximum shows items at or below it.

#### Macro ranges

- Separate range inputs (min / max) for each macro: **Protein (g)**, **Fat (g)**, **Carbohydrates (g)**.
- Each macro filter is independent; the user may apply one, several, or all of them.
- Values are **per serving**, matching the calorie range convention above.

#### Category (multi-select)

- A multi-select control showing all product categories and all recipe categories as distinct groups.
- When multiple categories are selected, results include items from **any** of the selected categories (OR logic within the category filter).
- Products and recipes share some category names; a selection applies to both tabs independently based on item type.

#### Ingredient (recipes only)

- A text input that searches for recipes **containing** a specified ingredient (by product name, partial match).
- Only one ingredient at a time is supported in MVP1.
- This filter applies to the Recipes tab only; the Products tab is unaffected.

### Results display

- Results are displayed in **two tabs**: **Products** and **Recipes**.
- Both tabs are shown at all times; each tab shows a badge with the count of matching items.
- The tabs share the same active filters. Switching tabs does not reset any filter.

#### Products tab

- Displays matching products using the same **list view layout** as the Products Database module (columns: name, category, protein, fat, carbs, fiber, kcal, serving size).
- Supports the same **sorting** as the Products Database list (click any column header to sort ascending / descending).
- Clicking a product opens the **product detail card** (pie chart, macro breakdown, units conversion table) — identical to the Products Database behaviour.
- All product actions available in Products Database are available here: mark for this week / next week, add to planner, open detail card.

#### Recipes tab

- Displays matching recipes using the same **list view layout** as the Recipe Analyser module (columns: name, category, servings, kcal, protein, fat, carbs, fiber).
- Supports the same **sorting** as the Recipe Analyser list.
- Clicking a recipe opens the **recipe detail card** — identical to the Recipe Analyser behaviour.
- All recipe actions available in the Recipe Analyser are available here: mark as favourite, mark for this week / next week, open detail card.

### Empty and zero-result states

- **Initial state (no query or filter applied):** prompt the user to enter a search term or apply a filter.
- **No results in a tab:** display a clear message within that tab (e.g. "No products match your filters."). The other tab may still have results.
- **No results in either tab:** display a message in the active tab and indicate that the other tab is also empty.

### Filter reset

- A **Clear all filters** control resets all active filters and the text input simultaneously.
- Filters do not persist across navigation — leaving the Advanced Search view and returning resets all filters to their default (empty) state.

---

## Open questions

| ID | Question | Status |
|----|----------|--------|
| OQ-009 | Should the ingredient filter support multiple ingredients simultaneously (e.g. "must contain chicken AND spinach")? | 🔴 Open |
| OQ-010 | Should per-100g be an alternative basis for calorie and macro range filters, in addition to per-serving? | 🔴 Open |

---

## UI / Prototype spec

- The filter panel is displayed as a **sidebar or collapsible panel** to the left or above the results area, keeping the results list as wide as possible.
- The calorie and macro range inputs are displayed as paired min/max numeric fields, labelled "From" and "To".
- The category multi-select is rendered as a **checkbox list** grouped into two sections: Product categories and Recipe categories.
- Active filters are summarised as **chips** (tags) below the search input, each with an × to remove that filter individually.
- The Products and Recipes tab headers show a **result count badge** that updates as filters change.
- This module is implemented in the current prototype. Test cases are in [`../../docs/test-cases/tc-as.md`](../../docs/test-cases/tc-as.md).
