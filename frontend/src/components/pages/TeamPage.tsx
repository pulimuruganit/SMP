import { Shield, UserCircle2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

const team = [
  { name: "Arjun", role: "Owner", status: "Online" },
  { name: "Neha", role: "Operations", status: "Available" },
  { name: "Ravi", role: "Sales", status: "In a meeting" },
  { name: "Sara", role: "Finance", status: "Available" },
];

export function TeamPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Team</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Visibility into who’s working on what.
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {team.map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <UserCircle2 className="h-9 w-9 text-[var(--muted-foreground)]" />
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{m.name}</div>
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {m.role}
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[var(--muted-foreground)]">
                {m.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-[var(--muted-foreground)]">
          <div className="flex items-start gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3">
            <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
              <Shield className="h-4 w-4 text-[var(--muted-foreground)]" />
            </div>
            <div>
              <div className="text-sm font-semibold text-[var(--foreground)]">Role-based access</div>
              <div className="mt-0.5 text-xs">
                Keep sensitive data safe with least-privilege roles.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

