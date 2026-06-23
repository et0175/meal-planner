"""Pydantic v2 schemas for the account module."""

from __future__ import annotations

from db.models import RoleEnum
from pydantic import BaseModel, EmailStr, field_validator  # RoleEnum used in response models


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password must not be empty")
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v


class RegisterResponse(BaseModel):
    id: int
    email: str
    role: RoleEnum


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class SignInResponse(BaseModel):
    token: str
    account_id: int
    role: RoleEnum


class SignOutResponse(BaseModel):
    detail: str
