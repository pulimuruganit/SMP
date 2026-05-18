import { apiBase } from "@/lib/api";

import { EmailIntegrationsCard } from "@/components/EmailIntegrationsCard";
import { SendReviewEmailCard } from "@/components/SendReviewEmailCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function SettingsPage() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <EmailIntegrationsCard />
      <SendReviewEmailCard />

      <Card>
        <CardHeader>
          <CardTitle>Environment</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Useful when configuring local development.
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex items-center justify-between gap-3 rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3">
            <div className="text-sm font-semibold">API base URL</div>
            <code className="font-mono text-xs text-[var(--muted-foreground)]">
              {apiBase()}
            </code>
          </div>
          <div className="rounded-xl border border-[color:var(--border)] bg-[var(--surface-2)] p-3 text-xs text-[var(--muted-foreground)]">
            Tip: update <code className="font-mono">NEXT_PUBLIC_API_URL</code> in{" "}
            <code className="font-mono">frontend/.env.local</code> to point to your backend.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
