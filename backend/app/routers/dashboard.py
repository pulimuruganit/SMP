from __future__ import annotations

from fastapi import APIRouter, Query

from ..models import (
  CashFlowResponse,
  EmailInsightsResponse,
  FollowUpsResponse,
  PrioritiesResponse,
  SummaryResponse,
)
from ..sample_data import (
  build_cashflow,
  build_email_insights,
  build_followups,
  build_priorities,
  build_summary,
)
from ..services.email_insights import compute_email_insights

router = APIRouter(tags=["dashboard"])


@router.get("/dashboard/summary", response_model=SummaryResponse)
def dashboard_summary() -> SummaryResponse:
  return build_summary()


@router.get("/dashboard/priorities", response_model=PrioritiesResponse)
def dashboard_priorities() -> PrioritiesResponse:
  return build_priorities()


@router.get("/dashboard/cashflow", response_model=CashFlowResponse)
def dashboard_cashflow(
  horizon_days: int = Query(default=7, ge=1, le=31),
) -> CashFlowResponse:
  return build_cashflow(horizon_days=horizon_days)


@router.get("/dashboard/email-insights", response_model=EmailInsightsResponse)
def dashboard_email_insights(
  last_days: int = Query(default=7, ge=1, le=30),
) -> EmailInsightsResponse:
  try:
    computed = compute_email_insights(last_days=last_days)
    if computed.total > 0:
      return computed
  except Exception:
    # Fall back to sample data if email sync isn't configured yet.
    pass
  return build_email_insights(last_days=last_days)


@router.get("/dashboard/follow-ups", response_model=FollowUpsResponse)
def dashboard_followups() -> FollowUpsResponse:
  return build_followups()
