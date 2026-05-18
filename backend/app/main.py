from __future__ import annotations

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
import os

from .routers import assistant, dashboard, integrations, payments

load_dotenv()

app = FastAPI(title="SMB AI Copilot API", version="0.1.0")

def _allowed_origins() -> list[str]:
  origins = {
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://192.168.1.3:3000",
  }

  frontend_url = os.getenv("FRONTEND_URL", "").strip().rstrip("/")
  if frontend_url:
    origins.add(frontend_url)

  extra = os.getenv("CORS_ALLOW_ORIGINS", "").strip()
  if extra:
    for item in extra.split(","):
      value = item.strip().rstrip("/")
      if value:
        origins.add(value)

  return sorted(origins)

app.add_middleware(
  CORSMiddleware,
  allow_origins=_allowed_origins(),
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

app.include_router(dashboard.router, prefix="/api")
app.include_router(assistant.router, prefix="/api")
app.include_router(integrations.router, prefix="/api")
app.include_router(payments.router, prefix="/api")


@app.get("/health")
def health() -> dict[str, str]:
  return {"status": "ok"}


@app.get("/", include_in_schema=False)
def root():
  return RedirectResponse(url="/docs")
