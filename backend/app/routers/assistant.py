from __future__ import annotations

from fastapi import APIRouter

from ..models import ChatRequest, ChatResponse

router = APIRouter(tags=["assistant"])


@router.post("/assistant/chat", response_model=ChatResponse)
def assistant_chat(payload: ChatRequest) -> ChatResponse:
  message = payload.message.strip()
  answer = (
    "Here’s a quick snapshot based on your dashboard:\n"
    "- 3 overdue invoices and payroll due soon.\n"
    "- Two customer escalations need a response today.\n"
    "- Cashflow looks stable over the next 7 days.\n\n"
    f"You asked: “{message}”"
  )
  return ChatResponse(
    answer=answer,
    suggested_actions=[
      "Send payment reminder to ABC Corp",
      "Escalate pending proposal approval",
      "Review vendor payments due this week",
    ],
  )

