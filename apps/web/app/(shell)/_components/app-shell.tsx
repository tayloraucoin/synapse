/**
 * AppShell — the signed-in frame (v2 handoff §5.2).
 *
 * Adapted from CC's `(app)/layout.tsx`. The *server* layout does the auth gate
 * and the entry redirect; this is the client frame it renders into — the rail
 * on wide, the tab bar on compact, the status-line slot, and the `main`
 * landmark.
 *
 * BOTH NAVIGATIONS ARE RENDERED AND ONE IS HIDDEN BY CSS, not by
 * `useIsWide`. A JS breakpoint here would mean the first paint after
 * hydration has no navigation at all, and on a slow phone that is a visible
 * flash of a page with no way out. The `wide:` variant does it in the
 * stylesheet, before React runs.
 *
 * THE SKIP LINK IS FIRST IN THE DOM (cross-cutting §3.4) and reads *Skip to
 * today's list*, not "skip to content" — a person using it knows what they
 * want.
 *
 * `sheetOpen` dims the tab bar and hides `main` from assistive tech, so a
 * screen reader inside a sheet cannot wander back into the page underneath.
 */
"use client";

import * as React from "react";

import { cn } from "@syn/ui/cn";

import { Rail } from "./rail";
import { TabBar } from "./tab-bar";

/**
 * NO `activeTab` PROP — a divergence from the handoff's §5.2 signature.
 * `TabBar` and `Rail` both derive the active tab from `usePathname()`, and a
 * prop saying the same thing is a second source for one fact: the first route
 * that forgets to pass it, or passes the wrong one, gets a shell that
 * disagrees with the URL. The pathname is the truth.
 */
export interface AppShellProps {
  /** An `<AppHeader/>` the route owns. */
  header: React.ReactNode;
  /** The status line for this render, or null. */
  statusLine?: React.ReactNode;
  contentWidth?: "text" | "canvas";
  reviewHasPending: boolean;
  user: { name: string; imageUrl: string | null };
  /** True while a sheet owns the screen. */
  sheetOpen?: boolean;
  children: React.ReactNode;
}

export function AppShell({
  header,
  statusLine,
  contentWidth = "text",
  reviewHasPending,
  user,
  sheetOpen = false,
  children,
}: AppShellProps) {
  return (
    <div className="bg-paper flex min-h-dvh flex-col wide:flex-row">
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:bg-paper focus:text-ink focus:absolute focus:start-(--space-4) focus:top-(--space-4) focus:z-50",
          "focus:rounded-(--radius) focus:px-(--space-4) focus:py-(--space-2)",
          "focus:ring-2 focus:ring-ring",
        )}
      >
        Skip to today&rsquo;s list
      </a>

      <div className="hidden wide:block">
        <Rail reviewHasPending={reviewHasPending} user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        {statusLine}

        <main
          id="main"
          aria-hidden={sheetOpen || undefined}
          className={cn(
            "flex-1",
            "pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] wide:pb-0",
          )}
        >
          <div
            className={cn(
              "w-full",
              contentWidth === "text"
                ? "max-w-(--content-text)"
                : "max-w-(--content-canvas)",
            )}
          >
            {children}
          </div>
        </main>
      </div>

      <div className="fixed inset-x-0 bottom-0 wide:hidden">
        <TabBar reviewHasPending={reviewHasPending} dimmed={sheetOpen} />
      </div>
    </div>
  );
}
