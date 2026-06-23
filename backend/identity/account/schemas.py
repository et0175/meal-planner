"""Pydantic v2 schemas for the account module."""

from __future__ import annotations

from db.models import RoleEnum
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: RoleEnum = RoleEnum.user

    @field_validator("password")
    @classmethod
    def password_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("password must not be empty")
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
