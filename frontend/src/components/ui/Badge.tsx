import { cn } from "@/lib/cn";
import type { PropsWithChildren } from "react";

const toneStyles: Record<string, string> = {
  high: "bg-[color:rgba(239,68,68,0.12)] text-[var(--danger)] border-[color:rgba(239,68,68,0.22)]",
  medium:
    "bg-[color:rgba(245,158,11,0.12)] text-[var(--warning)] border-[color:rgba(245,158,11,0.25)]",
  low: "bg-[color:rgba(34,197,94,0.10)] text-[var(--success)] border-[color:rgba(34,197,94,0.22)]",
};

export function Badge({
  className,
  tone = "medium",
  children,
}: PropsWithChildren<{ className?: string; tone?: "high" | "medium" | "low" }>) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold",
        toneStyles[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
