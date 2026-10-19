import type { ReactNode } from "react";
import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import { ThemeProvider } from "@syn/ui/providers/theme-provider";
import { Sidebar } from "../components/shell/sidebar";
import "./globals.css";

/** The interface family; `preset.css` reads it as `--font-public-sans`. */
const publicSans = Public_Sans({
  subsets: ["latin"],
  variable: "--font-public-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Docs · Synapse",
    template: "%s · Synapse Docs",
  },
  icons: { icon: [{ url: "/icon-192.png", type: "image/png" }] },
  description:
    "Synapse's docs and specs, rendered from the root docs/ and specs/ for reading.",
};

/** Two columns: a full-height sidebar panel that scrolls on its own, and the page body. */
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={publicSans.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="md:flex">
            <aside className="border-b border-sidebar-border bg-sidebar text-sidebar-foreground md:sticky md:top-0 md:h-dvh md:w-72 md:shrink-0 md:overflow-y-auto md:border-r md:border-b-0">
              <Sidebar />
            </aside>
            <main className="min-w-0 flex-1 px-4 py-8 md:px-12 md:py-10">
              <div className="mx-auto max-w-5xl">{children}</div>
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
