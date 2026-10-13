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
 * `sheetOpen` dims the tab bar, so a tab under a scrim is visibly and actually
 * inert rather than a live target a stray tap can hit.
 *
 * WHAT MOVED OUT, AND WHY (SYS-1). `main`, the header slot and the status-line
 * slot used to be here; they are now `PageFrame`'s, in `components/page-frame/`.
 * A `<header>` is only a `banner` landmark while it is not inside `main`, and
 * every page's header is rendered by the page — from inside this component's
 * children, which were inside `main`. Keeping the three landmarks in the
 * relationship cross-cutting §3.4 describes meant giving the page the whole
 * column. The skip link stays here, first in the DOM, and still targets
 * `#main`, which every `PageFrame` renders.
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
  reviewHasPending: boolean;
  user: { name: string; imageUrl: string | null };
  /** True while a sheet owns the screen — dims and disables the tab bar. */
  sheetOpen?: boolean;
  /**
   * The orient frame (UX v1.1 §5.2, DYN-13): "no header, no tab bar". Paper
   * and the page alone — the rail and the tab bar are not rendered, the skip
   * link still is (the frame renders `main`).
   */
  bare?: boolean;
  /** A page, which renders its own `PageFrame` (header, status line, `main`). */
  children: React.ReactNode;
}

export function AppShell({
  reviewHasPending,
  user,
  sheetOpen = false,
  bare = false,
  children,
}: AppShellProps) {
  if (bare) {
    return (
      <div className="bg-paper flex min-h-dvh flex-col">
        <div className="flex min-w-0 flex-1 flex-col">{children}</div>
      </div>
    );
  }

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

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>

      <div className="fixed inset-x-0 bottom-0 wide:hidden">
        <TabBar reviewHasPending={reviewHasPending} dimmed={sheetOpen} />
      </div>
    </div>
  );
}
