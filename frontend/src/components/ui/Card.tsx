import { cn } from "@/lib/cn";
import type { PropsWithChildren } from "react";

export function Card({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] shadow-sm",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("p-4 pb-2", className)}>{children}</div>;
}

export function CardTitle({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <h3 className={cn("text-sm font-semibold tracking-tight", className)}>
      {children}
    </h3>
  );
}

export function CardContent({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return <div className={cn("p-4 pt-2", className)}>{children}</div>;
}
