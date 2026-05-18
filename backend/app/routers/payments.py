from __future__ import annotations

import hashlib
import hmac
import os
import secrets

import requests
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

router = APIRouter(tags=["payments"])

_RAZORPAY_ORDERS_URL = "https://api.razorpay.com/v1/orders"


def _razorpay_keys() -> tuple[str, str]:
  key_id = os.getenv("RAZORPAY_KEY_ID", "").strip()
  key_secret = os.getenv("RAZORPAY_KEY_SECRET", "").strip()
  if not key_id or not key_secret:
    raise HTTPException(
      status_code=400,
      detail="Razorpay is not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in backend/.env",
    )
  return key_id, key_secret


class RazorpayCreateOrderRequest(BaseModel):
  amount_inr: int = Field(ge=1, le=10_000_000)
  description: str | None = Field(default=None, max_length=140)
  customer_email: str | None = Field(default=None, max_length=254)


class RazorpayCreateOrderResponse(BaseModel):
  provider: str
  key_id: str
  order_id: str
  amount: int
  currency: str


@router.post("/payments/razorpay/order", response_model=RazorpayCreateOrderResponse)
def razorpay_create_order(payload: RazorpayCreateOrderRequest) -> RazorpayCreateOrderResponse:
  key_id, key_secret = _razorpay_keys()
  amount_paise = int(payload.amount_inr) * 100
  receipt = f"rcpt_{secrets.token_urlsafe(8)}"

  order_payload = {
    "amount": amount_paise,
    "currency": "INR",
    "receipt": receipt,
    "notes": {
      "description": payload.description or "",
      "customer_email": payload.customer_email or "",
    },
  }

  res = requests.post(
    _RAZORPAY_ORDERS_URL,
    auth=(key_id, key_secret),
    headers={"content-type": "application/json"},
    json=order_payload,
    timeout=30,
  )
  if not res.ok:
    detail = res.text
    raise HTTPException(status_code=502, detail=f"Razorpay create order failed: {detail}")

  data = res.json()
  order_id = str(data.get("id") or "")
  if not order_id:
    raise HTTPException(status_code=502, detail="Razorpay create order failed: missing order id")

  return RazorpayCreateOrderResponse(
    provider="razorpay",
    key_id=key_id,
    order_id=order_id,
    amount=amount_paise,
    currency="INR",
  )


class RazorpayVerifyRequest(BaseModel):
  razorpay_order_id: str
  razorpay_payment_id: str
  razorpay_signature: str


class RazorpayVerifyResponse(BaseModel):
  verified: bool


@router.post("/payments/razorpay/verify", response_model=RazorpayVerifyResponse)
def razorpay_verify(payload: RazorpayVerifyRequest) -> RazorpayVerifyResponse:
  _, key_secret = _razorpay_keys()

  message = f"{payload.razorpay_order_id}|{payload.razorpay_payment_id}".encode("utf-8")
  digest = hmac.new(key_secret.encode("utf-8"), message, hashlib.sha256).hexdigest()
  verified = hmac.compare_digest(digest, payload.razorpay_signature)
  return RazorpayVerifyResponse(verified=verified)

