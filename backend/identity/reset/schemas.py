"""Pydantic v2 schemas for the password-reset module."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr


class ResetRequestBody(BaseModel):
    email: EmailStr


class ResetRequestResponse(BaseModel):
    detail: str


class ResetConfirmBody(BaseModel):
    token: str
    new_password: str


class ResetConfirmResponse(BaseModel):
    detail: str
