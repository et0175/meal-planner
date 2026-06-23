"""Account router — register, sign-in, sign-out path operations.

No business logic lives here — all calls delegate to account.service.
"""

from __future__ import annotations

from typing import Annotated

from account.schemas import (
    RegisterRequest,
    RegisterResponse,
    SignInRequest,
    SignInResponse,
    SignOutResponse,
)
from account.service import LockoutError, register_account, sign_in, sign_out
from db.engine import get_db
from fastapi import APIRouter, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])

_bearer = HTTPBearer()


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(
    body: RegisterRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> RegisterResponse:
    try:
        account = await register_account(body.email, body.password, db)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    return RegisterResponse(id=account.id, email=account.email, role=account.role)


@router.post("/sign-in", response_model=SignInResponse)
async def sign_in_route(
    body: SignInRequest,
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SignInResponse:
    try:
        session, role = await sign_in(body.email, body.password, db)
    except LockoutError as exc:
        response.headers["Retry-After"] = str(exc.retry_after)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many failed sign-in attempts. Account temporarily locked.",
            headers={"Retry-After": str(exc.retry_after)},
        ) from exc
    except PermissionError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
        ) from exc

    return SignInResponse(token=session.token, account_id=session.account_id, role=role)


@router.post("/sign-out", response_model=SignOutResponse)
async def sign_out_route(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> SignOutResponse:
    """Invalidate the session identified by the Bearer token in the Authorization header."""
    invalidated = await sign_out(credentials.credentials, db)
    if not invalidated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token not found or already invalidated",
        )
    return SignOutResponse(detail="Signed out successfully")
