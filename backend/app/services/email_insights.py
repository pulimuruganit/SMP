from __future__ import annotations

from datetime import UTC, datetime, timedelta

from ..models import (
  EmailEmotionBreakdown,
  EmailInsightItem,
  EmailInsightsResponse,
)
from .emails_store import list_emails

_NEGATIVE_KEYWORDS = (
  "urgent",
  "overdue",
  "failed",
  "issue",
  "problem",
  "complaint",
  "refund",
  "cancel",
  "asap",
)

_POSITIVE_KEYWORDS = (
  "thank",
  "thanks",
  "received",
  "paid",
  "confirmed",
  "approved",
  "great",
  "appreciate",
)


def _parse_iso(value: str | None) -> datetime:
  if not value:
    return datetime.fromtimestamp(0, tz=UTC)
  try:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))
  except Exception:
    return datetime.fromtimestamp(0, tz=UTC)


def _classify(text: str) -> str:
  t = text.lower()
  if any(k in t for k in _NEGATIVE_KEYWORDS):
    return "negative"
  if any(k in t for k in _POSITIVE_KEYWORDS):
    return "positive"
  return "neutral"


def _priority(text: str) -> str:
  t = text.lower()
  if any(k in t for k in ("urgent", "overdue", "asap", "immediately", "past due")):
    return "high"
  if any(k in t for k in ("invoice", "payment", "approval", "follow up", "action required", "due")):
    return "medium"
  return "low"


def compute_email_insights(last_days: int = 7) -> EmailInsightsResponse:
  now = datetime.now(tz=UTC)
  cutoff = now - timedelta(days=last_days)

  raw = list_emails(limit=500)
  emails = [e for e in raw if _parse_iso(str(e.get("received_at") or "")) >= cutoff]

  total = len(emails)
  if total == 0:
    return EmailInsightsResponse(
      last_days=last_days,
      total=0,
      breakdown=EmailEmotionBreakdown(positive=0, neutral=0, negative=0),
      recent_needing_attention=[],
    )

  counts = {"positive": 0, "neutral": 0, "negative": 0}
  for e in emails:
    text = f"{e.get('subject', '')} {e.get('snippet', '')} {e.get('from', '')}".strip()
    counts[_classify(text)] += 1

  positive_pct = round(counts["positive"] * 100 / total)
  neutral_pct = round(counts["neutral"] * 100 / total)
  negative_pct = max(0, 100 - positive_pct - neutral_pct)

  recent: list[EmailInsightItem] = []
  for e in sorted(emails, key=lambda x: _parse_iso(str(x.get("received_at") or "")), reverse=True):
    if len(recent) >= 3:
      break

    sender = str(e.get("from") or "Unknown")
    subject = str(e.get("subject") or "(no subject)")
    received_at = _parse_iso(str(e.get("received_at") or ""))
    priority = _priority(f"{subject} {e.get('snippet', '')} {sender}")

    recent.append(
      EmailInsightItem(
        id=f"{e.get('provider', 'mail')}:{e.get('id')}",
        sender=sender,
        subject=subject,
        received_at=received_at,
        priority=priority,
      )
    )

  return EmailInsightsResponse(
    last_days=last_days,
    total=total,
    breakdown=EmailEmotionBreakdown(
      positive=int(positive_pct),
      neutral=int(neutral_pct),
      negative=int(negative_pct),
    ),
    recent_needing_attention=recent,
  )
