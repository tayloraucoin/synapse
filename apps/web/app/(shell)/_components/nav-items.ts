/**
 * The four tabs, in order — cross-cutting §4.1.
 *
 * One list, read by both `TabBar` (compact) and `Rail` (wide), so the two
 * navigations cannot disagree about what the app contains. Hrefs come from
 * `lib/routes.ts`; no path string is written here.
 */
import {
  reviewRoute,
  settingsRoute,
  todayRoute,
  todayScheduleRoute,
} from "@/lib/routes";

export type NavTab = "list" | "schedule" | "review" | "settings";

export interface NavItem {
  tab: NavTab;
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { tab: "list", label: "List", href: todayRoute() },
  { tab: "schedule", label: "Schedule", href: todayScheduleRoute() },
  { tab: "review", label: "Review", href: reviewRoute() },
  { tab: "settings", label: "Settings", href: settingsRoute() },
];

/** The Review dot's visually-hidden text — nav & system §11. */
export const REVIEW_DOT_LABEL = "items waiting";
