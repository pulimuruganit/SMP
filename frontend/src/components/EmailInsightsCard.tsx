import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmailEmotionDonut } from "@/components/charts/EmailEmotionDonut";
import type { EmailInsightsResponse } from "@/lib/types";

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function EmailInsightsCard({ data }: { data: EmailInsightsResponse }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Email Insights</CardTitle>
        <div className="text-xs text-[var(--muted-foreground)]">
          Last {data.last_days} days
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3">
          <EmailEmotionDonut total={data.total} breakdown={data.breakdown} />
          <div className="mt-2 space-y-1 text-xs text-[var(--muted-foreground)]">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--success)]" />
                Positive
              </span>
              <span className="font-semibold">{data.breakdown.positive}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--warning)]" />
                Neutral
              </span>
              <span className="font-semibold">{data.breakdown.neutral}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[var(--danger)]" />
                Negative
              </span>
              <span className="font-semibold">{data.breakdown.negative}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">
            Recent emails that need attention
          </div>
          {data.recent_needing_attention.map((e) => (
            <div
              key={e.id}
              className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="truncate text-sm font-semibold">{e.sender}</div>
                    <span className="text-xs text-[var(--muted-foreground)]">
                      {formatRelative(e.received_at)}
                    </span>
                  </div>
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {e.subject}
                  </div>
                </div>
                <Badge tone={e.priority}>{e.priority}</Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
