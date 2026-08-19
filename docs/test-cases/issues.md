# Prototype Issue Log — Meal Forge MVP

**Tested:** 2026-06-12  
> **All issues in this log are resolved.** See individual `tc-*.md` files for current test status.

**App:** `http://localhost:3001` — Next.js client-rendered prototype, single page, dummy data  
**Source:** `prototype/frontend/app/page.tsx`  

Severity: 🔴 Bug · 🟠 UX defect · 🟡 Prototype gap (expected limitation)

---

## 🔴 ISSUE-001 — Search carries over when switching between Products and Recipes

**Severity:** Bug  
**Affected views:** Products ↔ Recipes  
**Reproduction:**
1. Go to Products, type "lentil" in the search box.
2. Click Recipes in the sidebar.
3. The search box still reads "lentil" and shows only "Lentil tomato soup" — hiding all other recipes.

**Root cause:** `search` and `category` are single `useState` values in the root component, shared across both catalog views. No reset happens on view switch.

**Evidence:**
```
Search input value after switching to Recipes: "lentil"
Recipe cards shown with carried search: ["Lentil tomato soup"]   // 3 recipes hidden
```

**Fix direction:** Reset `search` and `category` in the `setActiveView` handler, or keep separate state per view.

---

## 🔴 ISSUE-002 — Week starts on wrong day for UTC+ timezones

**Severity:** Bug (timezone-dependent)  
**Affected view:** Planner  
**Reproduction:** Open the app in any timezone east of UTC (e.g., UTC+3 Moscow, UTC+8 Asia).

**Root cause:** `inputDate` converts a `Date` to a string via `toISOString().slice(0, 10)`, which returns the **UTC date**. For UTC+ users, Monday at 00:00 local time is Sunday in UTC, so the planner week starts on Sunday rather than Monday.

```ts
// prototype/frontend/app/page.tsx:241
function inputDate(date: Date) {
  return date.toISOString().slice(0, 10);  // Bug: returns UTC date, not local
}
```

**Evidence:** Running the test browser with system timezone UTC+3 (2026-06-12):
```
Date range shown: 2026-06-07 to 2026-06-13
First day card: Sun, Jun 7       // should be Mon, Jun 8
```

**Fix:**
```ts
function inputDate(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
```

---

## 🔴 ISSUE-003 — Deleting a day card meal slot leaves orphaned items in the summary

**Severity:** Bug  
**Affected view:** Planner  
**Reproduction:**
1. Place an item that is not on any other day card (e.g., "Berry overnight oats" on Monday Breakfast only).
2. Delete the Monday Breakfast meal slot via the trash icon in the meal slot header.
3. The assignment is removed from the day card, but "Berry overnight oats" remains in the summary panel with no day card placements.

**Root cause:** `deleteDaySection` filters out assignments but does not run the orphan-check that `removeAssignment` does:

```ts
// prototype/frontend/app/page.tsx:484 — deleteDaySection
function deleteDaySection(day: string, section: string) {
  const nextAssignments = assignments.filter(
    (assignment) => !(assignment.day === day && assignment.section === section)
  );
  setDaySections(...);
  markPlanChanged(nextAssignments);   // ← no summary cleanup
}

// prototype/frontend/app/page.tsx:445 — removeAssignment (has the cleanup)
function removeAssignment(uid: string) {
  ...
  if (removed && !next.some((a) => a.itemId === removed.itemId)) {
    setSummary(...);   // ← removes orphaned summary entry
  }
  markPlanChanged(next);
}
```

**Fix direction:** After computing `nextAssignments`, identify any `itemId` that was in the removed assignments and no longer appears in `nextAssignments`, then remove those from `summary`.

---

## 🔴 ISSUE-004 — Invalid date range (end before start) silently collapses to 1 day

**Severity:** Bug  
**Affected view:** Planner  
**Reproduction:** Set Start = 2026-06-20, End = 2026-06-18. No error is shown; only the start-date card is rendered.

**Root cause:**
```ts
// prototype/frontend/app/page.tsx:257
function dateRange(start: string, end: string) {
  const total = Math.max(0, Math.round((last - first) / 86400000));
  return Array.from({ length: total + 1 }, ...);  // length=1 when end < start
}
```

**Evidence:**
```
Day cards with end < start: 1   // only 1 day rendered, no warning
```

**Fix direction:** Validate `end >= start` in the date input `onChange` handlers, or show an inline warning.

---

## 🟠 ISSUE-005 — Category filter includes "product" and "recipe" as options

**Severity:** UX defect  
**Affected views:** Products, Recipes  
**Description:** The filter dropdown contains "product" and "recipe" as filter options alongside actual category names ("Dairy", "Fish", etc.). This is confusing because:
- On the Products view, selecting "product" is a no-op (all visible items are already products).
- On the Products view, selecting "recipe" shows an empty list.
- "product" and "recipe" look like category names but are actually kind discriminators.

**Evidence:**
```
Category options: ["All","product","recipe","Dairy","Fish","Grains","Produce","Breakfasts","Soups","Main courses","Salads"]
```

**Root cause:** `categories` is derived from all items regardless of kind, and `Array.from(new Set(items.map(i => i.category)))` is prefixed with the hard-coded strings "product" and "recipe":

```ts
// prototype/frontend/app/page.tsx:345
const categories = useMemo(
  () => ["All", "product", "recipe", ...Array.from(new Set(items.map(i => i.category)))],
  [items]
);
```

**Fix direction:** Remove "product" and "recipe" from the categories array; the view already filters by kind.

---

## 🟠 ISSUE-006 — Favorite toggle is not implemented

**Severity:** UX defect  
**Affected view:** Recipes  
**Description:** Recipe cards show a heart icon when `favorite: true` is set in seed data, but clicking the icon does nothing — there is no handler to toggle the favorite state. The heart icon has no `onClick`, and no "Favorites only" filter exists.

**Evidence:**
```
Favorite icons in recipes list: 2
Favorite icons after clicking heart: 2   // unchanged after click
```

**Root cause:** The icon pill renders conditionally but has no interaction:
```tsx
// prototype/frontend/app/page.tsx:545
{item.favorite ? (
  <span className="icon-pill" title="Favorite">
    <Heart size={15} fill="currentColor" />
  </span>
) : null}
```
No `onClick` on `icon-pill`, no toggle function, no "Favorites" filter in the control band.

---

## 🟠 ISSUE-007 — Profile calorie target has no effect on Planner

**Severity:** UX defect  
**Description:** The Profile view lets users set a calorie target and macro split, but these values are never read by the Planner. Day cards do not show a target line or gap-to-goal, and the topbar kcal total cannot be compared against the profile target. The `profile` state is entirely isolated.

---

## 🟠 ISSUE-008 — No validation on macro percentage inputs

**Severity:** UX defect  
**Affected view:** Profile  
**Description:** Setting Protein=50%, Fat=50%, Carbs=50% (150% total) is accepted silently. No sum-to-100 constraint or visual warning.

**Evidence:**
```
Macros after setting each to 50: protein=50 fat=50 carbs=50 (total=150%)
Corridor still shows: 1950 - 2250 kcal   // no error
```

---

## 🟠 ISSUE-009 — Placing the same item multiple times creates duplicate assignments

**Severity:** UX defect  
**Affected view:** Planner  
**Description:** Clicking the Place (+) button on a summary card multiple times creates separate assignment records on the same day/meal slot. Each counts separately toward the macro total and shopping list. There is no deduplication or warning.

**Evidence:**
```
Day card items after placement: ["Berry overnight oats","Berry overnight oats",...]  // duplicate
```

---

## 🟡 ISSUE-010 — Only 4 of 12+ required diets are shown — 🚫 Superseded (OQ-011, 2026-08-19)

**Severity:** Prototype gap  
**Affected view:** Diets  
**Requirements:** `docs/requirements/03_dietary_analyser.md`

> **Superseded:** The Dietary Analyser module is deferred to post-MVP1 (OQ-011). This gap no longer needs fixing for MVP1 — left here for historical record.

Implemented: Mediterranean, DASH, Keto, Protein-focused  
Missing from requirements: Plant-based/flexitarian, MIND, Paleo, WeightWatchers (WW), Intermittent fasting, Volumetrics, Healthy fats, Hydration guidance

---

## 🟡 ISSUE-011 — No "Favorites only" or "My recipes" filter

**Severity:** Prototype gap  
**Requirements:** US-RA-004  
**Description:** No toggle or filter for showing only favorited recipes or only user-owned recipes.

---

## 🟡 ISSUE-012 — No diet-type filter on Products or Recipes — 🚫 Superseded (OQ-011, 2026-08-19)

**Severity:** Prototype gap  
**Requirements:** US-RA-005 (recipe filter by diet); `docs/requirements/01_products-database.md` (product filter by diet)  
**Description:** Items carry a `diets` array and diet tags are visible on cards, but no filter allows restricting the list to a specific diet. (US-DA-003/004 cover marking compatibility, not filtering.)

> **Superseded:** Diet filtering depends on the Dietary Analyser module, deferred to post-MVP1 (OQ-011). This gap no longer needs fixing for MVP1 — left here for historical record.

---

## 🟡 ISSUE-013 — No recipe detail / full card view

**Severity:** Prototype gap  
**Requirements:** US-RA-011  
**Description:** Recipe cards in the list show summary info (macros, diet tags) but there is no click-through to a full detail card. Requirements call for image, ingredients summary, nutrition breakdown, servings, and calories per serving on a dedicated card.

---

## 🟡 ISSUE-014 — No add / edit / delete for products or recipes

**Severity:** Prototype gap  
**Requirements:** US-RA-009, US-RA-012, US-RA-013; `docs/requirements/02_products-analyser.md`  
**Description:** The catalog is read-only seed data. No form or flow to create, edit, or delete items.

---

## 🟡 ISSUE-015 — No recipe import from external sources

**Severity:** Prototype gap  
**Requirements:** US-RA-010  
**Description:** No import flow for PDF, URL, or YouTube.

---

## 🟡 ISSUE-016 — No diet compatibility marking — 🚫 Superseded (OQ-011, 2026-08-19)

**Severity:** Prototype gap  
**Requirements:** US-DA-003, US-DA-004  
**Description:** No UI to mark a product or recipe as compatible with a given diet.

> **Superseded:** US-DA-003/004 belong to the Dietary Analyser module, deferred to post-MVP1 (OQ-011). This gap no longer needs fixing for MVP1 — left here for historical record.

---

## 🟡 ISSUE-017 — Profile missing personal / demographic fields

**Severity:** Prototype gap  
**Requirements:** US-PC-001 to US-PC-004  
**Description:** Profile only exposes diet preferences. Missing: email/password, language, unit system, gender, age, weight, body composition.

---

## 🟡 ISSUE-018 — No meal tracking

**Severity:** Prototype gap  
**Requirements:** Personal cabinet — Meal tracking section  
**Description:** No log for recording food intake or viewing daily nutrition summary.

---

## 🟡 ISSUE-019 — Shopping list embedded in Planner instead of standalone nav item

**Severity:** Prototype gap  
**Requirements:** `docs/requirements/07_shopping_list.md`; US-SL-001  
**Description:** Requirements specify Shopping List as a dedicated navigation item separate from the Meal Planner. In the prototype, shopping list controls and generation live inside the Planner view (TC-PLN-040–046). The sidebar (TC-NAV-001) lists only 5 items; Shopping List is missing. Additionally, the spec-based date range selector (US-SL-002) and plan summary (US-SL-003) are not implemented; the prototype generates the list from the current plan state without a date range.

---

---

## 🟡 ISSUE-020 — Mark as favourite not available in Advanced Search

**Severity:** Prototype gap  
**Affected view:** Advanced Search — Recipes tab  
**Requirements:** `10_advanced_search.md` — "All recipe actions available in the Recipe Analyser are available here: mark as favourite, mark for this week / next week, open detail card."  
**Related test case:** TC-AS-020

**Description:** In the Advanced Search results Recipes tab, each recipe row shows a filled heart icon when `favorite: true`, but there is no toggle button to change the favourite status. The recipe detail modal in SearchView also lacks a favourite action. The requirement states that all recipe actions from the Recipe Analyser should be available in Advanced Search — favourite toggling is missing.

---

## Summary

| Severity | Count | IDs |
|---|---|---|
| 🔴 Bug | 4 | 001, 002, 003, 004 |
| 🟠 UX defect | 5 | 005, 006, 007, 008, 009 |
| 🟡 Prototype gap | 11 | 010–020 |
| **Total** | **20** | |

**Priority fixes before next user test session:** ISSUE-001 (search bleed), ISSUE-002 (timezone), ISSUE-006 (favorite toggle), ~~ISSUE-010 (more diets)~~ superseded — Dietary Analyser deferred to post-MVP1 (OQ-011), ISSUE-020 (favourite toggle in search).
