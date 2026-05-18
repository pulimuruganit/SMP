from __future__ import annotations

from datetime import UTC, date, datetime, timedelta

from .models import (
  CashFlowPoint,
  CashFlowResponse,
  EmailEmotionBreakdown,
  EmailInsightItem,
  EmailInsightsResponse,
  FollowUpsResponse,
  FollowUpStatus,
  Money,
  PrioritiesResponse,
  PriorityItem,
  SummaryCard,
  SummaryResponse,
)


def build_summary() -> SummaryResponse:
  now = datetime.now(tz=UTC)
  cards = [
    SummaryCard(
      key="high_priority",
      label="High Priority",
      value="8",
      sublabel="Action needed",
      tone="danger",
    ),
    SummaryCard(
      key="payments_in",
      label="Payments In",
      value="₹2,45,000",
      sublabel="Received today",
      tone="success",
    ),
    SummaryCard(
      key="payments_out",
      label="Payments Out",
      value="₹1,25,000",
      sublabel="Scheduled",
      tone="warning",
    ),
    SummaryCard(
      key="overdue_invoices",
      label="Overdue Invoices",
      value="12",
      sublabel="₹8,75,000",
      tone="danger",
    ),
    SummaryCard(
      key="tasks_due",
      label="Tasks Due",
      value="15",
      sublabel="Due today",
      tone="warning",
    ),
  ]
  return SummaryResponse(greeting_name="Arjun", as_of=now, cards=cards)


def build_priorities() -> PrioritiesResponse:
  return PrioritiesResponse(
    items=[
      PriorityItem(
        id="p1",
        title="3 customers waiting for your reply",
        detail="Oldest waiting time: 2 days",
        level="high",
      ),
      PriorityItem(
        id="p2",
        title='Invoice "INV-1047" overdue by 14 days',
        detail="ABC Corp • ₹2,25,000",
        level="high",
      ),
      PriorityItem(
        id="p3",
        title="Proposal pending approval",
        detail="From Acme Solutions",
        level="medium",
      ),
      PriorityItem(
        id="p4",
        title="Vendor payment due in 3 days",
        detail="Digital Wheel • ₹75,000",
        level="medium",
      ),
      PriorityItem(
        id="p5",
        title='Project "Website Revamp" is delayed',
        detail="Waiting for client content",
        level="low",
      ),
    ]
  )


def build_cashflow(horizon_days: int = 7) -> CashFlowResponse:
  start = date.today()
  points: list[CashFlowPoint] = []
  incoming = [38000, 26000, 42000, 30000, 52000, 41000, 60000]
  outgoing = [22000, 28000, 25000, 32000, 27000, 35000, 29000]
  for i in range(horizon_days):
    points.append(
      CashFlowPoint(
        day=start + timedelta(days=i),
        incoming=float(incoming[i % len(incoming)]),
        outgoing=float(outgoing[i % len(outgoing)]),
      )
    )
  net = sum(p.incoming - p.outgoing for p in points)
  return CashFlowResponse(
    horizon_days=horizon_days,
    net_expected=Money(currency="INR", amount=max(net, 0)),
    points=points,
  )


def build_email_insights(last_days: int = 7) -> EmailInsightsResponse:
  now = datetime.now(tz=UTC)
  recent = [
    EmailInsightItem(
      id="e1",
      sender="ABC Corp",
      subject="Re: Payment Update",
      received_at=now - timedelta(hours=2),
      priority="high",
    ),
    EmailInsightItem(
      id="e2",
      sender="Sunrise Pvt Ltd",
      subject="Urgent: Project Delay",
      received_at=now - timedelta(hours=6),
      priority="high",
    ),
    EmailInsightItem(
      id="e3",
      sender="Design Studio",
      subject="Approval Needed",
      received_at=now - timedelta(days=1, hours=1),
      priority="medium",
    ),
  ]
  breakdown = EmailEmotionBreakdown(positive=40, neutral=45, negative=15)
  total = breakdown.positive + breakdown.neutral + breakdown.negative
  return EmailInsightsResponse(
    last_days=last_days,
    total=total,
    breakdown=breakdown,
    recent_needing_attention=recent,
  )


def build_followups() -> FollowUpsResponse:
  return FollowUpsResponse(
    statuses=[
      FollowUpStatus(label="Requires follow up", count=18),
      FollowUpStatus(label="Waiting for reply", count=11),
      FollowUpStatus(label="No response > 48h", count=7),
    ]
  )

