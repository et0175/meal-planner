"""FastAPI application factory for the Identity service."""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from account.router import router as account_router
from db.engine import get_engine, reset_engine
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from reset.router import router as reset_router
from session.router import router as session_router

_cors_origins = os.getenv("CORS_ORIGINS", "*").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    # Startup: engine is created lazily on first call to get_engine()
    get_engine()
    yield
    # Shutdown: dispose the engine
    engine = get_engine()
    await engine.dispose()
    reset_engine()


app = FastAPI(title="Identity Service", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(account_router)
app.include_router(reset_router)
app.include_router(session_router)


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}
