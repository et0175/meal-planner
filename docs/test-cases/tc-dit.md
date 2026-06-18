# Test Cases — TC-DIT: Dietary Analyser

**App:** `http://localhost:3001`  
**Status key:** ✅ Pass | ❌ Fail | 🚫 Not implemented | ❓ Not tested  
**Index:** [README.md](README.md)

---

**Requirement:** [`03_dietary_analyser.md`](../requirements/03_dietary_analyser.md)  
**User stories:** [`dietary-analyser.md`](../user-stories/dietary-analyser.md)  
**Test data:** All 12 diets from test-data.json

---

### TC-DIT-001: Diets view shows exactly 12 diets
**AC:** US-DA-001 — exactly the 12 diets defined in requirements  
**Priority:** High

**Steps:**
1. Click **Diets** in the sidebar.
2. Count the diet cards.

**Expected result:**
- Exactly 12 cards: Mediterranean, Plant-based / Flexitarian, MIND, DASH, Paleo, WeightWatchers (WW), Intermittent fasting, Ketogenic (Keto), Volumetrics, Protein-focused, Healthy fats, Hydration guidance
- No "Add diet" button (static list in MVP)

**Status:** ✅

---

### TC-DIT-002: Each diet shows name, description, and macro split where applicable
**AC:** US-DA-002 — description and macro guidance visible  
**Priority:** High

**Steps:**
1. Inspect **Mediterranean** diet card.

**Expected result:**
- Name: "Mediterranean"
- Description visible (matches test-data.json: "Emphasises vegetables, fruits, whole grains…")
- Macro guidance: Protein 15%, Fat 35%, Carbs 50%

**Steps:**
2. Inspect **WeightWatchers (WW)** card.

**Expected result:**
- Name and description visible
- Macro section shows "Points-based — no fixed percentage split" or equivalent note (not applicable)

**Status:** ✅

---

### TC-DIT-003: Mark product compatible with a diet
**AC:** US-DA-003 — compatibility can be set and is visible  
**Priority:** Medium

**Steps:**
1. Open **Quinoa** (p-010) for editing.
2. Add **"MIND"** diet tag.
3. Save.

**Expected result:**
- Quinoa card now shows the MIND diet tag
- Selecting MIND diet filter in Products returns Quinoa

**Status:** ✅

---

### TC-DIT-004: Mark recipe compatible with a diet
**AC:** US-DA-004 — diet compatibility visible on recipe  
**Priority:** Medium

**Steps:**
1. Edit **Greek salad** (r-005).
2. Add **"MIND"** diet tag.
3. Save.

**Expected result:**
- Greek salad card shows MIND tag
- MIND filter in Recipes returns Greek salad

**Status:** ✅

---

### TC-DIT-005: Diet card shows a macro pie chart where applicable
**AC:** US-DA-002 — pie chart of protein/fat/carbs proportions shown on diet card  
**Priority:** Medium

**Steps:**
1. Click **Diets** in the sidebar.
2. Inspect the **Mediterranean** diet card.
3. Inspect the **WeightWatchers (WW)** diet card.

**Expected result:**
- Mediterranean card shows a **pie chart** with three slices: protein ~15%, fat ~35%, carbs ~50% (matching test-data.json `macroGuidance`: proteinPct 15, fatPct 35, carbsPct 50)
- Slices are proportional by caloric contribution (matching pie chart style on product/recipe cards)
- WW card **does not show a pie chart**; instead shows a text note such as "Points-based — no fixed percentage split"

**Status:** ✅

---

### TC-DIT-006: Clicking a diet card opens a filtered product and recipe list
**AC:** US-DA-005 — clicking a diet card navigates to combined filtered view  
**Priority:** Medium

**Test data:** Mediterranean diet; products with `dietTags` containing "mediterranean": Broccoli (p-013), Cherry tomatoes (p-016), Olive oil (p-025), etc. Recipes: Berry overnight oats (r-001), Greek salad (r-005), etc.

**Steps:**
1. Click **Diets** in the sidebar.
2. Click the **Mediterranean** diet card.
3. Inspect the resulting view.

**Expected result:**
- View is labelled with the diet name (e.g. "Mediterranean — compatible foods" or similar)
- A **Products** section lists all products tagged `mediterranean` in their dietTags
- A **Recipes** section lists all recipes tagged `mediterranean` in their dietTags
- Products and recipes not tagged `mediterranean` are **not shown**
- A back control or breadcrumb returns to the diet catalogue
- Berry overnight oats and Chicken quinoa bowl (tagged `mediterranean`) appear in the Recipes section; system products tagged `mediterranean` appear in the Products section

**Status:** ✅
