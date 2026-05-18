import { FolderKanban, TimerReset } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

const projects = [
  { name: "Website Revamp", note: "Waiting for client content", level: "medium" as const },
  { name: "Invoice Automation", note: "2 blockers • API keys pending", level: "high" as const },
  { name: "Team Dashboard", note: "On track • delivery Friday", level: "low" as const },
];

export function ProjectsPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            The AI highlights the most urgent blockers first.
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {projects.map((p) => (
            <div
              key={p.name}
              className="flex items-start justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">{p.name}</div>
                <div className="truncate text-xs text-[var(--muted-foreground)]">
                  {p.note}
                </div>
              </div>
              <Badge tone={p.level}>{p.level}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
                <TimerReset className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div className="text-sm font-semibold">Send content reminder to client</div>
            </div>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Today</span>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
                <FolderKanban className="h-4 w-4 text-[var(--muted-foreground)]" />
              </div>
              <div className="text-sm font-semibold">Review sprint priorities</div>
            </div>
            <span className="text-xs font-semibold text-[var(--muted-foreground)]">Tomorrow</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

