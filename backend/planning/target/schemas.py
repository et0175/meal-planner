"""Pydantic v2 schemas for nutrition target endpoints."""

from __future__ import annotations

from pydantic import BaseModel, Field


class NutritionTargetRequest(BaseModel):
    target_calories: float = Field(..., ge=0, description="Must be >= 0 (INV-013)")
    protein_g: float = Field(0.0, ge=0)
    fat_g: float = Field(0.0, ge=0)
    carbs_g: float = Field(0.0, ge=0)


class NutritionTargetResponse(BaseModel):
    id: int
    user_id: int
    target_calories: float
    protein_g: float
    fat_g: float
    carbs_g: float

    model_config = {"from_attributes": True}
