"""Parse USDA FoodData Central CSV bulk exports into canonical import records.

Maps FDC files onto the catalog shape (ADR-0013):
  food.csv            -> product name + category id
  food_category.csv   -> category label
  food_nutrient.csv   -> per-100 g nutrition (energy has an Atwater fallback chain)
  food_portion.csv    -> alternative units (grams_per_unit = gram_weight / amount)
  measure_unit.csv    -> unit label

Only rows whose data_type is in DATASETS (foundation_food / sr_legacy_food) are
imported; sample/acquisition/sub-sample rows are skipped.
"""

from __future__ import annotations

import csv
from collections.abc import Iterator
from dataclasses import dataclass, field
from pathlib import Path

DATASETS: tuple[str, ...] = ("foundation_food", "sr_legacy_food")

# Energy is tried in priority order — Foundation foods populate 1008 inconsistently
# and often carry only Atwater factors (2048 specific, then 2047 general).
ENERGY_NUTRIENT_IDS: tuple[str, ...] = ("1008", "2048", "2047")
PROTEIN_ID = "1003"
FAT_ID = "1004"
CARBS_ID = "1005"
_WANTED_NUTRIENTS = {*ENERGY_NUTRIENT_IDS, PROTEIN_ID, FAT_ID, CARBS_ID}

# Atwater factors (kcal per gram) — used to derive energy when the source provides
# no energy nutrient but does provide macros. Products with neither keep energy 0.0.
_ATWATER_PROTEIN = 4.0
_ATWATER_FAT = 9.0
_ATWATER_CARBS = 4.0


def _resolve_energy(nutrients: dict[str, float], protein: float, fat: float, carbs: float) -> float:
    """Energy per 100 g: first available energy nutrient, else Atwater from macros."""
    for nid in ENERGY_NUTRIENT_IDS:
        if nid in nutrients:
            return nutrients[nid]
    derived = _ATWATER_PROTEIN * protein + _ATWATER_FAT * fat + _ATWATER_CARBS * carbs
    return round(derived, 1)

MAX_UNITS = 10  # INV-004
_DEFAULT_CATEGORY = "Uncategorized"


@dataclass
class ImportRecord:
    external_id: str
    name: str
    category: str
    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float
    units: list[tuple[str, float]] = field(default_factory=list)


def _read_csv(path: Path) -> Iterator[dict[str, str]]:
    with path.open(newline="", encoding="utf-8") as f:
        yield from csv.DictReader(f)


def _to_float(value: str) -> float | None:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def parse_usda(data_dir: str | Path, datasets: tuple[str, ...] = DATASETS) -> list[ImportRecord]:
    """Read the FDC CSVs under ``data_dir`` and return canonical import records."""
    data_dir = Path(data_dir)

    # 1. category id -> label
    categories: dict[str, str] = {
        row["id"]: row["description"] for row in _read_csv(data_dir / "food_category.csv")
    }

    # 2. target foods (filtered by data_type)
    targets: dict[str, dict[str, str]] = {}
    for row in _read_csv(data_dir / "food.csv"):
        if row["data_type"] in datasets:
            targets[row["fdc_id"]] = {
                "name": row["description"],
                "category_id": row.get("food_category_id", ""),
            }

    # 3. nutrients for target foods (only the ones we map)
    nutrients: dict[str, dict[str, float]] = {}
    for row in _read_csv(data_dir / "food_nutrient.csv"):
        fdc_id = row["fdc_id"]
        if fdc_id not in targets or row["nutrient_id"] not in _WANTED_NUTRIENTS:
            continue
        amount = _to_float(row["amount"])
        if amount is None:
            continue
        nutrients.setdefault(fdc_id, {})[row["nutrient_id"]] = amount

    # 4. measure unit id -> label (food_portion is optional)
    measure_units: dict[str, str] = {}
    mu_path = data_dir / "measure_unit.csv"
    if mu_path.exists():
        measure_units = {row["id"]: row["name"] for row in _read_csv(mu_path)}

    # 5. portions -> units per food
    portions: dict[str, list[tuple[str, float]]] = {}
    fp_path = data_dir / "food_portion.csv"
    if fp_path.exists():
        for row in _read_csv(fp_path):
            fdc_id = row["fdc_id"]
            if fdc_id not in targets:
                continue
            gram_weight = _to_float(row["gram_weight"])
            if gram_weight is None or gram_weight <= 0:
                continue
            amount = _to_float(row.get("amount", "")) or 1.0
            grams_per_unit = gram_weight / amount if amount else gram_weight
            label = (
                measure_units.get(row.get("measure_unit_id", ""), "").strip()
                or (row.get("modifier") or "").strip()
                or (row.get("portion_description") or "").strip()
                or "portion"
            )
            # FDC uses "undetermined" for id 9999 — fall back to the modifier text.
            if label == "undetermined":
                label = (row.get("modifier") or "portion").strip() or "portion"
            portions.setdefault(fdc_id, []).append((label[:50], round(grams_per_unit, 4)))

    # 6. assemble records
    records: list[ImportRecord] = []
    for fdc_id, food in targets.items():
        n = nutrients.get(fdc_id, {})
        protein = n.get(PROTEIN_ID, 0.0)
        fat = n.get(FAT_ID, 0.0)
        carbs = n.get(CARBS_ID, 0.0)
        units = _build_units(portions.get(fdc_id, []))
        records.append(
            ImportRecord(
                external_id=fdc_id,
                name=food["name"],
                category=categories.get(food["category_id"], _DEFAULT_CATEGORY),
                calories=_resolve_energy(n, protein, fat, carbs),
                protein_g=protein,
                fat_g=fat,
                carbs_g=carbs,
                units=units,
            )
        )
    return records


def _build_units(raw: list[tuple[str, float]]) -> list[tuple[str, float]]:
    """Prepend a canonical 100 g base, de-duplicate by name, cap at MAX_UNITS (INV-004)."""
    units: list[tuple[str, float]] = [("100 g", 100.0)]
    seen = {"100 g"}
    for name, grams in raw:
        if name not in seen:
            units.append((name, grams))
            seen.add(name)
        if len(units) >= MAX_UNITS:
            break
    return units
