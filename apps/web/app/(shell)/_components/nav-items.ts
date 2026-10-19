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
  daysRoute,
  isJournalPath,
  isTodayBlockPath,
  orientRoute,
  reviewRoute,
  settingsRoute,
  TODAY_BLOCK_FROM_PARAM,
  TODAY_DATE_PARAM,
  todayReadyRoute,
  todayReviewRoute,
  todayRoute,
  todayScheduleRoute,
  weekRoute,
  type TodayBlockFrom,
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
 * Today on another date (`?date=`, USE-58) belongs to the Week: the opened
 * day is planning (opened-day.md).
 */
export function tabForPath(
  pathname: string,
  search: URLSearchParams | null = null,
  fallbackFrom: TodayBlockFrom | null = null,
): ShellTab | null {
  const is = (route: string) =>
    pathname === route || pathname.startsWith(`${route}/`);
  // Block view from Schedule keeps Schedule selected (current.md).
  if (
    isTodayBlockPath(pathname) &&
    blockViewFrom(search, fallbackFrom) === "schedule"
  ) {
    return "schedule";
  }
  if (is(todayScheduleRoute())) return "schedule";
  if (is(weekRoute())) return "week";
  if (is(reviewRoute())) return "review";
  if (pathname === todayRoute() && search?.has(TODAY_DATE_PARAM)) return "week";
  if (is(todayRoute())) return "today";
  return null;
}

/** Orient, Review the day and the Ready, go welcome (USE-43; D-USE-39). */
const FOCUSED_ROUTES = [orientRoute(), todayReviewRoute(), todayReadyRoute()];

/**
 * A pushed screen (USE-39; D-USE-49): no tab bar below 1024, the rail from
 * 1024 with nothing current. Set my days and Settings (USE-85), each opened
 * from the avatar menu.
 */
export function isPushedPath(pathname: string): boolean {
  return [daysRoute(), settingsRoute()].some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

/**
 * Where a Block view was opened (USE-48): the `from` param, else the
 * scenario's (a `?state=` capture's default), else null (Now's Edit block).
 */
export function blockViewFrom(
  search: URLSearchParams | null,
  fallback: TodayBlockFrom | null = null,
): TodayBlockFrom | null {
  const from = search?.get(TODAY_BLOCK_FROM_PARAM);
  return from === "review" || from === "schedule" ? from : fallback;
}

/**
 * A focused screen renders with no rail and no tabs. Block view is focused
 * when opened from Review the day, itself focused; from Schedule and Now
 * the tabs stay (current.md) [ASSUMPTION: from Now, Now selected].
 */
export function isFocusedPath(
  pathname: string,
  search: URLSearchParams | null = null,
  fallbackFrom: TodayBlockFrom | null = null,
): boolean {
  if (isTodayBlockPath(pathname)) {
    return blockViewFrom(search, fallbackFrom) === "review";
  }
  return (
    isJournalPath(pathname) ||
    FOCUSED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`),
    )
  );
}
