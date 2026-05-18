"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

import { apiPost } from "@/lib/api";
import { cn } from "@/lib/cn";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type CreateOrderResponse = {
  provider: "razorpay";
  key_id: string;
  order_id: string;
  amount: number;
  currency: string;
};

type VerifyResponse = {
  verified: boolean;
};

type RazorpayCheckoutResponse = {
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  razorpay_signature?: string;
};

function parsePositiveInt(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

export function RazorpayPaymentCard() {
  const [scriptReady, setScriptReady] = useState(false);
  const [amountInr, setAmountInr] = useState("999");
  const [customerEmail, setCustomerEmail] = useState("");
  const [description, setDescription] = useState("Invoice payment");

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const amountValue = useMemo(() => parsePositiveInt(amountInr), [amountInr]);
  const canPay = scriptReady && !busy && amountValue !== null;

  async function openCheckout() {
    if (!amountValue) return;

    setBusy(true);
    setError(null);
    setStatus(null);

    try {
      const order = await apiPost<CreateOrderResponse>("/api/payments/razorpay/order", {
        amount_inr: amountValue,
        description: description.trim() || undefined,
        customer_email: customerEmail.trim() || undefined,
      });

      const RazorpayCtor = (window as unknown as { Razorpay?: unknown }).Razorpay;
      if (typeof RazorpayCtor !== "function") {
        throw new Error("Razorpay script not loaded yet. Please refresh and try again.");
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "SMB AI Assistant",
        description: description.trim() || "Payment",
        order_id: order.order_id,
        prefill: {
          email: customerEmail.trim() || undefined,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async (response: RazorpayCheckoutResponse) => {
          try {
            const verify = await apiPost<VerifyResponse>("/api/payments/razorpay/verify", {
              razorpay_order_id: response.razorpay_order_id ?? "",
              razorpay_payment_id: response.razorpay_payment_id ?? "",
              razorpay_signature: response.razorpay_signature ?? "",
            });

            setStatus(verify.verified ? "Payment verified ✅" : "Payment verification failed ❌");
          } catch (e) {
            setStatus(
              e instanceof Error
                ? `Payment received, but verification failed: ${e.message}`
                : "Payment received, but verification failed.",
            );
          }
        },
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const instance = new (RazorpayCtor as any)(options);
      instance.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment failed to start.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => setScriptReady(true)}
      />
      <CardHeader>
        <CardTitle>Collect Payment</CardTitle>
        <div className="text-xs text-[var(--muted-foreground)]">
          Razorpay Checkout (test mode supported). Create an order from your backend and pay securely.
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {error ? (
          <div className="rounded-xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-3 text-xs text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {status ? (
          <div className="rounded-xl border border-[color:rgba(34,197,94,0.22)] bg-[color:rgba(34,197,94,0.10)] p-3 text-xs text-[var(--success)]">
            {status}
          </div>
        ) : null}

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">Amount (INR)</div>
          <Input
            inputMode="numeric"
            value={amountInr}
            onChange={(e) => setAmountInr(e.target.value)}
            placeholder="e.g. 999"
          />
          <div className="text-[11px] text-[var(--muted-foreground)]">
            Amount is converted to paise automatically.
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">Customer Email</div>
            <Input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="customer@example.com"
            />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">Description</div>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Invoice payment"
            />
          </div>
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={openCheckout}
          disabled={!canPay}
        >
          <CreditCard className="h-4 w-4" />
          {busy ? "Opening Checkout…" : "Pay with Razorpay"}
        </Button>

        <div
          className={cn(
            "flex items-start gap-2 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3 text-[11px] text-[var(--muted-foreground)]",
            scriptReady ? "" : "opacity-70",
          )}
        >
          <ShieldCheck className="mt-0.5 h-4 w-4" />
          <div className="leading-relaxed">
            {scriptReady
              ? "Tip: Add your local domain to Razorpay dashboard allowed origins when going live."
              : "Loading Razorpay Checkout…"}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

