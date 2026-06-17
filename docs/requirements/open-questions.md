# Open Questions — Meal Forge MVP

All questions resolved as of 2026-06-17. Decisions are recorded here and written into the affected requirement and user story files.

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

---

## OQ-007 — What unit systems does the product support beyond metric?

**Affects:** `05_personal_cabinet.md`, US-PC-003

**Context:**  
The requirement said "metric or other" without defining what "other" means.

**Decision:** ✅ Metric + US customary. Supported systems: metric (g, kg, ml, l, etc.) and US customary (oz, lb, fl oz, cups, tbsp, tsp). UK Imperial is not in scope. Non-metric support beyond US customary is deferred post-MVP based on user demand.
