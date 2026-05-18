"use client";

import { useEffect, useState } from "react";

import { apiBase, apiGet } from "@/lib/api";
import type { CashFlowResponse } from "@/lib/types";

import { CashflowCard } from "@/components/CashflowCard";
import { AiRecommendationCard } from "@/components/AiRecommendationCard";
import { RazorpayPaymentCard } from "@/components/RazorpayPaymentCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function PaymentsPage() {
  const [cashflow, setCashflow] = useState<CashFlowResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<CashFlowResponse>("/api/dashboard/cashflow?horizon_days=7");
        if (cancelled) return;
        setCashflow(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load cash flow.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {error ? (
          <div className="mb-4 rounded-2xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-4 text-sm text-[var(--danger)]">
            {error} (API base: <code className="font-mono">{apiBase()}</code>)
          </div>
        ) : null}
        {cashflow ? <CashflowCard data={cashflow} /> : <Skeleton className="h-[360px] rounded-2xl" />}
      </div>
      <div className="grid gap-4">
        <RazorpayPaymentCard />
        <AiRecommendationCard />
      </div>
    </div>
  );
}
