/**
 * TabBar — the phone's tabs, below 1024 (D-USE-74): Now, Schedule, Review.
 *
 * Links with `aria-current`, not a `tablist`: these are routes, and a tablist
 * would promise arrow-key switching. The current tab is ink, its icon drawn
 * heavier and its word in semibold, so it reads without colour.
 *
 * Re-tapping the active tab navigates nowhere; the screen scrolls to now
 * (USE-27; `_global/navigation.md`).
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BottomNav, BottomNavItem, BottomNavList } from "@syn/ui";
import { requestScrollToNow } from "@/lib/hooks/use-scroll-to-now";
import { SHELL_COPY as COPY } from "./copy";
import { tabForPath, tabItems } from "./nav-items";
import { useBlockViewFrom } from "./use-block-view-from";

export function TabBar({ firstTab = "Now" }: { firstTab?: "Now" | "List" }) {
  const active = tabForPath(usePathname(), null, useBlockViewFrom());

  return (
    <BottomNav aria-label={COPY.tabsLabel}>
      <BottomNavList>
        {tabItems(firstTab).map((item) => {
          const current = item.tab === active;
          const Icon = item.icon;
          return (
            <BottomNavItem
              key={item.tab}
              asChild
              active={current}
              className={current ? "font-semibold" : undefined}
            >
              <Link
                href={item.href}
                onClick={(event) => {
                  if (!current) return;
                  event.preventDefault();
                  requestScrollToNow();
                }}
              >
                <span className="flex flex-col items-center gap-(--space-1)">
                  <Icon
                    aria-hidden="true"
                    className="size-5"
                    strokeWidth={current ? 2.5 : 1.75}
                  />
                  {item.label}
                </span>
              </Link>
            </BottomNavItem>
          );
        })}
      </BottomNavList>
    </BottomNav>
  );
}
