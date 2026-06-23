"""Test fixtures for the Identity service.

Uses aiosqlite (in-memory SQLite) so tests run without a real PostgreSQL instance.
Each test gets a fresh in-memory database with the schema applied.
"""

from __future__ import annotations

import os
import sys
from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

# Identity package is the root dir — add it to sys.path so imports work
_IDENTITY_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _IDENTITY_ROOT not in sys.path:
    sys.path.insert(0, _IDENTITY_ROOT)

from db.models import Base  # noqa: E402 (after sys.path setup)


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


@pytest_asyncio.fixture()
async def client(test_engine: AsyncEngine) -> AsyncGenerator[AsyncClient, None]:
    """HTTP test client with the in-memory DB wired in via dependency override."""
    # Import here to avoid circular-import issues at collection time
    from db.engine import get_db
    from main import app

    factory = async_sessionmaker(test_engine, expire_on_commit=False, class_=AsyncSession)

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with factory() as session:
            yield session

    app.dependency_overrides[get_db] = _override_get_db
    try:
        async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as c:
            yield c
    finally:
        # Always clean up overrides even on test failure
        app.dependency_overrides.pop(get_db, None)
