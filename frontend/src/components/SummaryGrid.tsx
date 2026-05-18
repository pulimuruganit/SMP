import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarCheck2,
  ReceiptIndianRupee,
} from "lucide-react";
import type { ComponentType } from "react";

import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { SummaryCard } from "@/lib/types";

const iconByKey: Record<string, ComponentType<{ className?: string }>> = {
  high_priority: AlertTriangle,
  payments_in: ArrowUpRight,
  payments_out: ArrowDownRight,
  overdue_invoices: ReceiptIndianRupee,
  tasks_due: CalendarCheck2,
};

const toneRing: Record<string, string> = {
  neutral: "ring-1 ring-[color:var(--border)]",
  success: "ring-1 ring-[color:rgba(34,197,94,0.28)]",
  warning: "ring-1 ring-[color:rgba(245,158,11,0.30)]",
  danger: "ring-1 ring-[color:rgba(239,68,68,0.30)]",
};

const toneIcon: Record<string, string> = {
  neutral: "bg-[var(--muted)] text-[var(--foreground)]",
  success: "bg-[color:rgba(34,197,94,0.12)] text-[var(--success)]",
  warning: "bg-[color:rgba(245,158,11,0.12)] text-[var(--warning)]",
  danger: "bg-[color:rgba(239,68,68,0.12)] text-[var(--danger)]",
};

export function SummaryGrid({ cards }: { cards: SummaryCard[] }) {
  return (
    <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => {
        const Icon = iconByKey[c.key] ?? AlertTriangle;
        return (
          <Card key={c.key} className={cn("overflow-hidden", toneRing[c.tone])}>
            <CardContent className="flex items-center gap-3 p-4">
              <div
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-2xl",
                  toneIcon[c.tone],
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
                <div className="min-w-0">
                <div className="text-xs font-semibold text-[var(--muted-foreground)]">
                  {c.label}
                </div>
                <div className="truncate text-lg font-extrabold tracking-tight">
                  {c.value}
                </div>
                {c.sublabel ? (
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {c.sublabel}
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}
