"use client";

import { useMemo, useState } from "react";
import { MailPlus, RotateCcw } from "lucide-react";

import { cn } from "@/lib/cn";
import { sendEmail } from "@/lib/api";

import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

type Provider = "gmail" | "outlook";

function defaultSubject(businessName: string) {
  return `Quick favor? Leave a review for ${businessName}`;
}

function defaultBody(businessName: string, reviewLink: string) {
  const link = reviewLink.trim() || "https://example.com/review";
  return `Hi there,

Thanks for choosing ${businessName}.

If you have 30 seconds, could you leave us a quick review here?
${link}

It really helps a lot.

Thank you,
${businessName} Team`;
}

export function SendReviewEmailCard() {
  const [provider, setProvider] = useState<Provider>("gmail");
  const [businessName, setBusinessName] = useState("SMB AI Assistant");
  const [reviewLink, setReviewLink] = useState("");
  const [to, setTo] = useState("");

  const template = useMemo(() => {
    return {
      subject: defaultSubject(businessName.trim() || "our team"),
      body: defaultBody(businessName.trim() || "our team", reviewLink),
    };
  }, [businessName, reviewLink]);

  const [subject, setSubject] = useState(template.subject);
  const [body, setBody] = useState(template.body);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function resetTemplate() {
    setSubject(template.subject);
    setBody(template.body);
  }

  async function handleSend() {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      await sendEmail(provider, {
        to: to.trim(),
        subject: subject.trim(),
        body: body.trim(),
      });
      setSuccess("Email sent.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to send email.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="lg:col-span-2">
      <CardHeader className="flex flex-row items-start justify-between gap-3">
        <div>
          <CardTitle>Review Request Email</CardTitle>
          <div className="text-xs text-[var(--muted-foreground)]">
            Send a review request using your connected Gmail/Outlook integration.
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={resetTemplate} disabled={busy}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </CardHeader>

      <CardContent className="space-y-3">
        {error ? (
          <div className="rounded-xl border border-[color:rgba(239,68,68,0.25)] bg-[color:rgba(239,68,68,0.08)] p-3 text-xs text-[var(--danger)]">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="rounded-xl border border-[color:rgba(34,197,94,0.22)] bg-[color:rgba(34,197,94,0.10)] p-3 text-xs text-[var(--success)]">
            {success}
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">Provider</div>
            <div className="flex items-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-1">
              {(["gmail", "outlook"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProvider(p)}
                  className={cn(
                    "h-9 flex-1 rounded-xl px-3 text-sm font-semibold transition",
                    p === provider
                      ? "bg-[var(--muted)] text-[var(--foreground)]"
                      : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                  )}
                >
                  {p === "gmail" ? "Gmail" : "Outlook"}
                </button>
              ))}
            </div>
            <div className="text-[11px] text-[var(--muted-foreground)]">
              Connect the provider in “Email Integrations” first.
            </div>
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">To</div>
            <Input
              type="email"
              placeholder="customer@example.com"
              value={to}
              onChange={(e) => setTo(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">Business Name</div>
            <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
          </div>

          <div className="space-y-2">
            <div className="text-xs font-semibold text-[var(--muted-foreground)]">Review Link</div>
            <Input
              placeholder="https://g.page/your-business/review"
              value={reviewLink}
              onChange={(e) => setReviewLink(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">Subject</div>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-semibold text-[var(--muted-foreground)]">Body</div>
          <textarea
            className="min-h-[140px] w-full resize-none rounded-xl border border-[color:var(--border)] bg-[var(--surface)] p-3 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]"
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </div>

        <Button
          variant="primary"
          size="md"
          className="w-full"
          onClick={handleSend}
          disabled={busy || !to.trim() || !subject.trim() || !body.trim()}
        >
          <MailPlus className="h-4 w-4" />
          {busy ? "Sending…" : "Send Review Email"}
        </Button>
      </CardContent>
    </Card>
  );
}

