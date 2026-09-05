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

import { NAV_ITEMS, REVIEW_DOT_LABEL, type NavTab } from "./nav-items";

/** Which tab owns a path — the List tab owns every day route. */
function tabForPath(pathname: string): NavTab {
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/review")) return "review";
  if (pathname.endsWith("/schedule")) return "schedule";
  return "list";
}

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
            <Link href={item.href}>{item.label}</Link>
          </BottomNavItem>
        ))}
      </BottomNavList>
    </BottomNav>
  );
}
