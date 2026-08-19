# User Stories: Advanced Search

Requirements: [10_advanced_search.md](../requirements/10_advanced_search.md)

---

## US-AS-001 Open Advanced Search and see the empty state

**As a** user  
**I want** to open Advanced Search and see the filter panel with no results until I apply a filter or query  
**So that** I am prompted to specify what I am looking for before results appear.

**Acceptance criteria**

- [ ] Advanced Search is accessible via a dedicated navigation item in the sidebar.
- [ ] On opening, the filter panel is visible (sidebar) and no results are shown.
- [ ] A prompt or empty-state message tells the user to enter a search term or apply a filter.

---

## US-AS-002 Search products and recipes by name

**As a** user  
**I want** to type a name and see matching products and recipes across the full catalogue simultaneously  
**So that** I do not have to search Products and Recipes separately.

**Acceptance criteria**

- [ ] A free-text search input is displayed at the top of the filter panel.
- [ ] Search is case-insensitive and matches on partial name (substring match).
- [ ] Results update as the user types; both the Products and Recipes tabs reflect the current query.
- [ ] The search input is optional — the user may leave it blank and rely on filters alone.
- [ ] Clearing the search input restores the full filter-only result set (or the empty state if no other filter is active).

---

## 🚫 US-AS-003 Filter by diet compatibility — Deferred to post-MVP1

> **Decision (OQ-011):** Depends on the Dietary Analyser module (`dietary-analyser.md`) and diet tagging of products/recipes, both deferred to post-MVP1. Kept for historical/planning reference.

**As a** user on a specific diet  
**I want** to filter search results to only items tagged as compatible with my diet  
**So that** every result I see fits my dietary constraints.

**Acceptance criteria**

- [ ] ~~A single-select diet dropdown is available in the filter panel, with the same 12 diet options defined in `03_dietary_analyser.md`.~~ 🚫 Deferred (OQ-011).
- [ ] ~~Selecting a diet restricts both the Products and Recipes tabs to items carrying that diet tag.~~ 🚫 Deferred (OQ-011).
- [ ] ~~Selecting "Any diet" (the default) removes the diet constraint.~~ 🚫 Deferred (OQ-011).

---

## US-AS-004 Filter by calorie range

**As a** user monitoring calorie intake  
**I want** to set minimum and/or maximum kcal limits  
**So that** only items within my calorie target appear.

**Acceptance criteria**

- [ ] Two numeric inputs — "From" (min kcal) and "To" (max kcal) — are available in the filter panel.
- [ ] Either input may be left blank: entering only a minimum shows items at or above that value; entering only a maximum shows items at or below it.
- [ ] Values represent **kcal per serving** (product serving as defined by `servingAmount`; recipe serving as stored on the record).
- [ ] Both Products and Recipes tabs respect the calorie range filter.

---

## US-AS-005 Filter by macro ranges

**As a** user targeting specific macro ratios  
**I want** to set minimum and/or maximum values for protein, fat, and carbohydrates  
**So that** I can find high-protein or low-carb options without opening every item.

**Acceptance criteria**

- [ ] Separate min/max range inputs exist for Protein (g), Fat (g), and Carbohydrates (g).
- [ ] Each macro filter is independent; any combination may be applied simultaneously.
- [ ] Values are **per serving**, consistent with the calorie range convention.
- [ ] Both Products and Recipes tabs respect all active macro filters.

---

## US-AS-006 Filter by category (multi-select)

**As a** user browsing a specific food type  
**I want** to select one or more categories and see only items from those categories  
**So that** I can focus on a food group without unrelated results cluttering the view.

**Acceptance criteria**

- [ ] A checkbox list shows all product categories (grouped under "Products") and all recipe categories (grouped under "Recipes") in the filter panel.
- [ ] Multiple categories may be selected simultaneously.
- [ ] Within the category filter, items from **any** selected category are shown (OR logic).
- [ ] The category filter combines with other filters using AND logic (a selected category and a calorie filter both apply).
- [ ] Selecting only product categories affects the Products tab; selecting only recipe categories affects the Recipes tab; selecting both affects both tabs independently based on item type.

---

## US-AS-007 Filter recipes by ingredient

**As a** user looking for recipes containing a specific food  
**I want** to type an ingredient name and see only recipes that contain it  
**So that** I can plan meals around what I have on hand.

**Acceptance criteria**

- [ ] A text input for "Contains ingredient" is displayed in the filter panel.
- [ ] The filter searches recipe ingredient names (partial, case-insensitive match).
- [ ] Only one ingredient at a time is supported in MVP1.
- [ ] This filter affects the Recipes tab only; the Products tab is unaffected.
- [ ] A label or note makes clear that this filter applies to recipes only.

---

## US-AS-008 Browse results in two tabs with live count badges

**As a** user  
**I want** to see product and recipe results in separate tabs, each showing how many matches exist  
**So that** I can switch between item types without losing my filter context.

**Acceptance criteria**

- [ ] Two tabs — **Products** and **Recipes** — are always visible.
- [ ] Each tab header shows a count badge with the number of matching items, updated as filters change.
- [ ] Switching tabs does not reset any active filter.
- [ ] Each tab uses the same layout as the respective module: Products uses the product list columns; Recipes uses the recipe list columns.

---

## US-AS-009 Sort product results by column

**As a** user comparing products in search results  
**I want** to sort the Products tab by any column  
**So that** I can rank items by nutrition value without changing my filters.

**Acceptance criteria**

- [ ] Each column header in the Products tab is clickable and toggles between ascending and descending sort order.
- [ ] The active sort column is visually indicated (e.g. ↑/↓ arrow).
- [ ] Sorting applies to the currently filtered result set (it does not remove any active filters).
- [ ] Changing a filter re-applies the current sort order to the new result set.

---

## US-AS-010 Sort recipe results by column

**As a** user comparing recipes in search results  
**I want** to sort the Recipes tab by any column  
**So that** I can rank results by kcal, macros, or servings at a glance.

**Acceptance criteria**

- [ ] Each column header in the Recipes tab is clickable and toggles between ascending and descending sort order.
- [ ] The active sort column is visually indicated (e.g. ↑/↓ arrow).
- [ ] Sorting applies to the currently filtered result set.
- [ ] Sort state is independent from the Products tab (changing sort in one tab does not affect the other).

---

## US-AS-011 Mark items for this week or next week from search results

**As a** user planning meals directly from search  
**I want** to flag any product or recipe as planned for this week or next week without leaving the search results  
**So that** I can add items to my planner in one step while browsing.

**Acceptance criteria**

- [ ] Each row in the Products tab has "This week" (TW) and "Next week" (NW) toggle buttons.
- [ ] Each row in the Recipes tab has the same toggle buttons.
- [ ] Toggling a flag mirrors the same flag on the item in All products or the recipe catalogue (bidirectional sync).
- [ ] Marking "This week" adds the item to the Meal planner Weekly summary (Lunch slot by default), identical to the behaviour in All products and Recipes.
- [ ] All unflagging and week-rollover rules defined in `01_products-database.md` apply.
- [ ] The flag state reflects the current catalogue state when results are shown.

---

## US-AS-012 Manage active filters via chips and clear controls

**As a** user refining a search  
**I want** to see all active filters as removable chips and be able to clear them individually or all at once  
**So that** I can adjust my search without resetting everything.

**Acceptance criteria**

- [ ] Each active filter is shown as a chip (tag) above the results area, labelled with the filter name and value.
- [ ] Each chip has an × button that removes only that filter without affecting the others.
- [ ] A "Clear all" control resets all active filters and the text search input simultaneously.
- [ ] Filters do not persist across navigation: leaving Advanced Search and returning shows the empty state with all filters reset.

---

## US-AS-013 Open product detail from search results

**As a** user who wants more information about a product in the results  
**I want** to click a product row and see its full detail card  
**So that** I can review nutrition, macro breakdown, and units conversion before deciding to plan it.

**Acceptance criteria**

- [ ] Clicking a product row opens the product detail card (modal or panel) identical to the Products Database detail view.
- [ ] The detail card shows a pie chart, macro values, and units conversion table.
- [ ] The detail card is dismissible without losing the current search state.

---

## US-AS-014 Open recipe detail from search results

**As a** user who wants to inspect a recipe in the results  
**I want** to click a recipe row and see its full detail card  
**So that** I can review ingredients, instructions, and nutrition before planning it.

**Acceptance criteria**

- [ ] Clicking a recipe row opens the recipe detail card (modal or panel) identical to the Recipe Analyser detail view.
- [ ] The detail card shows the pie chart, macro values, ingredients list, and instructions (when provided).
- [ ] The detail card is dismissible without losing the current search state.
