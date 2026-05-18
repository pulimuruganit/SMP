import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-[color:rgba(148,163,184,0.22)]",
        className,
      )}
    />
  );
}

