"""Test fixtures for the Planning service.

Uses aiosqlite (in-memory SQLite) so tests run without a real PostgreSQL instance.
Each test gets a fresh in-memory database with the schema applied.

verify_token is monkeypatched via app.dependency_overrides.
Catalog HTTP calls (weekflag_reader, search) are patched per-test with unittest.mock.
"""

from __future__ import annotations

import os
import sys
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Planning package root → add to sys.path
_PLANNING_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _PLANNING_ROOT not in sys.path:
    sys.path.insert(0, _PLANNING_ROOT)

from db.models import Base  # noqa: E402


@pytest_asyncio.fixture()
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Fresh in-memory SQLite engine per test."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture()
async def db(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Single AsyncSession backed by the test engine."""
    factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)
    async with factory() as session:
        yield session


def make_client(
    test_engine: AsyncEngine,
    user_payload: dict[str, Any] | None = None,
) -> AsyncClient:
    """Build an HTTPX test client with DB and auth overrides."""
    from auth_middleware import verify_token
    from db.engine import get_db
    from main import app

    _payload: dict[str, Any] = user_payload or {
        "account_id": 1,
        "email": "test@example.com",
        "role": "user",
    }

    factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    async def _override_verify_token() -> dict[str, Any]:
        return _payload

    app.dependency_overrides[get_db] = _override_get_db
    app.dependency_overrides[verify_token] = _override_verify_token

    return AsyncClient(transport=ASGITransport(app=app), base_url="http://test")


@pytest_asyncio.fixture()
async def client(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """Authenticated test client (account_id=1)."""
    from auth_middleware import verify_token
    from db.engine import get_db
    from main import app

    async with make_client(test_engine) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides.pop(verify_token, None)


@pytest_asyncio.fixture()
async def client_user2(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """Authenticated test client for user 2 (account_id=2)."""
    from auth_middleware import verify_token
    from db.engine import get_db
    from main import app

    async with make_client(
        test_engine, {"account_id": 2, "email": "user2@example.com", "role": "user"}
    ) as c:
        yield c
    app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides.pop(verify_token, None)


@pytest_asyncio.fixture()
async def anon_client(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """Unauthenticated test client."""
    from db.engine import get_db
    from main import app

    factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
        yield c
    app.dependency_overrides.pop(get_db, None)


# ---------------------------------------------------------------------------
# Shared payloads
# ---------------------------------------------------------------------------

ASSIGNMENT_PAYLOAD: dict[str, Any] = {
    "product_id": 1,
    "product_name": "Rolled Oats",
    "date": "2026-06-29",  # Monday of week 2026-27
    "meal_slot": "breakfast",
    "quantity": 1.5,
    "unit": "cup",
    "nutrition": {
        "kcal": 350.0,
        "protein_g": 12.0,
        "fat_g": 6.0,
        "carbs_g": 60.0,
    },
}


@pytest.fixture()
def assignment_payload() -> dict[str, Any]:
    import copy
    return copy.deepcopy(ASSIGNMENT_PAYLOAD)
