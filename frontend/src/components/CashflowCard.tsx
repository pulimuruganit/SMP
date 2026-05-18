import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CashFlowChart } from "@/components/charts/CashFlowChart";
import type { CashFlowResponse } from "@/lib/types";

export function CashflowCard({ data }: { data: CashFlowResponse }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle>Cash Flow Overview</CardTitle>
            <div className="text-xs text-[var(--muted-foreground)]">
              Next {data.horizon_days} days
            </div>
          </div>
          <div className="text-right">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">
              Net expected cash flow
            </div>
            <div className="text-base font-extrabold tracking-tight">
              {data.net_expected.currency} {Math.round(data.net_expected.amount).toLocaleString()}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <CashFlowChart points={data.points} />
        <div className="mt-3 flex items-center gap-4 text-xs text-[var(--muted-foreground)]">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--success)]" />
            Incoming
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[var(--danger)]" />
            Outgoing
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
