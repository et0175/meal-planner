"""Session service — token validation used by the auth middleware."""

from __future__ import annotations

from datetime import UTC, datetime

from db.models import Account, Session
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession


async def validate_token(token: str, db: AsyncSession) -> Account | None:
    """Return the Account for a valid, non-expired session token.

    Returns None if the token does not exist, has been invalidated, or has expired.
    Projects only the columns needed (no SELECT *).
    """
    stmt = (
        select(Session.id, Session.is_valid, Session.expires_at, Session.account_id)
        .where(Session.token == token)
        .limit(1)
    )
    result = await db.execute(stmt)
    row = result.one_or_none()
    if row is None:
        return None

    if not row.is_valid:
        return None

    if row.expires_at is not None:
        now = datetime.now(tz=UTC)
        expires_at = row.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=UTC)
        if now > expires_at:
            return None

    account_stmt = (
        select(Account.id, Account.email, Account.role)
        .where(Account.id == row.account_id)
        .limit(1)
    )
    account_result = await db.execute(account_stmt)
    account_row = account_result.one_or_none()
    if account_row is None:
        return None

    # Return a lightweight Account-like object; use ORM model for type safety
    account_obj = Account()
    account_obj.id = account_row.id
    account_obj.email = account_row.email
    account_obj.role = account_row.role
    return account_obj
