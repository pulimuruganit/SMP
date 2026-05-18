"use client";

import { useEffect, useMemo, useState } from "react";

import { apiBase } from "@/lib/api";
import type { IntegrationsResponse } from "@/lib/types";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type Provider = "gmail" | "outlook";

type ProviderRow = {
  provider: Provider;
  connected: boolean;
  email_address?: string | null;
};

const labels: Record<Provider, string> = {
  gmail: "Gmail",
  outlook: "Outlook",
};

function statusClasses(connected: boolean) {
  return connected
    ? "border-[color:rgba(34,197,94,0.22)] bg-[color:rgba(34,197,94,0.10)] text-[var(--success)]"
    : "border-[color:var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)]";
}

export function EmailIntegrationsCard({ onSynced }: { onSynced?: () => void }) {
  const [data, setData] = useState<IntegrationsResponse | null>(null);
  const [busy, setBusy] = useState<Provider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const providers = useMemo<ProviderRow[]>(() => {
    const apiProviders = data?.providers ?? [];
    const byKey = new Map(apiProviders.map((p) => [p.provider, p]));
    return (["gmail", "outlook"] as Provider[]).map((p) => {
      const row = byKey.get(p);
      return {
        provider: p,
        connected: Boolean(row?.connected),
        email_address: row?.email_address ?? null,
      };
    });
  }, [data]);

  const loading = data === null && error === null;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase()}/api/integrations`, { cache: "no-store" });
        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(`API ${res.status}: ${text || res.statusText}`);
        }
        const json = (await res.json()) as IntegrationsResponse;
        if (cancelled) return;
        setData(json);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Failed to load integrations.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshKey]);

  function refresh() {
    setError(null);
    setRefreshKey((k) => k + 1);
  }

  async function connect(provider: Provider) {
    setBusy(provider);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/integrations/${provider}/auth-url`, {
        cache: "no-store",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
      const json = (await res.json()) as { url?: string };
      if (!json.url) throw new Error("Missing auth URL.");
      window.location.assign(json.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to start OAuth flow.");
      setBusy(null);
    }
  }

  async function sync(provider: Provider) {
    setBusy(provider);
    setError(null);
    try {
      const res = await fetch(`${apiBase()}/api/integrations/${provider}/sync?limit=25`, {
        method: "POST",
      });
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`API ${res.status}: ${text || res.statusText}`);
      }
      refresh();
      onSynced?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sync failed.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Email Integrations</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Connect Gmail/Outlook to pull real emails into Email Insights.
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={refresh} disabled={loading || busy !== null}>
          Refresh
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <div className="rounded-xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-3 text-xs text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {loading ? (
          <div className="text-xs text-[var(--muted-foreground)]">Loading…</div>
        ) : (
          <div className="space-y-2">
            {providers.map((p) => (
              <div
                key={p.provider}
                className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-semibold">{labels[p.provider]}</div>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusClasses(
                        p.connected,
                      )}`}
                    >
                      {p.connected ? "Connected" : "Not connected"}
                    </span>
                  </div>
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {p.email_address ? p.email_address : ""}
                  </div>
                </div>

                {p.connected ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sync(p.provider)}
                    disabled={busy !== null}
                  >
                    {busy === p.provider ? "Syncing…" : "Sync"}
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => connect(p.provider)}
                    disabled={busy !== null}
                  >
                    {busy === p.provider ? "Connecting…" : "Connect"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
