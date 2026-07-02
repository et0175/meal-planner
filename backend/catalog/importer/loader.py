"""Idempotent batched upsert of import records into the catalog (FR-038, ADR-0013).

Products are keyed on (source, external_id). A re-run updates existing rows in
place rather than inserting duplicates. Imported products are global (owner_id
NULL) and carry an English name translation; category/nutrition/units are synced.
"""

from __future__ import annotations

from dataclasses import dataclass

from db.models import NutritionPer100g, Product, ProductTranslation, ProductUnit
from importer.usda import ImportRecord
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

DEFAULT_SOURCE = "usda_fdc"
DEFAULT_LOCALE = "en"


@dataclass
class ImportStats:
    inserted: int = 0
    updated: int = 0

    @property
    def total(self) -> int:
        return self.inserted + self.updated


async def load_records(
    db: AsyncSession,
    records: list[ImportRecord],
    *,
    source: str = DEFAULT_SOURCE,
    locale: str = DEFAULT_LOCALE,
    batch_size: int = 1000,
) -> ImportStats:
    """Upsert ``records`` as global products, committing every ``batch_size`` rows."""
    # Preload existing external_id -> product_id for this source (one query).
    rows = (
        await db.execute(
            select(Product.external_id, Product.id).where(
                Product.source == source, Product.external_id.is_not(None)
            )
        )
    ).all()
    existing: dict[str, int] = {ext: pid for ext, pid in rows if ext is not None}

    stats = ImportStats()
    for i, rec in enumerate(records, start=1):
        pid = existing.get(rec.external_id)
        if pid is None:
            await _insert(db, rec, source=source, locale=locale)
            stats.inserted += 1
        else:
            await _update(db, pid, rec, locale=locale)
            stats.updated += 1
        if i % batch_size == 0:
            await db.commit()
    await db.commit()
    return stats


async def _insert(db: AsyncSession, rec: ImportRecord, *, source: str, locale: str) -> None:
    product = Product(
        owner_id=None,
        name=rec.name,
        category=rec.category,
        diet_tags=[],
        is_deleted=False,
        source=source,
        external_id=rec.external_id,
    )
    db.add(product)
    await db.flush()
    db.add(
        NutritionPer100g(
            product_id=product.id,
            calories=rec.calories,
            protein_g=rec.protein_g,
            fat_g=rec.fat_g,
            carbs_g=rec.carbs_g,
        )
    )
    for unit_name, grams in rec.units:
        db.add(ProductUnit(product_id=product.id, unit_name=unit_name, grams_per_unit=grams))
    db.add(ProductTranslation(product_id=product.id, locale=locale, name=rec.name))


async def _update(db: AsyncSession, pid: int, rec: ImportRecord, *, locale: str) -> None:
    product = (
        await db.execute(
            select(Product)
            .options(
                selectinload(Product.nutrition),
                selectinload(Product.units),
                selectinload(Product.translations),
            )
            .where(Product.id == pid)
        )
    ).scalar_one()

    product.name = rec.name
    product.category = rec.category
    product.is_deleted = False  # re-surfaces a product that reappeared in the source

    if product.nutrition is None:
        db.add(
            NutritionPer100g(
                product_id=pid,
                calories=rec.calories,
                protein_g=rec.protein_g,
                fat_g=rec.fat_g,
                carbs_g=rec.carbs_g,
            )
        )
    else:
        product.nutrition.calories = rec.calories
        product.nutrition.protein_g = rec.protein_g
        product.nutrition.fat_g = rec.fat_g
        product.nutrition.carbs_g = rec.carbs_g

    # Replace units so removed/changed portions do not linger.
    for unit in product.units:
        await db.delete(unit)
    await db.flush()
    for unit_name, grams in rec.units:
        db.add(ProductUnit(product_id=pid, unit_name=unit_name, grams_per_unit=grams))

    translation = next((t for t in product.translations if t.locale == locale), None)
    if translation is None:
        db.add(ProductTranslation(product_id=pid, locale=locale, name=rec.name))
    else:
        translation.name = rec.name
