"use client";

import { useEffect, useState } from "react";

import { apiBase, apiGet } from "@/lib/api";
import type { EmailInsightsResponse } from "@/lib/types";

import { EmailIntegrationsCard } from "@/components/EmailIntegrationsCard";
import { EmailInsightsCard } from "@/components/EmailInsightsCard";
import { Skeleton } from "@/components/ui/Skeleton";

export function InboxPage() {
  const [insights, setInsights] = useState<EmailInsightsResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet<EmailInsightsResponse>(
          "/api/dashboard/email-insights?last_days=7",
        );
        if (cancelled) return;
        setInsights(data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load Email Insights.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <div className="grid grid-cols-1 gap-4">
        <EmailIntegrationsCard onSynced={() => setReloadKey((k) => k + 1)} />
        {error ? (
          <div className="rounded-2xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-4 text-sm text-[var(--danger)]">
            {error} (API base: <code className="font-mono">{apiBase()}</code>)
          </div>
        ) : null}
      </div>

      {insights ? <EmailInsightsCard data={insights} /> : <Skeleton className="h-[420px] rounded-2xl" />}
    </div>
  );
}
