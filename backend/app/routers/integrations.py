from __future__ import annotations

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import HTMLResponse, RedirectResponse
from pydantic import BaseModel

from ..services.emails_store import insert_email, list_emails
from ..services.gmail_client import fetch_profile_email as gmail_profile_email
from ..services.gmail_client import send_email as gmail_send_email
from ..services.gmail_client import sync_gmail
from ..services.integrations_store import list_integrations, upsert_integration
from ..services.oauth_providers import (
  build_auth_url,
  exchange_code,
  frontend_url,
  get_valid_access_token,
  validate_state,
)
from ..services.outlook_client import fetch_profile_email as outlook_profile_email
from ..services.outlook_client import send_email as outlook_send_email
from ..services.outlook_client import sync_outlook

router = APIRouter(tags=["integrations"])


@router.get("/integrations")
def integrations_list():
  integrations = list_integrations()
  return {
    "providers": [
      {
        "provider": "gmail",
        "connected": "gmail" in integrations,
        "email_address": (integrations.get("gmail") or {}).get("email_address"),
      },
      {
        "provider": "outlook",
        "connected": "outlook" in integrations,
        "email_address": (integrations.get("outlook") or {}).get("email_address"),
      },
    ]
  }


@router.get("/integrations/{provider}/auth-url")
def get_integration_auth_url(provider: str):
  try:
    url = build_auth_url(provider)
  except Exception as exc:
    raise HTTPException(status_code=400, detail=str(exc))
  return {"provider": provider, "url": url}


@router.get("/integrations/{provider}/callback")
def integration_callback(provider: str, code: str, state: str):
  try:
    validate_state(provider, state)
    token = exchange_code(provider, code)

    access_token = token.get("access_token")
    if not access_token:
      raise RuntimeError("Missing access_token in token response")

    email_address = None
    if provider == "gmail":
      email_address = gmail_profile_email(str(access_token))
    elif provider == "outlook":
      email_address = outlook_profile_email(str(access_token))

    upsert_integration(provider, token, email_address=email_address)

    return RedirectResponse(f"{frontend_url()}/?integration={provider}&connected=1")
  except Exception as exc:
    return HTMLResponse(
      f"<h2>Integration failed</h2><p>{str(exc)}</p><p>You can close this window.</p>",
      status_code=400,
    )


@router.post("/integrations/{provider}/sync")
def sync_integration(
  provider: str,
  limit: int = Query(25, ge=1, le=500),
  q: str | None = None,
):
  access_token = get_valid_access_token(provider)
  if not access_token:
    raise HTTPException(status_code=400, detail=f"{provider} not connected")

  try:
    if provider == "gmail":
      messages = sync_gmail(access_token, max_results=limit, query=q)
    elif provider == "outlook":
      messages = sync_outlook(access_token, top=limit)
    else:
      raise HTTPException(status_code=404, detail="Unknown provider")
  except HTTPException:
    raise
  except Exception as exc:
    raise HTTPException(status_code=502, detail=str(exc))

  inserted = 0
  for msg in messages:
    if insert_email(provider, msg):
      inserted += 1

  return {"provider": provider, "fetched": len(messages), "inserted": inserted}


@router.get("/emails")
def get_emails(provider: str | None = None, limit: int = Query(50, ge=1, le=200)):
  return {"emails": list_emails(provider=provider, limit=limit)}


class SendEmailRequest(BaseModel):
  to: str
  subject: str
  body: str
  cc: list[str] | None = None


@router.post("/integrations/{provider}/send")
def send_email_endpoint(
  provider: str,
  payload: SendEmailRequest,
):
  access_token = get_valid_access_token(provider)
  if not access_token:
    raise HTTPException(status_code=400, detail=f"{provider} not connected")

  try:
    if provider == "gmail":
      gmail_send_email(
        access_token,
        to=payload.to,
        subject=payload.subject,
        body=payload.body,
        cc=payload.cc,
      )
    elif provider == "outlook":
      outlook_send_email(
        access_token,
        to=payload.to,
        subject=payload.subject,
        body=payload.body,
        cc=payload.cc,
      )
    else:
      raise HTTPException(status_code=404, detail="Unknown provider")
  except HTTPException:
    raise
  except Exception as exc:
    raise HTTPException(status_code=502, detail=str(exc))

  return {"success": True}

