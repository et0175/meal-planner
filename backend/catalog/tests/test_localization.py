"""Tests for product name localization and pagination (FR-037, ADR-0012).

Covers AC-122 (returns requested locale), AC-123 (English fallback),
AC-125 (user product stored in creator locale), and list pagination.
"""

from __future__ import annotations

from db.models import NutritionPer100g, Product, ProductTranslation
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def _create_product(
    db: AsyncSession,
    *,
    name: str,
    category: str = "Dairy",
    owner_id: int | None = None,
    translations: dict[str, str] | None = None,
) -> Product:
    p = Product(name=name, category=category, diet_tags=[], is_deleted=False, owner_id=owner_id)
    db.add(p)
    await db.flush()
    db.add(
        NutritionPer100g(
            product_id=p.id, calories=100.0, protein_g=10.0, fat_g=5.0, carbs_g=2.0
        )
    )
    for locale, localized in (translations or {}).items():
        db.add(ProductTranslation(product_id=p.id, locale=locale, name=localized))
    await db.commit()
    await db.refresh(p)
    return p


class TestLocaleResolution:
    """FR-037 — locale resolution and fallback."""

    async def test_returns_requested_locale(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-122: a German caller gets the German name."""
        await _create_product(
            db, name="Whole Milk", translations={"en": "Whole Milk", "de": "Vollmilch"}
        )
        resp = await client.get("/products?locale=de")
        assert resp.status_code == 200
        assert resp.json()["items"][0]["name"] == "Vollmilch"

    async def test_falls_back_to_default_locale(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-123: missing 'de' translation falls back to the canonical English name."""
        await _create_product(db, name="Broccoli", translations={"en": "Broccoli"})
        resp = await client.get("/products?locale=de")
        assert resp.status_code == 200
        assert resp.json()["items"][0]["name"] == "Broccoli"

    async def test_detail_returns_requested_locale(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-122 (detail view): product detail resolves to the requested locale."""
        p = await _create_product(
            db, name="Rolled Oats", translations={"en": "Rolled Oats", "de": "Haferflocken"}
        )
        resp = await client.get(f"/products/{p.id}?locale=de")
        assert resp.status_code == 200
        assert resp.json()["name"] == "Haferflocken"

    async def test_default_locale_is_english(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """No locale param → English canonical name."""
        await _create_product(
            db, name="Whole Milk", translations={"en": "Whole Milk", "de": "Vollmilch"}
        )
        resp = await client.get("/products")
        assert resp.json()["items"][0]["name"] == "Whole Milk"

    async def test_search_matches_localized_name(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """Search runs against the resolved name, not just the canonical one."""
        await _create_product(
            db, name="Whole Milk", translations={"en": "Whole Milk", "de": "Vollmilch"}
        )
        resp = await client.get("/products?locale=de&search=vollm")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == 1
        assert body["items"][0]["name"] == "Vollmilch"


class TestAuthoringLocale:
    """FR-037 — user-added products are stored in the creator's locale (CON-007)."""

    async def test_created_product_stored_in_creator_locale(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-125: a product created with locale 'de' is retrievable in 'de'."""
        payload = {
            "name": "Selbstgemachtes Müsli",
            "category": "Grains",
            "diet_tags": [],
            "nutrition": {"calories": 380.0, "protein_g": 13.0, "fat_g": 7.0, "carbs_g": 67.0},
            "units": [{"unit_name": "100g", "grams_per_unit": 100.0}],
            "locale": "de",
        }
        create = await client.post("/products", json=payload)
        assert create.status_code == 201

        resp = await client.get("/products?locale=de&search=Müsli")
        assert resp.json()["items"][0]["name"] == "Selbstgemachtes Müsli"

    async def test_update_name_syncs_translation(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """Editing the name updates the locale translation too."""
        p = await _create_product(
            db, name="Old Name", owner_id=1, translations={"en": "Old Name"}
        )
        resp = await client.put(f"/products/{p.id}", json={"name": "New Name", "locale": "en"})
        assert resp.status_code == 200
        listed = await client.get("/products?locale=en&search=New Name")
        assert listed.json()["items"][0]["name"] == "New Name"


class TestPagination:
    """Catalog list pagination — total reflects the full match, items are a page."""

    async def test_limit_and_total(self, client: AsyncClient, db: AsyncSession) -> None:
        for i in range(25):
            await _create_product(db, name=f"Item {i:02d}", translations={"en": f"Item {i:02d}"})
        resp = await client.get("/products?limit=10&offset=0")
        assert resp.status_code == 200
        body = resp.json()
        assert body["total"] == 25
        assert len(body["items"]) == 10

    async def test_offset_paging(self, client: AsyncClient, db: AsyncSession) -> None:
        for i in range(25):
            await _create_product(db, name=f"Item {i:02d}", translations={"en": f"Item {i:02d}"})
        page1 = (await client.get("/products?limit=10&offset=0&sort_by=name")).json()
        page2 = (await client.get("/products?limit=10&offset=10&sort_by=name")).json()
        names1 = {i["name"] for i in page1["items"]}
        names2 = {i["name"] for i in page2["items"]}
        assert names1.isdisjoint(names2)
        assert len(page2["items"]) == 10
