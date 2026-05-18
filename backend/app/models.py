from __future__ import annotations

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, Field


PriorityLevel = Literal["high", "medium", "low"]


class Money(BaseModel):
  currency: str = Field(default="INR", examples=["INR", "USD"])
  amount: float = Field(..., ge=0)


class SummaryCard(BaseModel):
  key: str
  label: str
  value: str
  sublabel: str | None = None
  tone: Literal["neutral", "success", "warning", "danger"] = "neutral"


class SummaryResponse(BaseModel):
  greeting_name: str
  as_of: datetime
  cards: list[SummaryCard]


class PriorityItem(BaseModel):
  id: str
  title: str
  detail: str | None = None
  level: PriorityLevel = "medium"


class PrioritiesResponse(BaseModel):
  items: list[PriorityItem]


class CashFlowPoint(BaseModel):
  day: date
  incoming: float = Field(..., ge=0)
  outgoing: float = Field(..., ge=0)


class CashFlowResponse(BaseModel):
  horizon_days: int = Field(..., ge=1, le=31)
  net_expected: Money
  points: list[CashFlowPoint]


class EmailEmotionBreakdown(BaseModel):
  positive: int = Field(..., ge=0)
  neutral: int = Field(..., ge=0)
  negative: int = Field(..., ge=0)


class EmailInsightItem(BaseModel):
  id: str
  sender: str
  subject: str
  received_at: datetime
  priority: PriorityLevel = "medium"


class EmailInsightsResponse(BaseModel):
  last_days: int = Field(..., ge=1, le=30)
  total: int = Field(..., ge=0)
  breakdown: EmailEmotionBreakdown
  recent_needing_attention: list[EmailInsightItem]


class FollowUpStatus(BaseModel):
  label: str
  count: int = Field(..., ge=0)


class FollowUpsResponse(BaseModel):
  statuses: list[FollowUpStatus]


class ChatRequest(BaseModel):
  message: str = Field(..., min_length=1, max_length=2000)


class ChatResponse(BaseModel):
  answer: str
  suggested_actions: list[str] = Field(default_factory=list)

