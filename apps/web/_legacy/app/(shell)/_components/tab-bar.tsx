/**
 * TabBar — compact navigation (v2 handoff §5.2).
 *
 * The route-aware leaf over the `bottom-nav` primitive. CC's shape: a
 * `NAV_ITEMS` const and an `isActive(pathname, href)`.
 *
 * LINKS WITH `aria-current`, NOT A `tablist` (§5.2's Vesper call). The
 * cross-cutting document says `tablist` on compact; these are routes, and a
 * `tablist` would promise arrow-key switching the app does not implement.
 * `aria-current="page"` is the honest semantic and what CC ships. Cost if
 * wrong: one attribute.
 *
 * ACTIVE IS A PREFIX MATCH, not equality: `/day/2026-09-04` and
 * `/today` are both the List tab, and a person who navigated to yesterday
 * should still see where they are.
 */
"use client";

import { BottomNav, BottomNavItem, BottomNavList } from "@syn/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { dispatchScrollToNow } from "@/lib/hooks/use-scroll-memory";

import { NAV_ITEMS, REVIEW_DOT_LABEL, tabForPath } from "./nav-items";

export interface TabBarProps {
  reviewHasPending: boolean;
  /** Under a sheet's scrim: dimmed, inert, and hidden from assistive tech. */
  dimmed?: boolean;
}

export function TabBar({ reviewHasPending, dimmed = false }: TabBarProps) {
  const pathname = usePathname();
  const active = tabForPath(pathname);

  return (
    <BottomNav aria-label="Main">
      <BottomNavList>
        {NAV_ITEMS.map((item) => (
          <BottomNavItem
            key={item.tab}
            asChild
            active={item.tab === active}
            dimmed={dimmed}
            dot={item.tab === "review" && reviewHasPending}
            dotLabel={REVIEW_DOT_LABEL}
          >
            {/*
             * Re-tapping the tab you are already on scrolls to now rather than
             * navigating (Epic 2 SH-00). Navigating would rebuild the page and
             * throw away the scroll position the person is standing in — and
             * on a day route it would also move them off the day they were
             * looking at, which is not what tapping "List" means.
             */}
            <Link
              href={item.href}
              onClick={(event) => {
                if (item.tab !== active) return;
                event.preventDefault();
                dispatchScrollToNow();
              }}
            >
              {item.label}
            </Link>
          </BottomNavItem>
        ))}
      </BottomNavList>
    </BottomNav>
  );
}
