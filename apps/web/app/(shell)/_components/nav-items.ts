/**
 * The shell's two navigations, in order (D-USE-99, D-USE-39).
 *
 * The rail at the desk is Today, Week, Schedule; the phone's tabs are Now,
 * Schedule, Review. Settings is reached through the avatar (D-USE-89), and
 * Workflow (beta) is dropped (Technical's calls). Order is fixed.
 *
 * Both lists key their items by the same `ShellTab`, so the rail's Today and
 * the phone's Now are one place under two words, and `tabForPath` answers for
 * both. Hrefs come from `lib/routes.ts`; no path string is written here.
 */
import {
  ReviewIcon,
  ScheduleIcon,
  TodayIcon,
  WeekIcon,
  type LucideIcon,
} from "@syn/ui";

import {
  isJournalPath,
  orientRoute,
  reviewRoute,
  todayReviewRoute,
  todayRoute,
  todayScheduleRoute,
  weekRoute,
} from "@/lib/routes";

export type ShellTab = "today" | "week" | "schedule" | "review";

export interface NavItem {
  tab: ShellTab;
  label: string;
  href: string;
  icon: LucideIcon;
}

export const RAIL_ITEMS: readonly NavItem[] = [
  { tab: "today", label: "Today", href: todayRoute(), icon: TodayIcon },
  { tab: "week", label: "Week", href: weekRoute(), icon: WeekIcon },
  {
    tab: "schedule",
    label: "Schedule",
    href: todayScheduleRoute(),
    icon: ScheduleIcon,
  },
];

/**
 * The phone's tabs. The first reads "Now", or "List" before Ready, go
 * (day/overview.md); `AppShell`'s `firstTab` picks the word, never the route.
 */
export function tabItems(firstTab: "Now" | "List" = "Now"): readonly NavItem[] {
  return [
    { tab: "today", label: firstTab, href: todayRoute(), icon: TodayIcon },
    {
      tab: "schedule",
      label: "Schedule",
      href: todayScheduleRoute(),
      icon: ScheduleIcon,
    },
    { tab: "review", label: "Review", href: reviewRoute(), icon: ReviewIcon },
  ];
}

export const TAB_ITEMS: readonly NavItem[] = tabItems();

/**
 * Which item owns a path, or null when none does (nothing is shaded rather
 * than the wrong thing). A prefix rule: a page under `/week` is the Week's.
 */
export function tabForPath(pathname: string): ShellTab | null {
  const is = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);
  if (is(todayScheduleRoute())) return "schedule";
  if (is(weekRoute())) return "week";
  if (is(reviewRoute())) return "review";
  if (is(todayRoute())) return "today";
  return null;
}

const FOCUSED_ROUTES = [orientRoute(), todayReviewRoute()];

/** A focused screen renders with no rail and no tabs. */
export function isFocusedPath(pathname: string): boolean {
  return (
    isJournalPath(pathname) ||
    FOCUSED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  );
}
