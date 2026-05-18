import { Download, LineChart } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const reports = [
  { name: "Weekly Cashflow", note: "Next 7 days outlook • PDF" },
  { name: "Overdue Invoices", note: "Aging + reminders • CSV" },
  { name: "Email Sentiment", note: "Last 7 days • PDF" },
];

export function ReportsPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Reports</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Generate and export summaries for your team.
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {reports.map((r) => (
            <div
              key={r.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
                  <LineChart className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{r.name}</div>
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {r.note}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Scheduled Exports</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[var(--muted-foreground)]">
          Coming next: schedule recurring reports to email or Slack.
        </CardContent>
      </Card>
    </div>
  );
}

