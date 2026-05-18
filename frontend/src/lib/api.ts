const DEFAULT_API_BASE = "http://localhost:8000";

export function apiBase(): string {
  const raw = process.env.NEXT_PUBLIC_API_URL?.trim();
  const base = raw && raw.length > 0 ? raw : DEFAULT_API_BASE;
  // Render users often set URLs with a trailing slash. If we don't normalize,
  // requests like `${base}/api/...` can become `//api/...` which can return 404.
  return base.replace(/\/+$/, "");
}

function buildHeaders(defaults: Record<string, string>, init?: HeadersInit): Headers {
  const headers = new Headers(defaults);
  if (init) {
    new Headers(init).forEach((value, key) => {
      headers.set(key, value);
    });
  }
  return headers;
}

function buildUrl(path: string): string {
  if (!path) return apiBase();
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBase()}${normalizedPath}`;
}

export async function apiGet<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(buildUrl(path), {
    ...init,
    // Avoid `content-type` on GET to prevent unnecessary CORS preflights.
    headers: buildHeaders({ accept: "application/json" }, init?.headers),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

export async function apiPost<TResponse>(
  path: string,
  body: unknown,
  init?: RequestInit,
): Promise<TResponse> {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    ...init,
    headers: buildHeaders(
      { accept: "application/json", "content-type": "application/json" },
      init?.headers,
    ),
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as TResponse;
}

export type SendEmailRequest = {
  to: string;
  subject: string;
  body: string;
  cc?: string[];
};


export async function sendEmail(provider: "gmail" | "outlook", data: SendEmailRequest) {
  return apiPost<{ success: boolean }>(`/api/integrations/${provider}/send`, data);
}
