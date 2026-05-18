"use client";

import { useEffect, useState } from "react";

import { apiBase, apiGet } from "@/lib/api";
import type { FollowUpsResponse, PrioritiesResponse } from "@/lib/types";

import { FollowUpCard } from "@/components/FollowUpCard";
import { PriorityList } from "@/components/PriorityList";
import { Skeleton } from "@/components/ui/Skeleton";

export function FollowUpsPage() {
  const [followups, setFollowups] = useState<FollowUpsResponse | null>(null);
  const [priorities, setPriorities] = useState<PrioritiesResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [f, p] = await Promise.all([
          apiGet<FollowUpsResponse>("/api/dashboard/follow-ups"),
          apiGet<PrioritiesResponse>("/api/dashboard/priorities"),
        ]);
        if (cancelled) return;
        setFollowups(f);
        setPriorities(p);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load follow ups.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-w-0">
      {error ? (
        <div className="mb-4 rounded-2xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-4 text-sm text-[var(--danger)]">
          {error} (API base: <code className="font-mono">{apiBase()}</code>)
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {followups ? <FollowUpCard data={followups} /> : <Skeleton className="h-[230px] rounded-2xl" />}
        {priorities ? <PriorityList items={priorities.items} /> : <Skeleton className="h-[360px] rounded-2xl" />}
      </div>
    </div>
  );
}
