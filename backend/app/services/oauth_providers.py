from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
import time
from typing import Any
from urllib.parse import urlencode

import requests

from .integrations_store import get_integration, upsert_integration

_STATE_TTL_SECONDS = 10 * 60


def _state_secret() -> bytes:
  secret = os.getenv("OAUTH_STATE_SECRET", "").strip()
  if secret:
    return secret.encode("utf-8")
  return b"dev-secret-change-me"


def _b64url_encode(raw: bytes) -> str:
  return base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")


def _b64url_decode(text: str) -> bytes:
  padding = "=" * (-len(text) % 4)
  return base64.urlsafe_b64decode(text + padding)


def mint_state(provider: str) -> str:
  payload = {
    "p": provider,
    "ts": int(time.time()),
    "n": secrets.token_urlsafe(8),
  }
  body = _b64url_encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
  sig = hmac.new(_state_secret(), body.encode("utf-8"), hashlib.sha256).digest()
  return f"{body}.{_b64url_encode(sig)}"


def validate_state(provider: str, state: str) -> None:
  parts = state.split(".", 1)
  if len(parts) != 2:
    raise ValueError("Invalid state value")

  body, sig = parts
  expected = hmac.new(_state_secret(), body.encode("utf-8"), hashlib.sha256).digest()
  if not hmac.compare_digest(_b64url_decode(sig), expected):
    raise ValueError("Invalid state signature")

  payload = json.loads(_b64url_decode(body).decode("utf-8"))
  if payload.get("p") != provider:
    raise ValueError("State/provider mismatch")

  ts = int(payload.get("ts") or 0)
  if int(time.time()) - ts > _STATE_TTL_SECONDS:
    raise ValueError("State expired")


def public_backend_url() -> str:
  return os.getenv("PUBLIC_BACKEND_URL", "http://localhost:8001").strip().rstrip("/")


def frontend_url() -> str:
  return os.getenv("FRONTEND_URL", "http://localhost:3000").strip().rstrip("/")


def _client_id(provider: str) -> str:
  env_key = "GMAIL_CLIENT_ID" if provider == "gmail" else "OUTLOOK_CLIENT_ID"
  value = os.getenv(env_key, "").strip()
  if not value:
    raise RuntimeError(f"Missing {env_key}")
  return value


def _client_secret(provider: str) -> str:
  env_key = "GMAIL_CLIENT_SECRET" if provider == "gmail" else "OUTLOOK_CLIENT_SECRET"
  value = os.getenv(env_key, "").strip()
  if not value:
    raise RuntimeError(f"Missing {env_key}")
  return value


def redirect_uri(provider: str) -> str:
  return f"{public_backend_url()}/api/integrations/{provider}/callback"


def build_auth_url(provider: str) -> str:
  if provider not in ("gmail", "outlook"):
    raise RuntimeError("Unknown provider")

  client_id = _client_id(provider)
  state = mint_state(provider)

  if provider == "gmail":
    base = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
      "client_id": client_id,
      "redirect_uri": redirect_uri(provider),
      "response_type": "code",
      "scope": "https://www.googleapis.com/auth/gmail.send https://www.googleapis.com/auth/gmail.readonly",
      "access_type": "offline",
      "prompt": "consent",
      "include_granted_scopes": "true",
      "state": state,
    }
  else:
    base = "https://login.microsoftonline.com/common/oauth2/v2.0/authorize"
    params = {
      "client_id": client_id,
      "redirect_uri": redirect_uri(provider),
      "response_type": "code",
      "response_mode": "query",
      "scope": "offline_access Mail.Read Mail.Send User.Read",
      "state": state,
    }

  return f"{base}?{urlencode(params)}"


def _token_url(provider: str) -> str:
  if provider == "gmail":
    return "https://oauth2.googleapis.com/token"
  return "https://login.microsoftonline.com/common/oauth2/v2.0/token"


def exchange_code(provider: str, code: str) -> dict[str, Any]:
  data: dict[str, str] = {
    "client_id": _client_id(provider),
    "client_secret": _client_secret(provider),
    "code": code,
    "redirect_uri": redirect_uri(provider),
    "grant_type": "authorization_code",
  }

  if provider == "outlook":
    data["scope"] = "offline_access Mail.Read Mail.Send User.Read"

  res = requests.post(_token_url(provider), data=data, timeout=30)
  payload: dict[str, Any]
  try:
    payload = res.json()
  except Exception:
    payload = {}

  if not res.ok:
    raise RuntimeError(f"Token exchange failed ({res.status_code}): {payload or res.text}")

  obtained_at = int(time.time())
  expires_in = int(payload.get("expires_in") or 3600)

  token = dict(payload)
  token["obtained_at"] = obtained_at
  token["expires_at"] = obtained_at + max(expires_in - 30, 60)
  return token


def refresh_access_token(provider: str, refresh_token: str) -> dict[str, Any]:
  data: dict[str, str] = {
    "client_id": _client_id(provider),
    "client_secret": _client_secret(provider),
    "refresh_token": refresh_token,
    "grant_type": "refresh_token",
  }

  if provider == "outlook":
    data["scope"] = "offline_access Mail.Read Mail.Send User.Read"

  res = requests.post(_token_url(provider), data=data, timeout=30)
  payload: dict[str, Any]
  try:
    payload = res.json()
  except Exception:
    payload = {}

  if not res.ok:
    raise RuntimeError(f"Token refresh failed ({res.status_code}): {payload or res.text}")

  obtained_at = int(time.time())
  expires_in = int(payload.get("expires_in") or 3600)

  token = dict(payload)
  token["obtained_at"] = obtained_at
  token["expires_at"] = obtained_at + max(expires_in - 30, 60)
  return token


def get_valid_access_token(provider: str) -> str | None:
  integration = get_integration(provider)
  if not integration:
    return None

  token = integration.get("token") or {}
  access_token = token.get("access_token")
  expires_at = int(token.get("expires_at") or 0)

  if access_token and expires_at and expires_at - int(time.time()) > 60:
    return str(access_token)

  refresh_token = token.get("refresh_token")
  if not refresh_token:
    return str(access_token) if access_token else None

  refreshed = refresh_access_token(provider, refresh_token=str(refresh_token))
  if not refreshed.get("refresh_token"):
    refreshed["refresh_token"] = refresh_token

  upsert_integration(provider, refreshed, email_address=integration.get("email_address"))
  return str(refreshed.get("access_token") or "") or None