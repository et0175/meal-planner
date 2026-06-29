"""Tests for product authoring endpoints.

Covers: AC-033–042, AC-078 (FR-013, FR-014, FR-032)
"""

from __future__ import annotations

from typing import Any

import pytest
from db.models import NutritionPer100g, Product
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession


async def _seed_product(
    db: AsyncSession,
    *,
    name: str = "Global Product",
    owner_id: int | None = None,
) -> Product:
    """Seed a product directly in the DB for testing authorization."""
    p = Product(
        name=name,
        category="Grains",
        diet_tags=[],
        is_deleted=False,
        owner_id=owner_id,
    )
    db.add(p)
    await db.flush()
    db.add(
        NutritionPer100g(
            product_id=p.id,
            calories=100.0,
            protein_g=5.0,
            fat_g=2.0,
            carbs_g=20.0,
        )
    )
    await db.commit()
    await db.refresh(p)
    return p


class TestCreateProduct:
    """FR-013 — Add product (AC-033–038)."""

    async def test_create_product_persists(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-033: valid payload → product persisted, 201 returned."""
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 201
        body = resp.json()
        assert body["name"] == "Chicken Breast"
        assert body["owner_id"] == 1
        assert "id" in body

    async def test_create_product_negative_calories_422(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-034: calories = -10 → 422 (INV-005)."""
        product_payload["nutrition"]["calories"] = -10
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 422

    async def test_create_product_empty_name_422(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-035: empty name → 422."""
        product_payload["name"] = ""
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 422

    async def test_create_product_blank_name_422(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-035 (variant): whitespace-only name → 422."""
        product_payload["name"] = "   "
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 422

    async def test_create_product_501st_is_409(
        self, client: AsyncClient, db: AsyncSession, product_payload: dict[str, Any]
    ) -> None:
        """AC-036: 501st product → 409 (INV-007)."""
        # Bulk-insert 500 products directly in the DB for user 1
        products = [
            Product(
                name=f"Filler {i}",
                category="Test",
                diet_tags=[],
                is_deleted=False,
                owner_id=1,
            )
            for i in range(500)
        ]
        db.add_all(products)
        await db.flush()
        nutrs = [
            NutritionPer100g(product_id=p.id, calories=1.0, protein_g=0.0, fat_g=0.0, carbs_g=0.0)
            for p in products
        ]
        db.add_all(nutrs)
        await db.commit()

        # 501st via API
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 409

    async def test_create_product_11_units_422(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-037 / AC-078: 11 alternative units → 422 (INV-004)."""
        product_payload["units"] = [
            {"unit_name": f"unit{i}", "grams_per_unit": float(i + 1)} for i in range(11)
        ]
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 422

    async def test_create_product_anonymous_401(
        self, anon_client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """AC-038: anonymous request → 401/403 (no auth header)."""
        resp = await anon_client.post("/products", json=product_payload)
        # HTTPBearer returns 403 when header is missing
        assert resp.status_code in (401, 403)

    async def test_create_product_10_units_ok(
        self, client: AsyncClient, product_payload: dict[str, Any]
    ) -> None:
        """Exactly 10 units is allowed (INV-004 boundary)."""
        product_payload["units"] = [
            {"unit_name": f"unit{i}", "grams_per_unit": float(i + 1)} for i in range(10)
        ]
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 201

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            ("protein_g", -1.0),
            ("fat_g", -0.1),
            ("carbs_g", -5.0),
        ],
    )
    async def test_negative_nutrition_fields_422(
        self,
        client: AsyncClient,
        product_payload: dict[str, Any],
        field: str,
        value: float,
    ) -> None:
        """AC-034 (variant): negative protein/fat/carbs → 422 (INV-005)."""
        product_payload["nutrition"][field] = value
        resp = await client.post("/products", json=product_payload)
        assert resp.status_code == 422


class TestEditDeleteProduct:
    """FR-014 — Edit/delete (AC-039–042)."""

    async def test_edit_own_product(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-039: edit own product → updated, 200 returned."""
        p = await _seed_product(db, name="Old Name", owner_id=1)
        resp = await client.put(
            f"/products/{p.id}",
            json={"name": "New Name"},
        )
        assert resp.status_code == 200
        assert resp.json()["name"] == "New Name"

    async def test_edit_other_users_product_403(
        self, client_user2: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-040: edit another user's product → 403 (INV-006)."""
        # Product owned by user 1; client_user2 is user 2
        p = await _seed_product(db, name="User1 Product", owner_id=1)
        resp = await client_user2.put(
            f"/products/{p.id}",
            json={"name": "Hijacked"},
        )
        assert resp.status_code == 403

    async def test_delete_own_product(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-041: delete own product → soft-deleted."""
        p = await _seed_product(db, name="To Delete", owner_id=1)
        resp = await client.delete(f"/products/{p.id}")
        assert resp.status_code == 200

        # Verify product is soft-deleted
        get_resp = await client.get(f"/products/{p.id}")
        assert get_resp.status_code == 404

    async def test_delete_global_product_403(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-042: delete global product (owner_id=null) → 403 (INV-006)."""
        global_p = await _seed_product(db, name="Global Product", owner_id=None)
        resp = await client.delete(f"/products/{global_p.id}")
        assert resp.status_code == 403

    async def test_edit_global_product_403(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """INV-006: edit global product → 403."""
        global_p = await _seed_product(db, name="Global Product", owner_id=None)
        resp = await client.put(
            f"/products/{global_p.id}",
            json={"name": "Tampered"},
        )
        assert resp.status_code == 403


class TestUnitLimit:
    """FR-032 — Unit limit (AC-078)."""

    async def test_unit_limit_10_already_11th_rejected(
        self, client: AsyncClient, db: AsyncSession
    ) -> None:
        """AC-078: 10 units already → 11th unit rejected 422 on create."""
        units = [{"unit_name": f"u{i}", "grams_per_unit": float(i + 1)} for i in range(11)]
        payload = {
            "name": "Multi-unit Product",
            "category": "Test",
            "diet_tags": [],
            "nutrition": {"calories": 100.0, "protein_g": 5.0, "fat_g": 2.0, "carbs_g": 10.0},
            "units": units,
        }
        resp = await client.post("/products", json=payload)
        assert resp.status_code == 422
