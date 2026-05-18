"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Building2,
  FolderKanban,
  Home,
  Inbox,
  LineChart,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

const nav = [
  { label: "Home", href: "/", icon: Home },
  { label: "Inbox Insights", href: "/inbox", icon: Inbox },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Follow Ups", href: "/follow-ups", icon: Bell },
  { label: "Customers", href: "/customers", icon: Building2 },
  { label: "Projects", href: "/projects", icon: FolderKanban },
  { label: "Team", href: "/team", icon: Users },
  { label: "Reports", href: "/reports", icon: LineChart },
  { label: "Settings", href: "/settings", icon: Settings },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarContents({
  brand,
  onNavigate,
}: {
  brand: { name: string; sub: string };
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  return (
    <>
      <div className="flex items-center gap-3 px-2">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[var(--muted)]">
          <span className="text-sm font-black tracking-tight text-[var(--primary)]">
            AI
          </span>
        </div>
        <div className="leading-tight">
          <div className="text-sm font-extrabold tracking-tight">{brand.name}</div>
          <div className="text-xs text-[var(--muted-foreground)]">{brand.sub}</div>
        </div>
      </div>

      <nav className="mt-4 flex flex-col gap-1">
        {nav.map((item) => {
          const active = isActivePath(pathname, item.href);
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition",
                active
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
              )}
            >
              <item.icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}

export function Sidebar({
  brand,
  className,
  mobileOpen,
  onMobileClose,
}: {
  brand: { name: string; sub: string };
  className?: string;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}) {
  return (
    <>
      <aside
        className={cn(
          "hidden md:flex md:w-[260px] md:flex-col md:gap-5 md:border-r md:border-[color:var(--border)] md:bg-[var(--surface)] md:px-4 md:py-5",
          className,
        )}
      >
        <SidebarContents brand={brand} />
      </aside>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-[color:rgba(2,6,23,0.35)]"
            onClick={onMobileClose}
          />
          <aside className="absolute left-0 top-0 h-full w-[280px] border-r border-[color:var(--border)] bg-[var(--surface)] px-4 py-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <SidebarContents brand={brand} onNavigate={onMobileClose} />
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-9 px-0"
                onClick={onMobileClose}
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </aside>
        </div>
      ) : null}
    </>
  );
}

