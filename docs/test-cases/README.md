# Test Cases — Meal Forge MVP

**App:** `http://localhost:3001`  
**Scope:** UI prototype — no persistence, no user management. All data is in-memory dummy data.  
**Test data:** [`../test-data/test-data.json`](../test-data/test-data.json) · [`../test-data/test-data.xlsx`](../test-data/test-data.xlsx)  
**Requirements:** [`../requirements/`](../requirements/) · **User stories:** [`../user-stories/`](../user-stories/)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

---

## Modules

| # | Module | File | Tests | ✅ Pass | 🚫 Not impl |
|---|---|---|---|---|---|
| 1 | Navigation | [tc-nav.md](tc-nav.md) | 5 | 5 | 0 |
| 2 | Products database | [tc-prd.md](tc-prd.md) | 26 | 26 | 0 |
| 3 | Products analyser | [tc-pan.md](tc-pan.md) | 11 | 1 | 10 |
| 4 | Recipe analyser | [tc-rcp.md](tc-rcp.md) | 18 | 17 | 1 |
| 5 | Dietary analyser | [tc-dit.md](tc-dit.md) | 4 | 4 | 0 |
| 6 | Meal planner — weekly summary | [tc-pln.md](tc-pln.md) | 13 | 9 | 4 |
| 7 | Meal planner — day cards | [tc-day.md](tc-day.md) | 9 | 7 | 2 |
| 8 | Meal planner — calendar | [tc-cal.md](tc-cal.md) | 22 | 18 | 4 |
| 9 | Shopping list | [tc-shp.md](tc-shp.md) | 13 | 13 | 0 |
| 10 | Personal cabinet / profile | [tc-prf.md](tc-prf.md) | 13 | 11 | 2 |
| 11 | Meal tracking | [tc-mlt.md](tc-mlt.md) | 14 | 8 | 6 |
| 12 | Authentication | [tc-auth.md](tc-auth.md) | 11 | 0 | 11 |
| | **Total** | | **159** | **119** | **40** |

---

## Test data quick reference

| Item | ID | Key field |
|---|---|---|
| Greek yogurt | p-001 | 88 kcal / 150 g, Dairy |
| Rolled oats | p-008 | thisWeek: true, 150 kcal / 40 g |
| Atlantic salmon | p-005 | 208 kcal / 100 g, Fish |
| Whole eggs | p-027 | used in r-002 & r-003 — deletion blocked |
| Hemp seeds | p-026 | isUserAdded: true, userId: u-001 |
| Berry overnight oats | r-001 | favorite: true, thisWeek: true, Mon Breakfast seed |
| Chicken quinoa bowl | r-004 | favorite: true, thisWeek: true, Mon Lunch seed |
| Lentil tomato soup | r-006 | Tue Dinner seed |
| Turkey meatballs | r-009 | isUserAdded: true, Sun Dinner seed — deletion blocked |
| Primary test user | u-001 | Mediterranean, 2000 kcal, 30/35/35 macros |
| Keto user | u-002 | Ketogenic, 1800 kcal, 25/70/5 macros |
| Empty profile user | u-003 | No diet, no demographics |
