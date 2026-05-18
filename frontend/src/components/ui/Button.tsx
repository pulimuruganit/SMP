import { cn } from "@/lib/cn";
import type { ButtonHTMLAttributes, PropsWithChildren } from "react";

type Variant = "primary" | "ghost";
type Size = "sm" | "md";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-95 active:opacity-90",
  ghost:
    "bg-transparent hover:bg-[var(--muted)] active:bg-[color:rgba(2,6,23,0.08)]",
};

const sizeClass: Record<Size, string> = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  children,
  ...props
}: PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: Variant;
    size?: Size;
  }
>) {
  return (
    <button
      className={cn(
        "inline-flex select-none items-center justify-center gap-2 rounded-xl font-medium outline-none ring-offset-2 transition focus-visible:ring-2 focus-visible:ring-[color:var(--ring)] disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}
