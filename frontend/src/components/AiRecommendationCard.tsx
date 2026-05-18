import { Bot, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export function AiRecommendationCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>AI Recommendation</CardTitle>
      </CardHeader>
      <CardContent className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-semibold">
            You have 3 overdue invoices.
          </div>
          <div className="mt-1 text-sm text-[var(--muted-foreground)]">
            Would you like me to send payment reminders?
          </div>
          <div className="mt-3">
            <Button size="sm">
              <Sparkles className="h-4 w-4" />
              Send reminders
            </Button>
          </div>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--muted)]">
          <Bot className="h-6 w-6 text-[var(--primary)]" />
        </div>
      </CardContent>
    </Card>
  );
}
