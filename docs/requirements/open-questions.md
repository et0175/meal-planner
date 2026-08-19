# Open Questions — Meal Forge MVP

OQ-001 – OQ-008 resolved as of 2026-06-17. Decisions are recorded here and written into the affected requirement and user story files.

OQ-009 and OQ-010 are open (Advanced Search module, added 2026-06-17). OQ-011 resolved 2026-08-19 (Dietary Analyser deferred to post-MVP1). OQ-012 is open (added 2026-08-19, "Plan for..." picker).

---

## OQ-001 — Are user-added products visible to all users or only the creator?

**Affects:** `01_products-database.md`, `02_products-analyser.md`, US-PA-005, US-PAN-008

**Context:**  
The requirement says users can add products. The analyser requirement says a newly created product "is also browsable in All products." This implies global visibility — any user can see every product any other user has added. However, this is never stated explicitly and creates a product quality problem: the shared catalog can be polluted with duplicates, typos, or junk entries.

**Decision:** ✅ Global catalog. Every user-added product is immediately visible to all users in All products. Only the creator can edit or delete their own products. No moderation or curation workflow in MVP1.

---

## OQ-002 — Who can add, edit, or remove diets from the diet list?

**Affects:** `03_dietary_analyser.md`, US-DA-001

**Context:**  
The dietary analyser lists 12 named diet patterns. The requirement does not say whether this list is static (hardcoded), admin-managed, or extensible by users or nutritionists. If it is static, adding a new diet requires a code deployment. If it is dynamic, a UI and permission model are needed.

**Decision:** ✅ Static list in MVP1. The 12 diets are hardcoded. Adding or changing a diet requires a code change and release. Admin or Nutritionist management of the diet list is deferred to a post-MVP1 version.

> **Note (2026-08-19):** Superseded by **OQ-011** — the entire Dietary Analyser module is now deferred to post-MVP1, so this question (who manages the diet list) is moot for MVP1. Left here unchanged as historical record.

---

## OQ-003 — Do standalone products (not part of any recipe) appear in the grocery list?

**Affects:** `07_shopping_list.md`, US-SL-004

**Context:**  
The shopping list requirement said it "derives a grocery list by expanding all planned recipes into their ingredients." This wording implied only recipe-based items generate grocery lines. However, a user can add standalone products directly to the planner.

**Decision:** ✅ All planned items. Both recipe ingredients and standalone products appear in the grocery list. Standalone products are listed under their product category without ingredient decomposition.

---

## OQ-004 — Which recipe import sources are required for MVP launch?

**Affects:** `04_recipe_analyser.md`, US-RA-010

**Context:**  
The requirement listed three import sources: PDF, website URL, and YouTube. These have significantly different technical complexity and accuracy profiles.

**Decision:** ✅ URL + PDF for MVP. YouTube import is post-MVP.

---

## OQ-005 — What will the Nutritionist role be able to do that a regular User cannot?

**Affects:** `docs/requirements/actors.yml`, all modules

**Context:**  
`actors.yml` notes that in MVP1 the Nutritionist shares the same permissions as a regular User. This defers the permission model to a future version.

**Decision:** ✅ Post-MVP1 Nutritionist-only actions (not in MVP1):
- Annotate dietary compatibility on products and recipes owned by other users
- Create and edit meal plans on behalf of other (client) users

All other actions remain the same as a regular User.

---

## OQ-006 — Why are Meal tracking and Meal planner intentionally independent?

**Affects:** `05_personal_cabinet.md`, US-PC-006

**Context:**  
The requirement explicitly decouples tracking (what was eaten) from planning (what is intended). Most comparable products treat them as the same action.

**Decision:** ✅ Decoupling is both intentional and a build simplification:
1. **Mental model:** Planning is aspirational and flexible; logging is factual and accountable. Conflating them risks making the planner feel like an obligation rather than a tool.
2. **MVP scope:** A "log from plan" convenience shortcut is a planned post-MVP feature; the data stores remain independent by design, not just by default.

The UI should surface this distinction clearly so users understand that planning and logging are two different actions.

> **Note (2026-06-17):** The "log from plan is post-MVP" decision in AC item 2 above was superseded by **OQ-008** (resolved the same day). Log from plan was promoted to MVP scope. See OQ-008 for the final decision.

---

## OQ-007 — What unit systems does the product support beyond metric?

**Affects:** `05_personal_cabinet.md`, US-PC-003

**Context:**  
The requirement said "metric or other" without defining what "other" means.

**Decision:** ✅ Metric + US customary. Supported systems: metric (g, kg, ml, l, etc.) and US customary (oz, lb, fl oz, cups, tbsp, tsp). UK Imperial is not in scope. Non-metric support beyond US customary is deferred post-MVP based on user demand.

---

## OQ-008 — Should "log from plan" be included in MVP, overriding OQ-006?

**Affects:** `05_personal_cabinet.md`, `06_meal_planner.md`, US-PC-006, US-MP-016

**Context:**
OQ-006 (2026-06-17) intentionally decoupled the Meal planner and Meal tracking, deferring a "log from plan" shortcut to post-MVP. A subsequent product review (2026-06-17) requested adding "a possibility to log a day and a week from the planner" with the ability to edit log entries afterwards in the personal page.

**Decision:** ✅ Log from plan is now included in MVP. A user can trigger "Log this day" or "Log this week" from the Meal planner, which creates Meal tracking entries pre-filled from the planned items and quantities. Created entries are editable in the Meal tracking section of the Personal cabinet. Tracking and planning data stores remain independent — the log action copies data; it does not link the two stores. This overrides the post-MVP deferral in OQ-006.

---

## OQ-009 — Should the ingredient filter support multiple ingredients simultaneously?

**Affects:** `10_advanced_search.md`, future US-AS-NNN

**Context:**
The Advanced Search ingredient filter (recipe tab) currently specifies one ingredient at a time (MVP1 scope). A user who wants to find recipes containing both chicken and spinach must run two separate searches and compare manually. Supporting multiple include constraints would require an AND/OR logic choice and a more complex UI (tag-style input).

**Decision:** 🔴 Open — not yet decided.

---

## OQ-010 — Should calorie and macro range filters apply per 100 g as well as per serving?

**Affects:** `10_advanced_search.md`, future US-AS-NNN

**Context:**
The Advanced Search calorie and macro range filters are currently defined as per-serving values (consistent with how products and recipes display nutrition throughout the app). However, per-100g is the standard basis for comparing energy density across different foods. A user wanting to find high-protein-density foods (e.g. > 20 g protein per 100 g) cannot do so with per-serving filters alone, since serving sizes vary widely.

**Decision:** 🔴 Open — not yet decided.

---

## OQ-011 — Should the Dietary Analyser module be deferred to post-MVP1?

**Affects:** `03_dietary_analyser.md` (entire module), `01_products-database.md`, `04_recipe_analyser.md`, `05_personal_cabinet.md`, `06_meal_planner.md`, `10_advanced_search.md`, `actors.yml`; all `US-DA-NNN` stories; diet-touching stories in `personal-cabinet.md`, `recipe-analyser.md`, `meal-planner.md`, `products-database.md`, `advanced-search.md`; all `TC-DIT-NNN` cases and diet-touching cases in `tc-prd.md`, `tc-rcp.md`, `tc-prf.md`, `tc-as.md`.

**Context:**
The product owner decided (2026-08-19) that diets are out of scope for MVP1 — not just diet *editing* (already deferred per `TODO_later.md` item 6 / OQ-002) but the entire module: browsing the 12 diet patterns, macro guidance, diet cards, and product/recipe diet tagging. Diets are cross-referenced from several other modules (active-diet selection in Personal cabinet, the planner header's active-diet badge, diet filters on Products/Recipes/Advanced Search, and diet-compatibility annotation as a planned Nutritionist responsibility), so the deferral has a wide blast radius.

**Decision:** ✅ Deferred to post-MVP1. The entire Dietary Analyser module, and every feature elsewhere that depends on it, is out of scope for MVP1. Requirement text is retained in `03_dietary_analyser.md` for historical/planning reference, clearly marked out of scope. Dependent requirements, user stories, and test cases in other modules are marked deferred with a pointer back to this decision rather than deleted, so the historical shape of the feature is traceable when it is revisited post-MVP1.

> **Note:** This makes **OQ-002** ("Who can add, edit, or remove diets from the diet list?") moot — OQ-002 assumed the diet list would exist and be either static or admin-managed in MVP1; since the whole module is deferred, that question no longer applies to MVP1. OQ-002 is left as-is for historical record and is not deleted or reworded.

---

## OQ-012 — Should list views offer a "Plan for..." picker alongside (or instead of) the This week / Next week toggles?

**Affects:** `01_products-database.md`, `02_products-analyser.md`, `04_recipe_analyser.md`, `06_meal_planner.md`, `10_advanced_search.md`; `US-PA-007`, `US-RA-008`, `US-MP-006`, `US-AS-011`, and the products-analyser TW/NW stories.

**Context:**
Today, marking an item "This week" (TW) or "Next week" (NW) from any list (All products, Recipes, Products analyser, Advanced Search) is a single click, but it always drops the item into the Weekly summary's **Lunch slot by default** (`06_meal_planner.md`, `US-MP-006`). If the user actually wants it on, say, Wednesday Dinner, they still have to go into the planner's Grid/Calendar view afterward and move it — a two-step flow (flag now, place later) for what the user experiences as one intent ("plan this for Wednesday dinner").

A **"Plan for..." picker** — a small control in the list row (e.g. a calendar icon next to the TW/NW toggles) that opens a compact day + meal-slot (+ week) picker and creates the assignment directly in the chosen slot — would let a user express that intent in one action instead of two.

**Trade-offs:**
- **Keep TW/NW only (status quo):** cheapest, already implemented consistently across four list surfaces; optimizes for the common "just get it on this week's plan, I'll sort details later" case; but leaves the two-step friction for anyone who already knows exactly when they want to eat something.
- **Replace TW/NW with "Plan for...":** most precise, but removes the one-click bulk-add path, and forces a picker interaction (day, slot, week) even for the common "just add it, doesn't matter where" case — likely a net UX regression for quick planning.
- **Add "Plan for..." alongside TW/NW (additive):** preserves the fast default path and gives precision as an opt-in; highest implementation cost, since it's a new control (with its own day/slot/week UI) that has to be added to all four list surfaces that currently share the simple toggle pattern, and its interaction with existing TW/NW state (e.g. does picking a slot also set the TW/NW flag?) needs to be defined.

**Decision:** 🔴 Open — not yet decided.
