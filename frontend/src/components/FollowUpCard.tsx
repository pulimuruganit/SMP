import { CheckCircle2, Clock3, MessageSquareWarning } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import type { FollowUpsResponse } from "@/lib/types";

const icons = [CheckCircle2, Clock3, MessageSquareWarning];

export function FollowUpCard({ data }: { data: FollowUpsResponse }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Follow Up Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {data.statuses.map((s, idx) => {
          const Icon = icons[idx % icons.length];
          return (
            <div
              key={s.label}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
                  <Icon className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="text-sm font-semibold">{s.label}</div>
              </div>
              <div className="text-sm font-extrabold">{s.count}</div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
