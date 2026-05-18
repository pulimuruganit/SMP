import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import type { PriorityItem } from "@/lib/types";

export function PriorityList({ items }: { items: PriorityItem[] }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle>AI Priority List</CardTitle>
          <a
            href="#"
            className="text-xs font-semibold text-[var(--primary)] hover:underline"
          >
            View all
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold">
                  {item.title}
                </div>
                {item.detail ? (
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {item.detail}
                  </div>
                ) : null}
              </div>
              <Badge tone={item.level}>{item.level}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
