from __future__ import annotations

import requests

_GRAPH_ME_URL = "https://graph.microsoft.com/v1.0/me"
_GRAPH_MESSAGES_URL = "https://graph.microsoft.com/v1.0/me/messages"
_GRAPH_SEND_URL = "https://graph.microsoft.com/v1.0/me/sendMail"


def fetch_profile_email(access_token: str) -> str | None:
  res = requests.get(
    f"{_GRAPH_ME_URL}?$select=mail,userPrincipalName",
    headers={"authorization": f"Bearer {access_token}"},
    timeout=30,
  )
  if not res.ok:
    return None
  data = res.json()
  return data.get("mail") or data.get("userPrincipalName")


def sync_outlook(access_token: str, top: int = 25) -> list[dict]:
  if top <= 0:
    return []

  auth_headers = {"authorization": f"Bearer {access_token}"}
  page_size = min(50, top)
  url: str | None = (
    f"{_GRAPH_MESSAGES_URL}?$top={page_size}" \
    "&$orderby=receivedDateTime%20desc" \
    "&$select=id,subject,from,receivedDateTime,bodyPreview"
  )

  messages: list[dict] = []

  while url and len(messages) < top:
    res = requests.get(url, headers=auth_headers, timeout=30)
    if not res.ok:
      raise RuntimeError(f"Outlook sync failed ({res.status_code}): {res.text}")

    data = res.json()
    values = data.get("value") or []

    for m in values:
      if len(messages) >= top:
        break
      if not isinstance(m, dict):
        continue

      sender = (
        (((m.get("from") or {}).get("emailAddress") or {}).get("name"))
        or (((m.get("from") or {}).get("emailAddress") or {}).get("address"))
        or ""
      )

      messages.append(
        {
          "id": m.get("id") or "",
          "from": sender,
          "subject": m.get("subject") or "",
          "received_at": m.get("receivedDateTime") or "",
          "snippet": m.get("bodyPreview") or "",
        }
      )

      url = data.get("@odata.nextLink")

  return messages


def send_email(
  access_token: str,
  to: str,
  subject: str,
  body: str,
  cc: list[str] | None = None,
) -> None:
  email_data = {
    "message": {
      "subject": subject,
      "body": {"contentType": "Text", "content": body},
      "toRecipients": [{"emailAddress": {"address": to}}],
    }
  }
  if cc:
    email_data["message"]["ccRecipients"] = [
      {"emailAddress": {"address": addr}} for addr in cc
    ]

  res = requests.post(
    _GRAPH_SEND_URL,
    headers={
      "authorization": f"Bearer {access_token}",
      "content-type": "application/json",
    },
    json=email_data,
    timeout=30,
  )
  if not res.ok:
    raise RuntimeError(f"Failed to send email ({res.status_code}): {res.text}")