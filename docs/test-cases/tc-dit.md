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
