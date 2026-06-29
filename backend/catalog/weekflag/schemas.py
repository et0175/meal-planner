"""Pydantic v2 schemas for week flag operations."""

from __future__ import annotations

from datetime import datetime

from db.models import WeekFlagEnum
from pydantic import BaseModel


class SetWeekFlagRequest(BaseModel):
    flag: WeekFlagEnum


class WeekFlagResponse(BaseModel):
    product_id: int
    user_id: int
    flag: WeekFlagEnum
    updated_at: datetime
