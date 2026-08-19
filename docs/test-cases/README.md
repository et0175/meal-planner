# Test Cases — Meal Forge MVP

**App:** `http://localhost:3001`  
**Scope:** UI prototype — no persistence, no user management. All data is in-memory dummy data.  
**Test data:** [`../test-data/test-data.json`](../test-data/test-data.json) · [`../test-data/test-data.xlsx`](../test-data/test-data.xlsx)  
**Requirements:** [`../requirements/`](../requirements/) · **User stories:** [`../user-stories/`](../user-stories/)  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested

---

## Modules

| # | Module | File | Tests | ✅ Pass | 🚫 Not impl | ❓ Not tested |
|---|---|---|---|---|---|---|
| 1 | Navigation | [tc-nav.md](tc-nav.md) | 5 | 5 | 0 | 0 |
| 2 | Products database | [tc-prd.md](tc-prd.md) | 34 | 31 | 3 | 0 |
| 3 | Products analyser | [tc-pan.md](tc-pan.md) | 12 | 10 | 2 | 0 |
| 4 | Recipe analyser | [tc-rcp.md](tc-rcp.md) | 23 | 21 | 2 | 0 |
| 5 | Dietary analyser 🚫 deferred (OQ-011) | [tc-dit.md](tc-dit.md) | 6 | 0 | 6 | 0 |
| 6 | Meal planner — week summary, tab switching & reordering | [tc-pln.md](tc-pln.md) | 18 | 16 | 2 | 0 |
| 7 | Meal planner — Grid view: per-slot editing | [tc-day.md](tc-day.md) | 10 | 7 | 3 | 0 |
| 8 | Meal planner — Grid view, 2 Days & Month | [tc-cal.md](tc-cal.md) | 28 | 26 | 2 | 0 |
| 9 | Shopping list | [tc-shp.md](tc-shp.md) | 15 | 14 | 1 | 0 |
| 10 | Personal cabinet / profile | [tc-prf.md](tc-prf.md) | 14 | 10 | 4 | 0 |
| 11 | Meal tracking | [tc-mlt.md](tc-mlt.md) | 17 | 17 | 0 | 0 |
| 12 | Authentication | [tc-auth.md](tc-auth.md) | 12 | 11 | 1 | 0 |
| 13 | Advanced search | [tc-as.md](tc-as.md) | 20 | 18 | 2 | 0 |
| | **Total** | | **214** | **186** | **28** | **0** |

> **2026-08-19 update (OQ-011):** The Dietary Analyser module (row 5) and diet-dependent cases in Products database (TC-PRD-006, TC-PRD-010), Recipe analyser (TC-RCP-005), Personal cabinet (TC-PRF-006, TC-PRF-007), and Advanced search (TC-AS-003) moved from ✅ to 🚫 — the Dietary Analyser module is deferred to post-MVP1, so these are now deliberately out of scope even though they pass against the current ahead-of-spec prototype. Net change: −12 Pass, +12 Not impl, Total unchanged.

---

## Test data quick reference

| Item | ID | Key field |
|---|---|---|
| Greek yogurt | p-001 | 88 kcal / 150 g, Dairy |
| Rolled oats | p-008 | thisWeek: true, 150 kcal / 40 g |
| Atlantic salmon | p-005 | 208 kcal / 100 g, Fish |
| Whole eggs | p-027 | used in r-002 & r-003 — deletion blocked (system product) |
| Hemp seeds | p-026 | isUserAdded: true, userId: u-001 |
| Flax seeds | p-028 | isUserAdded: true, userId: u-001; used in r-009 — deletion blocked |
| Berry overnight oats | r-001 | favorite: true, thisWeek: true, Mon Breakfast seed |
| Chicken quinoa bowl | r-004 | favorite: true, thisWeek: true, Mon Lunch seed |
| Lentil tomato soup | r-006 | Tue Dinner seed |
| Turkey meatballs | r-009 | isUserAdded: true, Sun Dinner seed — deletion blocked |
| Primary test user | u-001 | Mediterranean, 2000 kcal, 30/35/35 macros |
| Keto user | u-002 | Ketogenic, 1800 kcal, 25/70/5 macros |
| Empty profile user | u-003 | No diet, no demographics |
