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
 * A focused path (`isFocusedPath`) renders with no rail and no tabs; a
 * pushed one (`isPushedPath`, Set my days) keeps the rail and drops the tabs.
 *
 * `?sheet=` is read once, here, by `SheetHost` (USE-83), over any screen.
 */
"use client";

import type * as React from "react";
import { usePathname } from "next/navigation";
import { cn } from "@syn/ui";
import { useTodayKey } from "@/lib/data/use-morning";
import { useDayPhase } from "@/lib/data/use-now";
import { SHELL_COPY as COPY } from "./copy";
import { isFocusedPath, isPushedPath } from "./nav-items";
import { Rail } from "./rail";
import { useMarkShellPainted } from "./day-entry-gate";
import { SheetHost, SheetOpenerProvider } from "./sheet-host";
import { TabBar } from "./tab-bar";

export interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname();
  // The phone's first tab reads "List" before Ready, go, from the day record
  // (D-USE-5, USE-17); "Now" while it is read.
  const phase = useDayPhase(useTodayKey());
  const firstTab = phase === "before-go" ? "List" : "Now";
  useMarkShellPainted();
  const pushed = isPushedPath(pathname);

  if (isFocusedPath(pathname)) {
    return (
      <SheetOpenerProvider>
        <div className="bg-background flex min-h-dvh flex-col">{children}</div>
        <SheetHost />
      </SheetOpenerProvider>
    );
  }

  return (
    <SheetOpenerProvider>
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
          <Rail />
        </div>

        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col split:pb-0",
            pushed
              ? "pb-[env(safe-area-inset-bottom)]"
              : "pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))]",
          )}
        >
          {children}
        </div>

        {pushed ? null : (
          <div className="split:hidden">
            <TabBar firstTab={firstTab} />
          </div>
        )}
      </div>
      <SheetHost />
    </SheetOpenerProvider>
  );
}
