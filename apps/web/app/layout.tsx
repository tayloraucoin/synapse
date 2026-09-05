import type { Metadata, Viewport } from "next";
import { Geist, Newsreader } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";

import { ThemeProvider, Toaster } from "@syn/ui";

import { TrpcProvider } from "@/lib/trpc/provider";

import "./globals.css";

/**
 * Two families, each with one job (official spec §9.4). Geist is the
 * interface; Newsreader is the reflective surfaces only — the Day Review
 * header, the Week Review header, the adherence sentence. `next/font` self-
 * hosts both at build time, so there is no network request for a font and no
 * flash of unstyled text.
 */
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const newsreader = Newsreader({
  subsets: ["latin"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Synapse",
  description:
    "A private daily list. Habits, tasks, appointments, and deep work in one place, closed honestly each night.",
  appleWebApp: {
    capable: true,
    title: "Synapse",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  // The media-query form, so the browser chrome follows the theme rather than
  // being pinned to whichever one was rendered first.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAFAF8" },
    { media: "(prefers-color-scheme: dark)", color: "#151412" },
  ],
  // The PWA runs edge to edge; the safe-area utilities keep content off the
  // notch and the home indicator.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    /*
     * `suppressHydrationWarning` on <html> only: next-themes writes the theme
     * class before React hydrates, so the server markup and the first client
     * markup legitimately differ by that one attribute. Putting it anywhere
     * else would suppress a real mismatch.
     */
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geist.variable} ${newsreader.variable}`}
    >
      <body className="bg-paper text-ink min-h-screen-safe">
        <ThemeProvider>
          <NuqsAdapter>
            <TrpcProvider>{children}</TrpcProvider>
          </NuqsAdapter>
          <Toaster />
        </ThemeProvider>
        {/* ServiceWorkerRegistration mounts here — INF-9. */}
      </body>
    </html>
  );
}
