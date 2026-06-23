"""Password reset service — reset-request and reset-confirm business logic."""

from __future__ import annotations

import os
import secrets
from datetime import UTC, datetime, timedelta

from account.service import hash_password
from db.models import Account, ResetToken
from email_adapter.sender import send_password_reset_email
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

_TOKEN_EXPIRY_MINUTES: int = int(os.environ.get("RESET_TOKEN_EXPIRY_MINUTES", "60"))


def _expiry_minutes() -> int:
    return int(os.environ.get("RESET_TOKEN_EXPIRY_MINUTES", "60"))


class TokenExpiredError(Exception):
    """Raised when a reset token is expired."""


class TokenUsedError(Exception):
    """Raised when a reset token has already been used."""


class TokenNotFoundError(Exception):
    """Raised when a reset token does not exist."""


async def request_password_reset(email: str, db: AsyncSession) -> None:
    """Generate a single-use reset token and send an email.

    Always returns without error — even for unknown emails (no enumeration, AC-017).
    Emits EVT-004 (represented by email send).
    """
    stmt = select(Account.id, Account.email).where(Account.email == email.lower()).limit(1)
    result = await db.execute(stmt)
    row = result.one_or_none()

    if row is None:
        # No enumeration: silently return
        return

    token_value = secrets.token_urlsafe(32)  # 32 bytes = 256 bits > NFR-007 128-bit minimum
    expires_at = datetime.now(tz=UTC) + timedelta(minutes=_expiry_minutes())
    reset_token = ResetToken(
        account_id=row.id,
        token=token_value,
        is_used=False,
        expires_at=expires_at,
    )
    db.add(reset_token)
    await db.commit()

    send_password_reset_email(row.email, token_value)


async def confirm_password_reset(token_value: str, new_password: str, db: AsyncSession) -> None:
    """Verify the reset token and update the account's password.

    Raises TokenNotFoundError, TokenUsedError, or TokenExpiredError as appropriate.
    Marks the token as used and updates the password (EVT-005).
    """
    stmt = (
        select(
            ResetToken.id,
            ResetToken.account_id,
            ResetToken.is_used,
            ResetToken.expires_at,
        )
        .where(ResetToken.token == token_value)
        .limit(1)
    )
    result = await db.execute(stmt)
    row = result.one_or_none()

    if row is None:
        raise TokenNotFoundError("Reset token not found")

    if row.is_used:
        raise TokenUsedError("Reset token has already been used")

    expires_at = row.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=UTC)
    if datetime.now(tz=UTC) > expires_at:
        raise TokenExpiredError("Reset token has expired")

    new_hash = hash_password(new_password)
    await db.execute(
        update(Account)
        .where(Account.id == row.account_id)
        .values(password_hash=new_hash, failed_sign_in_count=0, locked_until=None)
    )
    await db.execute(
        update(ResetToken).where(ResetToken.id == row.id).values(is_used=True)
    )
    await db.commit()
