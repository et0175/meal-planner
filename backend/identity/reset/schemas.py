"""Pydantic v2 schemas for the password-reset module."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, field_validator


class ResetRequestBody(BaseModel):
    email: EmailStr


class ResetRequestResponse(BaseModel):
    detail: str


class ResetConfirmBody(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password must not be empty")
        if len(v) < 8:
            raise ValueError("password must be at least 8 characters")
        return v


class ResetConfirmResponse(BaseModel):
    detail: str
