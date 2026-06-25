"""Pydantic v2 schemas for product query (read) operations."""

from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NutritionSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    calories: float
    protein_g: float
    fat_g: float
    carbs_g: float


class ProductUnitSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_name: str
    grams_per_unit: float


class ProductSummary(BaseModel):
    """Lightweight product representation for list/card views."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int | None
    name: str
    category: str
    diet_tags: list[str]
    nutrition: NutritionSchema | None
    created_at: datetime


class ProductDetail(BaseModel):
    """Full product detail including units and nutrition."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int | None
    name: str
    category: str
    diet_tags: list[str]
    nutrition: NutritionSchema | None
    units: list[ProductUnitSchema]
    created_at: datetime


class ProductListResponse(BaseModel):
    """Paginated product list."""

    items: list[ProductSummary]
    total: int
