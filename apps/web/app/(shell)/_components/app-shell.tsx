/**
 * AppShell — USE's signed-in frame (USE-4).
 *
 * BOTH NAVIGATIONS RENDER AND CSS PICKS ONE at the `split:` break (1024,
 * D-USE-93): the rail from 1024 up, the tabs below it (D-USE-74). Never
 * `useIsSplit` here: it reads false on the server, so the first paint would
 * guess the width and flash the wrong chrome.
 *
 * The skip link is first in the DOM and targets `#main`, which every page
 * renders. Below 1024 the column is padded by the tab bar's height (and the
 * safe area the bar pads itself by), so the bar never covers content.
 *
 * A focused path (`isFocusedPath`) renders with no rail and no tabs.
 */
"use client";

import { cn } from "@syn/ui";
import { usePathname } from "next/navigation";
import type * as React from "react";

import { SHELL_COPY as COPY } from "./copy";
import { isFocusedPath } from "./nav-items";
import { Rail } from "./rail";
import { TabBar } from "./tab-bar";

export interface ShellUser {
  name: string;
  imageUrl: string | null;
}

export interface AppShellProps {
  user: ShellUser;
  /** The phone's first tab word: "List" before Ready, go (day/overview.md). */
  firstTab?: "Now" | "List";
  children: React.ReactNode;
}

export function AppShell({ user, firstTab = "Now", children }: AppShellProps) {
  const pathname = usePathname();

  if (isFocusedPath(pathname)) {
    return (
      <div className="bg-background flex min-h-dvh flex-col">{children}</div>
    );
  }

  return (
    <div className="bg-background flex min-h-dvh flex-col split:flex-row">
      <a
        href="#main"
        className={cn(
          "sr-only focus:not-sr-only",
          "focus:bg-background focus:text-foreground focus:absolute focus:start-(--space-4) focus:top-(--space-4) focus:z-50",
          "focus:rounded-(--radius-control) focus:px-(--space-4) focus:py-(--space-2)",
          "focus:ring-ring focus:ring-2",
        )}
      >
        {COPY.skipLink}
      </a>

      <div className="sticky top-0 hidden h-dvh shrink-0 split:block">
        <Rail user={user} />
      </div>

      <div className="flex min-w-0 flex-1 flex-col pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] split:pb-0">
        {children}
      </div>

      <div className="split:hidden">
        <TabBar firstTab={firstTab} />
      </div>
    </div>
  );
}
