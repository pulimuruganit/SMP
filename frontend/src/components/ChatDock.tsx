"use client";

import { useCallback, useState } from "react";
import { Mic, Send, Sparkles } from "lucide-react";

import { apiPost } from "@/lib/api";
import type { ChatResponse } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/cn";

export function ChatDock({ className }: { className?: string }) {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);

  const send = useCallback(async () => {
    const trimmed = message.trim();
    if (!trimmed || pending) return;
    setPending(true);
    setAnswer(null);
    try {
      const res = await apiPost<ChatResponse>("/api/assistant/chat", {
        message: trimmed,
      });
      setAnswer(res.answer);
      setMessage("");
    } catch (err) {
      setAnswer(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }, [message, pending]);

  return (
    <div className={cn("w-full", className)}>
      {answer ? (
        <div className="mb-3 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--muted)]">
              <Sparkles className="h-5 w-5 text-[var(--primary)]" />
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold">Copilot</div>
              <pre className="mt-1 whitespace-pre-wrap text-sm text-[var(--muted-foreground)]">
                {answer}
              </pre>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-2 shadow-sm">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask anything about your business…"
          onKeyDown={(e) => {
            if (e.key === "Enter") void send();
          }}
          className="border-0 bg-transparent focus-visible:ring-0"
        />

        <Button variant="ghost" size="sm" aria-label="Voice input">
          <Mic className="h-4 w-4" />
        </Button>
        <Button size="sm" onClick={() => void send()} disabled={pending}>
          <Send className="h-4 w-4" />
          <span className="hidden sm:inline">{pending ? "Sending" : "Send"}</span>
        </Button>
      </div>
    </div>
  );
}
