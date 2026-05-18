from __future__ import annotations

import json
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

_STORE_PATH = Path(__file__).resolve().parent.parent / "data" / "emails.json"


def _ensure_parent() -> None:
  _STORE_PATH.parent.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path) -> dict[str, dict[str, Any]]:
  try:
    raw = path.read_text(encoding="utf-8")
  except FileNotFoundError:
    return {}

  try:
    data = json.loads(raw)
  except json.JSONDecodeError:
    return {}

  if not isinstance(data, dict):
    return {}

  result: dict[str, dict[str, Any]] = {}
  for k, v in data.items():
    if isinstance(k, str) and isinstance(v, dict):
      result[k] = v
  return result


def _write_json(path: Path, data: dict[str, dict[str, Any]]) -> None:
  tmp = path.with_suffix(".tmp")
  tmp.write_text(
    json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True),
    encoding="utf-8",
  )
  tmp.replace(path)


def _parse_iso(value: str | None) -> datetime:
  if not value:
    return datetime.fromtimestamp(0, tz=UTC)
  try:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
  except Exception:
    return datetime.fromtimestamp(0, tz=UTC)


def insert_email(provider: str, email: dict[str, Any]) -> bool:
  email_id = str(email.get("id") or "").strip()
  if not email_id:
    return False

  key = f"{provider}:{email_id}"

  _ensure_parent()
  data = _read_json(_STORE_PATH)
  if key in data:
    return False

  stored = dict(email)
  stored["provider"] = provider
  data[key] = stored
  _write_json(_STORE_PATH, data)
  return True


def list_emails(provider: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
  _ensure_parent()
  data = _read_json(_STORE_PATH)
  items = list(data.values())
  if provider:
    items = [e for e in items if e.get("provider") == provider]

  items.sort(key=lambda e: _parse_iso(str(e.get("received_at") or "")), reverse=True)
  return items[:limit]
