"""Password reset router — reset-request and reset-confirm path operations."""

from __future__ import annotations

from typing import Annotated

from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, status
from reset.schemas import (
    ResetConfirmBody,
    ResetConfirmResponse,
    ResetRequestBody,
    ResetRequestResponse,
)
from reset.service import (
    TokenExpiredError,
    TokenNotFoundError,
    TokenUsedError,
    confirm_password_reset,
    request_password_reset,
)
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/reset-request", response_model=ResetRequestResponse)
async def reset_request(
    body: ResetRequestBody,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ResetRequestResponse:
    """Request a password-reset link.

    Always returns 200 — no email enumeration (AC-017).
    """
    await request_password_reset(body.email, db)
    return ResetRequestResponse(detail="If that email is registered, a reset link has been sent.")


@router.post("/reset-confirm", response_model=ResetConfirmResponse)
async def reset_confirm(
    body: ResetConfirmBody,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> ResetConfirmResponse:
    """Confirm a password reset using the token from the email link."""
    try:
        await confirm_password_reset(body.token, body.new_password, db)
    except TokenUsedError as exc:
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="Reset token has already been used."
        ) from exc
    except TokenExpiredError as exc:
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="Reset token has expired."
        ) from exc
    except TokenNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_410_GONE, detail="Invalid reset token."
        ) from exc
    return ResetConfirmResponse(detail="Password updated successfully.")
