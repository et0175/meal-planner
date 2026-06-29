"""Pydantic v2 schemas for meal plan assignment endpoints."""

from __future__ import annotations

from datetime import date
from typing import Any

from db.models import MealSlot
from pydantic import BaseModel, Field, field_validator


class NutritionPerUnit(BaseModel):
    """Optional inline nutrition data (per assignment unit)."""

    kcal: float | None = None
    protein_g: float | None = None
    fat_g: float | None = None
    carbs_g: float | None = None


class CreateAssignmentRequest(BaseModel):
    product_id: int
    product_name: str = Field(..., min_length=1, max_length=255)
    date: date
    meal_slot: MealSlot
    quantity: float = Field(..., gt=0, description="Must be > 0 (INV-008)")
    unit: str = Field(..., min_length=1, max_length=50)
    nutrition: NutritionPerUnit | None = None

    @field_validator("product_name")
    @classmethod
    def product_name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("product_name must not be blank")
        return v


class UpdateAssignmentRequest(BaseModel):
    quantity: float | None = Field(None, gt=0, description="Must be > 0 if provided (INV-008)")
    unit: str | None = Field(None, min_length=1, max_length=50)
    nutrition: NutritionPerUnit | None = None


class MoveAssignmentRequest(BaseModel):
    date: date
    meal_slot: MealSlot


class AssignmentResponse(BaseModel):
    id: int
    user_id: int
    product_id: int
    product_name: str
    date: date
    meal_slot: MealSlot
    quantity: float
    unit: str
    kcal_per_unit: float | None = None
    protein_g_per_unit: float | None = None
    fat_g_per_unit: float | None = None
    carbs_g_per_unit: float | None = None

    model_config = {"from_attributes": True}


class WeekPlanResponse(BaseModel):
    week: str
    assignments: list[AssignmentResponse]
    # ADR-0002: this-week flagged products from Catalog (only populated for current week)
    week_flagged_products: list[dict[str, Any]] = Field(default_factory=list)


class ProductSearchResult(BaseModel):
    product_id: int
    product_name: str
    category: str | None = None
    recently_used: bool = False
    owner_id: int | None = None


class DeleteResponse(BaseModel):
    detail: str
