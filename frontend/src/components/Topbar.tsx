"use client";

import { useMemo, useSyncExternalStore } from "react";
import { Bell, Menu, Moon, Sun, UserCircle2 } from "lucide-react";

import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";

export type ViewMode = "clarity" | "command" | "smart";

type Theme = "light" | "dark";

const THEME_STORAGE_KEY = "smbcopilot:theme";
const THEME_EVENT = "smbcopilot:theme";

const viewLabels: Record<ViewMode, string> = {
  clarity: "Clarity",
  command: "Command",
  smart: "Smart",
};

function computePreferredTheme(): Theme {
  try {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore
  }

  try {
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    }
  } catch {
    // ignore
  }

  return "light";
}

function readDocumentTheme(): Theme | null {
  try {
    const value = document.documentElement.dataset.theme;
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null;
  }
}

function applyTheme(theme: Theme) {
  try {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    // ignore
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new Event(THEME_EVENT));
  } catch {
    // ignore
  }
}

function subscribeTheme(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  const listener = () => callback();
  window.addEventListener("storage", listener);
  window.addEventListener(THEME_EVENT, listener);
  return () => {
    window.removeEventListener("storage", listener);
    window.removeEventListener(THEME_EVENT, listener);
  };
}

function getThemeSnapshot(): Theme {
  return readDocumentTheme() ?? computePreferredTheme();
}

export function Topbar({
  greetingName,
  title,
  subtitle,
  viewMode,
  onViewModeChange,
  onMenuClick,
}: {
  greetingName: string;
  title?: string;
  subtitle?: string;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  onMenuClick?: () => void;
}) {
  function handleViewClick(v: ViewMode) {
    onViewModeChange(v);
  }

  const computedSubtitle = useMemo(() => {
    if (viewMode === "command") return "Here’s your executive briefing for today.";
    if (viewMode === "smart") return "Let’s make it a productive day!";
    return "Here’s what matters most today.";
  }, [viewMode]);

  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, () => "light");

  function toggleTheme() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
  }

  return (
    <header className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          {title ? (
            <h1 className="truncate text-base font-semibold tracking-tight">
              {title}
            </h1>
          ) : (
            <h1 className="truncate text-base font-semibold tracking-tight">
              Good morning, {greetingName} <span aria-hidden>👋</span>
            </h1>
          )}
        </div>
        <p className="truncate text-sm text-[var(--muted-foreground)]">
          {subtitle ?? computedSubtitle}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu className="h-4 w-4" />
        </Button>

        <div className="hidden sm:flex items-center rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] p-1">
          {(["clarity", "command", "smart"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => handleViewClick(v)}
              aria-pressed={v === viewMode}
              className={cn(
                "h-9 rounded-xl px-3 text-sm font-semibold transition",
                v === viewMode
                  ? "bg-[var(--muted)] text-[var(--foreground)]"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
              )}
            >
              {viewLabels[v]}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="hidden sm:inline-flex"
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          title={theme === "dark" ? "Light theme" : "Dark theme"}
        >
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        <Button variant="ghost" size="sm" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2 rounded-2xl border border-[color:var(--border)] bg-[var(--surface)] px-2 py-1.5">
          <UserCircle2 className="h-6 w-6 text-[var(--muted-foreground)]" />
          <span className="hidden md:inline text-sm font-semibold">Arjun</span>
        </div>
      </div>
    </header>
  );
}
