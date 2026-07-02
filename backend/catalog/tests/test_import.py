"""Tests for the USDA FoodData Central importer (FR-038, ADR-0013).

Covers AC-126 (inserts global products), AC-127 (idempotent re-import),
AC-128 (energy Atwater fallback), AC-129 (units capped at 10). Uses a small
hand-written FDC-shaped CSV fixture so no real download is required.
"""

from __future__ import annotations

import csv
from pathlib import Path

from db.models import NutritionPer100g, Product, ProductTranslation, ProductUnit
from importer.loader import load_records
from importer.usda import parse_usda
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession


def _write(path: Path, header: list[str], rows: list[list[object]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f, quoting=csv.QUOTE_ALL)
        w.writerow(header)
        for r in rows:
            w.writerow(r)


def _build_fixture(d: Path) -> None:
    """A minimal FDC export: 2 foundation foods + 1 non-target sample_food."""
    _write(d / "food_category.csv", ["id", "code", "description"], [
        ["1", "0100", "Dairy and Egg Products"],
        ["2", "0500", "Poultry Products"],
    ])
    _write(d / "food.csv",
        ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
        [
            ["1001", "foundation_food", "Milk, whole", "1", "2020-01-01"],
            ["1002", "foundation_food", "Chicken breast, raw", "2", "2020-01-01"],
            ["9999", "sample_food", "Should be skipped", "1", "2020-01-01"],
        ],
    )
    # 1001: has 1008 energy. 1002: NO 1008 -> only 2048 (Atwater specific).
    _write(d / "food_nutrient.csv",
        ["id", "fdc_id", "nutrient_id", "amount"],
        [
            ["1", "1001", "1008", "61"],    # energy kcal
            ["2", "1001", "1003", "3.2"],   # protein
            ["3", "1001", "1004", "3.3"],   # fat
            ["4", "1001", "1005", "4.8"],   # carbs
            ["5", "1002", "2048", "165"],   # energy via Atwater specific (no 1008)
            ["6", "1002", "1003", "31"],    # protein (fat/carbs missing -> default 0)
            ["7", "9999", "1008", "999"],   # belongs to skipped food
        ],
    )
    _write(d / "measure_unit.csv", ["id", "name"], [["1000", "cup"], ["1001", "tbsp"]])
    _write(d / "food_portion.csv",
        ["id", "fdc_id", "seq_num", "amount", "measure_unit_id",
         "portion_description", "modifier", "gram_weight"],
        [
            ["10", "1001", "1", "1", "1000", "", "", "244"],   # 1 cup = 244 g
            ["11", "1002", "1", "1", "1000", "", "", "140"],   # 1 cup = 140 g
        ],
    )


class TestParse:
    def test_energy_fallback_and_defaults(self, tmp_path: Path) -> None:
        """AC-128: energy falls back to 2048; missing macros default to 0.0."""
        _build_fixture(tmp_path)
        by_id = {r.external_id: r for r in parse_usda(tmp_path)}
        assert set(by_id) == {"1001", "1002"}  # sample_food skipped
        assert by_id["1001"].calories == 61.0
        assert by_id["1002"].calories == 165.0  # from nutrient 2048
        assert by_id["1002"].fat_g == 0.0 and by_id["1002"].carbs_g == 0.0
        # base 100 g unit is always present, plus the cup portion
        assert ("100 g", 100.0) in by_id["1001"].units
        assert any(u[0] == "cup" for u in by_id["1001"].units)

    def test_energy_derived_from_macros_when_absent(self, tmp_path: Path) -> None:
        """No energy nutrient but macros present -> Atwater (4p + 9f + 4c)."""
        _write(tmp_path / "food_category.csv", ["id", "code", "description"], [["1", "x", "Cat"]])
        _write(tmp_path / "food.csv",
            ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
            [["3001", "foundation_food", "No-energy food", "1", "2020-01-01"]])
        # protein 10, fat 2, carbs 5 -> 4*10 + 9*2 + 4*5 = 78 kcal, no energy nutrient row
        _write(tmp_path / "food_nutrient.csv", ["id", "fdc_id", "nutrient_id", "amount"],
            [["1", "3001", "1003", "10"], ["2", "3001", "1004", "2"], ["3", "3001", "1005", "5"]])
        rec = parse_usda(tmp_path)[0]
        assert rec.calories == 78.0

    def test_no_energy_no_macros_stays_zero(self, tmp_path: Path) -> None:
        """No energy and no macros -> calories 0.0 (product still kept)."""
        _write(tmp_path / "food_category.csv", ["id", "code", "description"], [["1", "x", "Cat"]])
        _write(tmp_path / "food.csv",
            ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
            [["3002", "foundation_food", "Water", "1", "2020-01-01"]])
        _write(tmp_path / "food_nutrient.csv", ["id", "fdc_id", "nutrient_id", "amount"], [])
        rec = parse_usda(tmp_path)[0]
        assert rec.calories == 0.0
        assert rec.protein_g == 0.0

    def test_unknown_category_defaults_to_uncategorized(self, tmp_path: Path) -> None:
        """A food_category_id with no matching category row -> 'Uncategorized'."""
        _write(tmp_path / "food_category.csv", ["id", "code", "description"], [["1", "x", "Cat"]])
        _write(tmp_path / "food.csv",
            ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
            [["3003", "foundation_food", "Orphan category food", "999", "2020-01-01"]])
        _write(tmp_path / "food_nutrient.csv", ["id", "fdc_id", "nutrient_id", "amount"],
            [["1", "3003", "1008", "50"]])
        rec = parse_usda(tmp_path)[0]
        assert rec.category == "Uncategorized"

    def test_units_capped_at_ten(self, tmp_path: Path) -> None:
        """AC-129: no more than 10 units even with many portions."""
        _write(tmp_path / "food_category.csv", ["id", "code", "description"], [["1", "x", "Cat"]])
        _write(tmp_path / "food.csv",
            ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
            [["2001", "foundation_food", "Many portions", "1", "2020-01-01"]])
        _write(tmp_path / "food_nutrient.csv", ["id", "fdc_id", "nutrient_id", "amount"],
            [["1", "2001", "1008", "100"]])
        _write(tmp_path / "measure_unit.csv", ["id", "name"],
            [[str(1000 + i), f"unit{i}"] for i in range(15)])
        _write(tmp_path / "food_portion.csv",
            ["id", "fdc_id", "seq_num", "amount", "measure_unit_id",
             "portion_description", "modifier", "gram_weight"],
            [[str(i), "2001", str(i), "1", str(1000 + i), "", "", str(10 + i)] for i in range(15)])
        rec = parse_usda(tmp_path)[0]
        assert len(rec.units) == 10


class TestLoad:
    async def test_inserts_global_products(self, tmp_path: Path, db: AsyncSession) -> None:
        """AC-126: records become global products with nutrition, units, en name."""
        _build_fixture(tmp_path)
        stats = await load_records(db, parse_usda(tmp_path))
        assert stats.inserted == 2 and stats.updated == 0

        milk = (
            await db.execute(select(Product).where(Product.external_id == "1001"))
        ).scalar_one()
        assert milk.owner_id is None
        assert milk.source == "usda_fdc"
        assert milk.name == "Milk, whole"
        assert milk.category == "Dairy and Egg Products"

        nutr = (
            await db.execute(
                select(NutritionPer100g).where(NutritionPer100g.product_id == milk.id)
            )
        ).scalar_one()
        assert nutr.calories == 61.0

        tr = (
            await db.execute(
                select(ProductTranslation).where(
                    ProductTranslation.product_id == milk.id, ProductTranslation.locale == "en"
                )
            )
        ).scalar_one()
        assert tr.name == "Milk, whole"

        n_units = (
            await db.execute(
                select(func.count(ProductUnit.id)).where(ProductUnit.product_id == milk.id)
            )
        ).scalar_one()
        assert n_units == 2  # base 100 g + cup

    async def test_reimport_is_idempotent(self, tmp_path: Path, db: AsyncSession) -> None:
        """AC-127: re-running updates in place; no duplicate products."""
        _build_fixture(tmp_path)
        await load_records(db, parse_usda(tmp_path))

        first = (await db.execute(select(func.count(Product.id)))).scalar_one()

        # Second run with a changed name for 1001.
        _write(tmp_path / "food.csv",
            ["fdc_id", "data_type", "description", "food_category_id", "publication_date"],
            [
                ["1001", "foundation_food", "Milk, whole (updated)", "1", "2020-01-01"],
                ["1002", "foundation_food", "Chicken breast, raw", "2", "2020-01-01"],
                ["9999", "sample_food", "Should be skipped", "1", "2020-01-01"],
            ],
        )
        stats2 = await load_records(db, parse_usda(tmp_path))
        assert stats2.inserted == 0 and stats2.updated == 2

        second = (await db.execute(select(func.count(Product.id)))).scalar_one()
        assert second == first  # no duplicates

        milk = (
            await db.execute(select(Product).where(Product.external_id == "1001"))
        ).scalar_one()
        assert milk.name == "Milk, whole (updated)"

    async def test_reimport_resurrects_soft_deleted(
        self, tmp_path: Path, db: AsyncSession
    ) -> None:
        """A product soft-deleted between imports is un-deleted when it reappears."""
        _build_fixture(tmp_path)
        await load_records(db, parse_usda(tmp_path))

        milk = (
            await db.execute(select(Product).where(Product.external_id == "1001"))
        ).scalar_one()
        milk.is_deleted = True
        await db.commit()

        await load_records(db, parse_usda(tmp_path))
        refreshed = (
            await db.execute(select(Product).where(Product.external_id == "1001"))
        ).scalar_one()
        assert refreshed.is_deleted is False
