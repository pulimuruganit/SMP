import { Building2, Search } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

const customers = [
  { name: "ABC Corp", status: "Active", note: "12 invoices • ₹2.25L outstanding" },
  { name: "Acme Solutions", status: "Active", note: "Proposal sent • awaiting approval" },
  { name: "Digital Wheel", status: "At risk", note: "2 follow-ups pending" },
  { name: "Nimbus Traders", status: "Active", note: "Paid today • ₹45k" },
];

export function CustomersPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>Find Customers</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Search by name, GSTIN, or phone.
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Search customers…" />
          <Button variant="primary" size="sm" className="w-full">
            <Search className="h-4 w-4" />
            Search
          </Button>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Recent Customers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {customers.map((c) => (
            <div
              key={c.name}
              className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--muted)]">
                  <Building2 className="h-4 w-4 text-[var(--muted-foreground)]" />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{c.name}</div>
                  <div className="truncate text-xs text-[var(--muted-foreground)]">
                    {c.note}
                  </div>
                </div>
              </div>
              <div className="text-xs font-semibold text-[var(--muted-foreground)]">
                {c.status}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

