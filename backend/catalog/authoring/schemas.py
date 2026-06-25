"""Pydantic v2 schemas for product authoring (create/update/delete) operations."""

from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field, field_validator


class NutritionIn(BaseModel):
    """Nutrition values per 100 g. All values must be >= 0 (INV-005)."""

    calories: float = Field(..., ge=0, description="Calories per 100 g")
    protein_g: float = Field(..., ge=0, description="Protein in grams per 100 g")
    fat_g: float = Field(..., ge=0, description="Fat in grams per 100 g")
    carbs_g: float = Field(..., ge=0, description="Carbohydrates in grams per 100 g")


class ProductUnitIn(BaseModel):
    """An alternative unit with gram-conversion factor."""

    unit_name: str = Field(..., min_length=1, max_length=50)
    grams_per_unit: float = Field(..., gt=0, description="Grams equivalent for this unit")


class CreateProductRequest(BaseModel):
    """Payload for POST /products."""

    name: str = Field(..., min_length=1, max_length=255, description="Product name (non-empty)")
    category: str = Field(..., min_length=1, max_length=100)
    diet_tags: list[str] = Field(default_factory=list)
    nutrition: NutritionIn
    # INV-004: max 10 alternative units; validated below
    units: list[ProductUnitIn] = Field(default_factory=list)

    @field_validator("units")
    @classmethod
    def units_max_ten(cls, v: list[ProductUnitIn]) -> list[ProductUnitIn]:
        if len(v) > 10:
            raise ValueError("A product may have at most 10 alternative units (INV-004)")
        return v

    @field_validator("name")
    @classmethod
    def name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Product name must not be blank")
        return v


class UpdateProductRequest(BaseModel):
    """Payload for PUT /products/:id. All fields optional."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    category: str | None = Field(default=None, min_length=1, max_length=100)
    diet_tags: list[str] | None = None
    nutrition: NutritionIn | None = None
    # INV-004: max 10 alternative units
    units: list[ProductUnitIn] | None = None

    @field_validator("units")
    @classmethod
    def units_max_ten(cls, v: list[ProductUnitIn] | None) -> list[ProductUnitIn] | None:
        if v is not None and len(v) > 10:
            raise ValueError("A product may have at most 10 alternative units (INV-004)")
        return v

    model_config = ConfigDict(extra="ignore")


class ProductResponse(BaseModel):
    """Response schema for created/updated product."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_id: int | None
    name: str
    category: str
    diet_tags: list[str]


class DeleteResponse(BaseModel):
    detail: str
