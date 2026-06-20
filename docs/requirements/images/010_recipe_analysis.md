# Recipe Nutrition Calculation — Specification

> **Related:** [`04_recipe_analyser.md`](../04_recipe_analyser.md) · [`02_products-analyser.md`](../02_products-analyser.md)  
> **Prototype implementation:** `prototype/frontend/app/page.tsx` ~line 1359, `calcRowMacros()` ~line 1533

---

## Overview

A recipe is composed of ingredient lines, each referencing a product from the catalog with a quantity and unit. The nutrition of the recipe is the sum of its ingredients' nutritional contributions, divided by the number of servings.

The key question is whether we can also express nutrition **per 100 g** of the final dish — this depends on whether the total weight of the result is known. There are three cases.

---

## The three calculation cases

### Case 1 — No cooking required (assembly only)

The dish is not cooked; the result weight equals the sum of ingredient weights (e.g. salad, overnight oats, smoothie).

**Total weight is auto-computed:**
```
total_weight_g = Σ ingredient_weight_g

where ingredient_weight_g =
  | ingredient.unit == 'g' or 'ml'  → ingredient.amount
  | ingredient.unit is an altUnit   → ingredient.amount × altUnit.gramsPerUnit
  | ingredient.unit is a base unit  → ingredient.amount × product.servingG / product.servingAmount
```

**Resulting nutrition:**
```
total_kcal     = Σ (product.kcal    × ratio)
total_protein  = Σ (product.protein × ratio)
total_fat      = Σ (product.fat     × ratio)
total_carbs    = Σ (product.carbs   × ratio)

where ratio = ingredient.amount / product.servingAmount

kcal_per_100g    = total_kcal    / total_weight_g × 100
protein_per_100g = total_protein / total_weight_g × 100
fat_per_100g     = total_fat     / total_weight_g × 100
carbs_per_100g   = total_carbs   / total_weight_g × 100

kcal_per_serving    = total_kcal    / servings
protein_per_serving = total_protein / servings
```

> **Per-100g is available** in this case. The UI can show both per-serving and per-100g values.

---

### Case 2 — Cooking involved; user specifies resulting weight

The dish loses weight during cooking (water evaporates, etc.), but the user knows the final dish weight — either from experience or by weighing the result (e.g. `servingG` × `servings`).

```
resulting_weight_g = recipe.servingG × recipe.servings

kcal_per_100g = total_kcal / resulting_weight_g × 100
```

> **Per-100g is available** in this case, using the user-provided `servingG` (grams per serving) field.  
> If the user does not fill in `servingG`, this case falls back to Case 3.

---

### Case 3 — Cooking involved; resulting weight unknown

The dish is cooked and the user has not specified grams per serving (`servingG` is absent). Only per-serving nutrition is available.

```
kcal_per_serving    = total_kcal    / recipe.servings
protein_per_serving = total_protein / recipe.servings
fat_per_serving     = total_fat     / recipe.servings
carbs_per_serving   = total_carbs   / recipe.servings
```

> **Per-100g is not available.** The UI must display per-serving only and clearly indicate this limitation.

---

## Summary: which values are available

| | kcal / serving | kcal / 100 g |
|-|:-:|:-:|
| Case 1 — no cooking | ✅ | ✅ auto |
| Case 2 — cooked, `servingG` provided | ✅ | ✅ from `servingG` |
| Case 3 — cooked, no `servingG` | ✅ | ❌ |

---

## Ingredient scaling — detailed formula

Each ingredient contributes to the recipe total via a **ratio** (number of product servings used):

```
ratio = ingredient.amount / product.servingAmount
```

This ratio then scales all nutritional values:

```
contribution.kcal    = product.kcal    × ratio
contribution.protein = product.protein × ratio
contribution.fat     = product.fat     × ratio
contribution.carbs   = product.carbs   × ratio
contribution.fiber   = (product.fiber ?? 0) × ratio
```

> `product.servingAmount` and `ingredient.amount` must be in the same unit.  
> Currently, recipe ingredient amounts are always recorded in the product's base unit.

**Example — Berry overnight oats (r-001):**

| Ingredient | Amount | servingAmount | ratio | kcal contribution |
|-----------|--------|--------------|-------|------------------|
| Rolled oats (150 kcal / 40 g) | 70 g | 40 g | 1.75 | 262.5 kcal |
| Greek yogurt (88 kcal / 150 g) | 150 g | 150 g | 1.00 | 88.0 kcal |
| Chia seeds (138 kcal / 28 g) | 15 g | 28 g | 0.54 | 74.3 kcal |
| Banana (105 kcal / 1 pc) | 0.5 pc | 1 pc | 0.50 | 52.5 kcal |
| **Total** | | | | **477.3 kcal** |

Stored after rounding (1 serving): `kcal: 385`. Note: seed data may use pre-rounded values; the formula above is the authoritative calculation.

---

## Pie chart — macro caloric percentages

Used on the recipe card and meal tracking summary.

```
pKcal = protein_g × 4        (protein: 4 kcal/g)
fKcal = fat_g     × 9        (fat: 9 kcal/g)
cKcal = carbs_g   × 4        (carbohydrates: 4 kcal/g)
total_macro_kcal = pKcal + fKcal + cKcal    (use 1 if zero, to avoid division by zero)

protein_pct = round(pKcal / total_macro_kcal × 100)
fat_pct     = round(fKcal / total_macro_kcal × 100)
carbs_pct   = 100 − protein_pct − fat_pct   (residual, ensures sum = 100)
```

Colour coding: protein = blue · fat = red/orange · carbs = green.

> The pie shows **caloric share**, not gram share. Fat's 9 kcal/g means its slice is larger than its gram weight would suggest.

---

## Rounding and storage

Nutrition totals are rounded when saved to the recipe record:

| Field | Rule |
|-------|------|
| `kcal` | `Math.round(value)` → integer |
| `protein`, `fat`, `carbs` | `Math.round(value × 10) / 10` → 1 decimal |
| `fiber` | Not stored on recipes in the current model |

The live preview during editing shows unrounded values. Rounding is applied at save time only.

---

## Edge cases and guards

| Situation | Handling |
|-----------|---------|
| Recipe has no ingredients | All totals = 0; saves normally; card shows 0 kcal |
| Ingredient references a missing product | Ingredient is skipped (contribution = 0) |
| `product.servingAmount` is 0 or missing | Falls back to `?? 100` (treated as 100 g serving) |
| `recipe.servings` is 0 | Risk of division by zero in per-serving display — validate minimum 1 at form level |
| All macros are 0 (e.g. pure water) | Pie chart uses denominator `|| 1`; all slices = 0%; chart renders blank |
| `servingG` not provided | Per-100g display is hidden; only per-serving shown |

---

## What the current prototype implements

The prototype implements **Case 3 only** (per-serving, no per-100g). The recipe form stores `servingG` in the data model but the recipe card does not currently display per-100g nutrition.

- `calcRowMacros()` — used in the **Products Analyser**: handles `serving`, altUnit, and base-unit cases, includes fiber and gram weight.
- Recipe form nutrition block (~line 1359) — simplified: always uses base-unit ratio, no altUnit or `serving` support for ingredient lines.

---

## Known gaps and future work

| Gap | Impact | Resolution |
|----|--------|-----------|
| Case 1 auto-weight not implemented | Per-100g unavailable for assembly recipes even when computable | Add a "no cooking" flag to the recipe form; compute total weight from ingredients |
| Per-100g display not shown even when `servingG` is provided | Users cannot compare recipes by energy density | Add a per-100g row to the recipe card nutrition table (Case 2 is already data-ready) |
| Recipe ingredient altUnit support absent | Cannot enter "2 cups rolled oats" as an ingredient | Extend ingredient `unit` dropdown to include altUnits; apply the full altUnit scaling formula |
| Fiber not stored on recipes | Fiber tracking is zero for any recipe-based log entry | Add `fiber` to recipe nutrition calculation and storage |
| `servings = 0` not validated | Division by zero in per-serving display | Add `min: 1` constraint to servings field in the recipe form |
