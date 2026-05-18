import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "SMB AI Assistant",
  description: "AI-powered insights, actionable priorities, business growth.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Script id="theme-init" strategy="beforeInteractive">
          {`
(() => {
  try {
    const key = "smbcopilot:theme";
    const stored = localStorage.getItem(key);
    const theme =
      stored === "light" || stored === "dark"
        ? stored
        : window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
  } catch {
    // ignore
  }
})();
          `}
        </Script>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
