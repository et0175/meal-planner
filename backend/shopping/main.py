"""FastAPI application factory for the Shopping List service."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import generator.catalog_client as catalog_client
import generator.planning_client as planning_client
from auth_middleware import _identity_client
from db.engine import get_engine, reset_engine
from fastapi import FastAPI
from generator.router import router as generator_router
from pdf.router import router as pdf_router
from staleness.router import router as staleness_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: initialise the DB engine
    get_engine()
    yield
    # Shutdown: close HTTP clients and engine
    await _identity_client.aclose()
    await planning_client._planning_client.aclose()
    await catalog_client._catalog_client.aclose()
    engine = get_engine()
    await engine.dispose()
    reset_engine()


app = FastAPI(title="Shopping List Service", lifespan=lifespan)

app.include_router(generator_router)
app.include_router(staleness_router)
app.include_router(pdf_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
