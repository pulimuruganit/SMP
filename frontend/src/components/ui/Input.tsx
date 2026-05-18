import { cn } from "@/lib/cn";
import type { InputHTMLAttributes } from "react";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-xl border border-[color:var(--border)] bg-[var(--surface)] px-3 text-sm outline-none placeholder:text-[var(--muted-foreground)] focus-visible:ring-2 focus-visible:ring-[color:var(--ring)]",
        className,
      )}
      {...props}
    />
  );
}
