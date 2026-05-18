from __future__ import annotations

import json
from pathlib import Path
from typing import Any

_STORE_PATH = Path(__file__).resolve().parent.parent / "data" / "integrations.json"


def _ensure_parent() -> None:
  _STORE_PATH.parent.mkdir(parents=True, exist_ok=True)


def _read_json(path: Path) -> dict[str, Any]:
  try:
    raw = path.read_text(encoding="utf-8")
  except FileNotFoundError:
    return {}

  try:
    data = json.loads(raw)
  except json.JSONDecodeError:
    return {}

  return data if isinstance(data, dict) else {}


def load_integrations() -> dict[str, Any]:
  _ensure_parent()
  return _read_json(_STORE_PATH)


def save_integrations(data: dict[str, Any]) -> None:
  _ensure_parent()
  tmp = _STORE_PATH.with_suffix(".tmp")
  tmp.write_text(
    json.dumps(data, ensure_ascii=False, indent=2, sort_keys=True),
    encoding="utf-8",
  )
  tmp.replace(_STORE_PATH)


def list_integrations() -> dict[str, Any]:
  return load_integrations()


def get_integration(provider: str) -> dict[str, Any] | None:
  return load_integrations().get(provider)


def upsert_integration(provider: str, token: dict[str, Any], email_address: str | None = None) -> None:
  data = load_integrations()
  data[provider] = {"token": token, "email_address": email_address}
  save_integrations(data)
