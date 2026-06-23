"""Account service — register, sign-in, sign-out business logic."""

from __future__ import annotations

import os
import secrets
from datetime import UTC, datetime, timedelta

import bcrypt
from db.models import Account, RoleEnum, Session
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

_BCRYPT_ROUNDS: int = 10  # bcrypt work factor — min 10 per security requirements

# Dummy hash used for constant-time comparison when email is not found (AC-007)
_DUMMY_HASH: bytes = bcrypt.hashpw(b"dummy", bcrypt.gensalt(rounds=10))


def _max_attempts() -> int:
    """Read max attempts from env each call so tests can override via monkeypatch."""
    return int(os.environ.get("RATE_LIMIT_MAX_ATTEMPTS", "10"))


def _lockout_minutes() -> int:
    return int(os.environ.get("RATE_LIMIT_LOCKOUT_MINUTES", "60"))


def hash_password(password: str) -> str:
    """Hash a password with bcrypt (NFR-006: min 10 rounds)."""
    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=_BCRYPT_ROUNDS))
    return hashed.decode()


def verify_password(plain: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash."""
    return bool(bcrypt.checkpw(plain.encode(), hashed.encode()))


async def register_account(
    email: str,
    password: str,
    db: AsyncSession,
) -> Account:
    """Create a new account. Role is always RoleEnum.user — not caller-controlled.

    Raises ValueError on duplicate email (INV-001).
    """
    hashed = hash_password(password)
    account = Account(email=email.lower(), password_hash=hashed, role=RoleEnum.user)
    db.add(account)
    try:
        await db.commit()
        await db.refresh(account)
    except IntegrityError:
        await db.rollback()
        raise ValueError(f"Email already registered: {email}") from None
    return account


async def sign_in(
    email: str,
    password: str,
    db: AsyncSession,
) -> Session:
    """Authenticate credentials and return a new Session.

    Raises PermissionError on bad credentials.
    Raises LockoutError (subclass of PermissionError) when account is locked.
    """
    stmt = select(
        Account.id,
        Account.email,
        Account.password_hash,
        Account.role,
        Account.failed_sign_in_count,
        Account.locked_until,
    ).where(Account.email == email.lower()).limit(1)
    result = await db.execute(stmt)
    row = result.one_or_none()

    now = datetime.now(tz=UTC)

    if row is None:
        # Unknown email — perform dummy bcrypt to avoid timing attack
        bcrypt.checkpw(password.encode(), _DUMMY_HASH)
        raise PermissionError("Invalid credentials")

    # Check lockout
    if row.locked_until is not None:
        locked_until = row.locked_until
        if locked_until.tzinfo is None:
            locked_until = locked_until.replace(tzinfo=UTC)
        if now < locked_until:
            retry_after = int((locked_until - now).total_seconds())
            raise LockoutError(f"Account locked. Retry after {retry_after} seconds", retry_after)

    # Verify password
    if not verify_password(password, row.password_hash):
        new_count = row.failed_sign_in_count + 1
        max_attempts = _max_attempts()
        if new_count >= max_attempts:
            lockout_until = now + timedelta(minutes=_lockout_minutes())
            await db.execute(
                update(Account)
                .where(Account.id == row.id)
                .values(failed_sign_in_count=new_count, locked_until=lockout_until)
            )
        else:
            await db.execute(
                update(Account)
                .where(Account.id == row.id)
                .values(failed_sign_in_count=new_count)
            )
        await db.commit()
        raise PermissionError("Invalid credentials")

    # Success — reset failed count and lockout
    await db.execute(
        update(Account)
        .where(Account.id == row.id)
        .values(failed_sign_in_count=0, locked_until=None)
    )

    token = secrets.token_urlsafe(32)  # 32 bytes = 256 bits entropy (well above 128-bit minimum)
    session = Session(account_id=row.id, token=token, is_valid=True)
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return session


async def sign_out(token: str, db: AsyncSession) -> bool:
    """Invalidate a session token. Returns True if found and invalidated."""
    stmt = select(Session.id, Session.is_valid).where(Session.token == token).limit(1)
    result = await db.execute(stmt)
    row = result.one_or_none()
    if row is None:
        return False
    await db.execute(
        update(Session).where(Session.id == row.id).values(is_valid=False)
    )
    await db.commit()
    return True


class LockoutError(PermissionError):
    """Raised when a sign-in attempt is blocked due to rate-limiting."""

    def __init__(self, message: str, retry_after: int) -> None:
        super().__init__(message)
        self.retry_after = retry_after
