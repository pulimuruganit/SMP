"use client";

import { useEffect, useState } from "react";

import { apiBase, apiGet } from "@/lib/api";
import type {
  CashFlowResponse,
  EmailInsightsResponse,
  FollowUpsResponse,
  PrioritiesResponse,
  SummaryResponse,
} from "@/lib/types";

import { SummaryGrid } from "@/components/SummaryGrid";
import { PriorityList } from "@/components/PriorityList";
import { CashflowCard } from "@/components/CashflowCard";
import { EmailIntegrationsCard } from "@/components/EmailIntegrationsCard";
import { EmailInsightsCard } from "@/components/EmailInsightsCard";
import { FollowUpCard } from "@/components/FollowUpCard";
import { AiRecommendationCard } from "@/components/AiRecommendationCard";
import { ChatDock } from "@/components/ChatDock";
import { Skeleton } from "@/components/ui/Skeleton";

export function Dashboard() {
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [priorities, setPriorities] = useState<PrioritiesResponse | null>(null);
  const [cashflow, setCashflow] = useState<CashFlowResponse | null>(null);
  const [emails, setEmails] = useState<EmailInsightsResponse | null>(null);
  const [followups, setFollowups] = useState<FollowUpsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, p, c, e, f] = await Promise.all([
          apiGet<SummaryResponse>("/api/dashboard/summary"),
          apiGet<PrioritiesResponse>("/api/dashboard/priorities"),
          apiGet<CashFlowResponse>("/api/dashboard/cashflow?horizon_days=7"),
          apiGet<EmailInsightsResponse>("/api/dashboard/email-insights?last_days=7"),
          apiGet<FollowUpsResponse>("/api/dashboard/follow-ups"),
        ]);
        if (cancelled) return;
        setSummary(s);
        setPriorities(p);
        setCashflow(c);
        setEmails(e);
        setFollowups(f);
        setError(null);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Failed to load data.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="min-w-0">
      {error ? (
        <div className="rounded-2xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-4 text-sm text-[var(--danger)]">
          {error} (API base: <code className="font-mono">{apiBase()}</code>)
        </div>
      ) : null}

      <div className={error ? "mt-5" : ""}>
        {summary ? (
          <SummaryGrid cards={summary.cards} />
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-[84px] rounded-2xl" />
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {priorities ? (
          <PriorityList items={priorities.items} />
        ) : (
          <Skeleton className="h-[360px] rounded-2xl" />
        )}

        {cashflow ? <CashflowCard data={cashflow} /> : <Skeleton className="h-[360px] rounded-2xl" />}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="grid grid-cols-1 gap-4">
          <EmailIntegrationsCard onSynced={() => setReloadKey((k) => k + 1)} />
          {emails ? <EmailInsightsCard data={emails} /> : <Skeleton className="h-[420px] rounded-2xl" />}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {followups ? <FollowUpCard data={followups} /> : <Skeleton className="h-[230px] rounded-2xl" />}
          <AiRecommendationCard />
        </div>
      </div>

      <div className="mt-6 pb-8">
        <ChatDock />
      </div>
    </div>
  );
}
