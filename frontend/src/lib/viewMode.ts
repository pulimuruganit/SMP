export type ViewMode = "clarity" | "command" | "smart";

const STORAGE_KEY = "smbcopilot:view";
const VIEW_EVENT = "smbcopilot:view";

function safeViewMode(value: unknown): ViewMode | null {
  if (value === "clarity" || value === "command" || value === "smart") return value;
  return null;
}

function readViewFromLocation(): ViewMode | null {
  try {
    const params = new URLSearchParams(window.location.search);
    return safeViewMode(params.get("view"));
  } catch {
    return null;
  }
}

function readViewFromStorage(): ViewMode | null {
  try {
    return safeViewMode(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeViewToStorage(view: ViewMode) {
  try {
    window.localStorage.setItem(STORAGE_KEY, view);
  } catch {
    // ignore
  }
}

export function subscribeViewMode(callback: () => void) {
  if (typeof window === "undefined") return () => {};

  const listener = () => callback();
  window.addEventListener("popstate", listener);
  window.addEventListener("storage", listener);
  window.addEventListener(VIEW_EVENT, listener);

  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener("storage", listener);
    window.removeEventListener(VIEW_EVENT, listener);
  };
}

export function getViewModeSnapshot(): ViewMode {
  if (typeof window === "undefined") return "smart";
  return readViewFromLocation() ?? readViewFromStorage() ?? "smart";
}

export function getViewModeServerSnapshot(): ViewMode {
  return "smart";
}

export function setViewMode(next: ViewMode) {
  if (typeof window === "undefined") return;

  writeViewToStorage(next);

  try {
    const url = new URL(window.location.href);
    url.searchParams.set("view", next);
    url.hash = "";
    window.history.replaceState(null, "", url.pathname + url.search);
  } catch {
    // ignore
  }

  try {
    window.dispatchEvent(new Event(VIEW_EVENT));
  } catch {
    // ignore
  }
}

