"use client";

import { usePathname } from "next/navigation";
import * as React from "react";

import { ScreenFrame } from "@syn/ui";
import { cn } from "@syn/ui/cn";

import { tabForPath } from "@/app/(shell)/_components/nav-items";
import { useShell } from "@/app/(shell)/_components/shell-context";
import { useScrollMemory } from "@/lib/hooks/use-scroll-memory";

import { ShellStatusLine } from "./shell-status-line";

/**
 * The structure of one signed-in page: header, then the status line, then the
 * content.
 *
 * WHY `main` IS HERE AND NOT IN `AppShell`. A `<header>` is only a `banner`
 * landmark while it is NOT inside `main` — and `AppShell` renders its children
 * inside `main`, so a header rendered by a page from there would be a header
 * with no landmark at all. Putting `main` in the frame keeps the three
 * landmarks in the relationship cross-cutting §3.4 describes: banner, then a
 * complementary status region, then main. The skip link stays in `AppShell`,
 * first in the DOM, and still targets `#main`.
 *
 * THE CONSEQUENCE, STATED: every `(shell)` page must render a `PageFrame`, or
 * it has no `main` and the skip link points at nothing. That is already the
 * rule — the frame is where the header, the one `h1`, and the status line come
 * from — but it is a rule with teeth now.
 *
 * FOCUS ON A TAB SWITCH moves to the new page's `h1` (§3.4). It moves ONLY on
 * a pathname change: opening a sheet or closing one changes the query string,
 * and yanking focus to the title when someone dismisses a sheet would undo
 * Radix's focus restoration and lose their place.
 */
export interface PageFrameProps {
  /** An `<AppHeader/>`. It owns the screen's single `h1`. */
  header: React.ReactNode;
  /**
   * The day this page is about, `YYYY-MM-DD` — only day routes pass it. It
   * scopes the late offer's dismissal; everything else defaults to the shell's
   * today key, which the status line already knows.
   */
  dayKey?: string;
  /** `board` — no cap, Workflow's board only (FLO-6, TD-44). */
  contentWidth?: "text" | "canvas" | "board";
  children: React.ReactNode;
}

export function PageFrame({
  header,
  dayKey,
  contentWidth = "text",
  children,
}: PageFrameProps) {
  const pathname = usePathname();
  const { sheetOpen } = useShell();
  const frameRef = React.useRef<HTMLDivElement>(null);
  const firstRender = React.useRef(true);

  // Per tab, not per route: `/day/2026-09-04` and `/today` are the same peer,
  // and a person switching to Review and back expects their place kept.
  useScrollMemory(tabForPath(pathname));

  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    // The header's title carries tabIndex={-1} so it can receive focus without
    // joining the tab order.
    frameRef.current?.querySelector<HTMLElement>("h1")?.focus();
  }, [pathname]);

  return (
    <div ref={frameRef} className="flex min-h-0 w-full flex-col">
      {header}

      {/*
       * A complementary landmark around the live region: the line is about the
       * app rather than about this page's content, and it must not be read as
       * part of it.
       */}
      <aside aria-label="App status">
        <ShellStatusLine dayKey={dayKey} />
      </aside>

      <main
        id="main"
        aria-hidden={sheetOpen || undefined}
        className={cn(
          "flex-1",
          // Clear of the fixed tab bar on compact; the rail needs no room.
          "pb-[calc(var(--tabbar-h)+env(safe-area-inset-bottom))] wide:pb-0",
        )}
      >
        <ScreenFrame width={contentWidth}>{children}</ScreenFrame>
      </main>
    </div>
  );
}
