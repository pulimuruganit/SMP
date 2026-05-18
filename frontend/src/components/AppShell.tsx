"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";

import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import {
  getViewModeServerSnapshot,
  getViewModeSnapshot,
  setViewMode,
  subscribeViewMode,
} from "@/lib/viewMode";

function pageMeta(pathname: string): { title: string; subtitle: string } {
  if (pathname === "/inbox") {
    return { title: "Inbox Insights", subtitle: "Triage, sentiment, and priorities." };
  }
  if (pathname === "/payments") {
    return { title: "Payments", subtitle: "Incoming, outgoing, and upcoming dues." };
  }
  if (pathname === "/follow-ups") {
    return { title: "Follow Ups", subtitle: "Track reminders and outstanding actions." };
  }
  if (pathname === "/customers") {
    return { title: "Customers", subtitle: "Accounts, relationships, and activity." };
  }
  if (pathname === "/projects") {
    return { title: "Projects", subtitle: "Delivery status, blockers, and next steps." };
  }
  if (pathname === "/team") {
    return { title: "Team", subtitle: "Workloads and visibility across the team." };
  }
  if (pathname === "/reports") {
    return { title: "Reports", subtitle: "Performance, trends, and summaries." };
  }
  if (pathname === "/settings") {
    return { title: "Settings", subtitle: "Preferences, integrations, and security." };
  }
  return { title: "Dashboard", subtitle: "A clear overview of what matters today." };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const viewMode = useSyncExternalStore(
    subscribeViewMode,
    getViewModeSnapshot,
    getViewModeServerSnapshot,
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const brand = useMemo(() => {
    if (viewMode === "command") return { name: "NEXVO", sub: "AI Copilot" };
    if (viewMode === "smart") return { name: "ZENTA", sub: "AI Copilot" };
    return { name: "VYORA", sub: "AI Copilot" };
  }, [viewMode]);

  const meta = useMemo(() => pageMeta(pathname), [pathname]);
  const isDashboard = pathname === "/";

  return (
    <div className="flex min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <div className="flex flex-1 min-h-0" data-view={viewMode}>
        <Sidebar
          brand={brand}
          mobileOpen={mobileNavOpen}
          onMobileClose={() => setMobileNavOpen(false)}
        />
        <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
          <div className="w-full px-4 py-5 md:px-6 md:py-6 2xl:px-10">
            <Topbar
              greetingName="Arjun"
              title={isDashboard ? undefined : meta.title}
              subtitle={isDashboard ? undefined : meta.subtitle}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onMenuClick={() => setMobileNavOpen(true)}
            />
            <div className="mt-5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
