"""Test fixtures for the Catalog service.

Uses aiosqlite (in-memory SQLite) so tests run without a real PostgreSQL instance.
Each test gets a fresh in-memory database with the schema applied.

The verify_token dependency is monkeypatched via app.dependency_overrides to avoid
needing the Identity service running during tests.
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

# Catalog package is the root dir — add it to sys.path
_CATALOG_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _CATALOG_ROOT not in sys.path:
    sys.path.insert(0, _CATALOG_ROOT)

from db.models import Base  # noqa: E402


@pytest_asyncio.fixture()
async def test_engine() -> AsyncGenerator[AsyncEngine, None]:
    """Create a fresh in-memory SQLite engine for each test."""
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await engine.dispose()


@pytest_asyncio.fixture()
async def db(test_engine: AsyncEngine) -> AsyncGenerator[AsyncSession, None]:
    """Provide a single AsyncSession backed by the test engine."""
    factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)
    async with factory() as session:
        yield session


def make_client(
    test_engine: AsyncEngine,
    user_payload: dict[str, Any] | None = None,
) -> AsyncClient:
    """Build an HTTPX test client with DB and auth overrides.

    user_payload: what verify_token should return (default: account_id=1, role=user).
    """
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
    # Clean up overrides
    app.dependency_overrides.pop(get_db, None)
    app.dependency_overrides.pop(verify_token, None)


@pytest_asyncio.fixture()
async def client_user2(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """Authenticated test client for a second user (account_id=2)."""
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
    """Unauthenticated test client — no verify_token override."""
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


# Shared helper: standard product payload
PRODUCT_PAYLOAD: dict[str, Any] = {
    "name": "Chicken Breast",
    "category": "Meat",
    "diet_tags": [],
    "nutrition": {"calories": 165.0, "protein_g": 31.0, "fat_g": 3.6, "carbs_g": 0.0},
    "units": [{"unit_name": "100g", "grams_per_unit": 100.0}],
}


@pytest.fixture()
def product_payload() -> dict[str, Any]:
    import copy
    return copy.deepcopy(PRODUCT_PAYLOAD)
