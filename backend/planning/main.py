"""FastAPI application factory for the Meal Planning service."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

import weekflag_reader.service as wfr_svc
from auth_middleware import _identity_client
from db.engine import get_engine, reset_engine
from fastapi import FastAPI
from logplan.router import router as logplan_router
from mealplan.router import router as mealplan_router
from pdf.router import router as pdf_router
from summary.router import router as summary_router
from target.router import router as target_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: initialise the DB engine
    get_engine()
    yield
    # Shutdown: close HTTP clients and engine
    await _identity_client.aclose()
    await wfr_svc._catalog_client.aclose()
    engine = get_engine()
    await engine.dispose()
    reset_engine()


app = FastAPI(title="Meal Planning Service", lifespan=lifespan)

app.include_router(mealplan_router)
app.include_router(target_router)
app.include_router(summary_router)
app.include_router(logplan_router)
app.include_router(pdf_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
