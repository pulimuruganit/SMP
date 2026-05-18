from __future__ import annotations

import base64
from datetime import UTC, datetime

import requests

_GMAIL_PROFILE_URL = "https://www.googleapis.com/gmail/v1/users/me/profile"
_GMAIL_LIST_URL = "https://www.googleapis.com/gmail/v1/users/me/messages"
_GMAIL_SEND_URL = "https://www.googleapis.com/gmail/v1/users/me/messages/send"


def fetch_profile_email(access_token: str) -> str | None:
  res = requests.get(
    _GMAIL_PROFILE_URL,
    headers={"authorization": f"Bearer {access_token}"},
    timeout=30,
  )
  if not res.ok:
    return None
  data = res.json()
  return data.get("emailAddress")


def sync_gmail(access_token: str, max_results: int = 25, query: str | None = None) -> list[dict]:
  if max_results <= 0:
    return []

  auth_headers = {"authorization": f"Bearer {access_token}"}
  messages: list[dict] = []
  page_token: str | None = None

  while len(messages) < max_results:
    remaining = max_results - len(messages)
    page_size = min(500, remaining)

    params: dict[str, str] = {"maxResults": str(page_size)}
    if query:
      params["q"] = query
    if page_token:
      params["pageToken"] = page_token

    res = requests.get(
      _GMAIL_LIST_URL,
      headers=auth_headers,
      params=params,
      timeout=30,
    )
    if not res.ok:
      raise RuntimeError(f"Gmail list failed ({res.status_code}): {res.text}")

    data = res.json()
    ids = [m.get("id") for m in (data.get("messages") or []) if m.get("id")]
    if not ids:
      break

    for message_id in ids:
      if len(messages) >= max_results:
        break

      detail = requests.get(
        f"{_GMAIL_LIST_URL}/{message_id}",
        headers=auth_headers,
        params={
          "format": "metadata",
          "metadataHeaders": ["From", "Subject"],
        },
        timeout=30,
      )
      if not detail.ok:
        continue
      msg = detail.json()

      headers = {
        str(h.get("name") or "").lower(): str(h.get("value") or "")
        for h in (msg.get("payload") or {}).get("headers") or []
        if isinstance(h, dict)
      }

      internal_ms = int(msg.get("internalDate") or 0)
      received_at = (
        datetime.fromtimestamp(internal_ms / 1000.0, tz=UTC).isoformat() if internal_ms else ""
      )

      messages.append(
        {
          "id": message_id,
          "from": headers.get("from") or "",
          "subject": headers.get("subject") or "",
          "received_at": received_at,
          "snippet": msg.get("snippet") or "",
        }
      )

    page_token = data.get("nextPageToken")
    if not page_token:
      break

  return messages


def send_email(
  access_token: str,
  to: str,
  subject: str,
  body: str,
  cc: list[str] | None = None,
) -> None:
  from email.message import EmailMessage
  from email.utils import formatdate, make_msgid

  msg = EmailMessage()
  from_email = fetch_profile_email(access_token)
  if not from_email:
    raise RuntimeError("Failed to determine Gmail sender address.")
  msg["From"] = from_email
  msg["To"] = to
  msg["Subject"] = subject
  msg["Date"] = formatdate(localtime=True)
  msg["Message-ID"] = make_msgid()
  if cc:
    msg["Cc"] = ", ".join(cc)
  msg.set_content(body)

  raw_bytes = base64.urlsafe_b64encode(msg.as_bytes()).decode("utf-8")

  res = requests.post(
    _GMAIL_SEND_URL,
    headers={
      "authorization": f"Bearer {access_token}",
      "content-type": "application/json",
    },
    json={"raw": raw_bytes},
    timeout=30,
  )
  if not res.ok:
    raise RuntimeError(f"Failed to send email ({res.status_code}): {res.text}")
