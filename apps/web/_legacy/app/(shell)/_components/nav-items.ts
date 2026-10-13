/**
 * The tabs, in order — cross-cutting §4.1, and Workflow as the fourth peer
 * after Review (Workflow UX spec v0.1 W1, §5; FLO-5). No dot on it, ever (W15).
 *
 * One list, read by both `TabBar` (compact) and `Rail` (wide), so the two
 * navigations cannot disagree about what the app contains. Hrefs come from
 * `lib/routes.ts`; no path string is written here.
 */
import {
  isWorkflowPath,
  reviewRoute,
  settingsRoute,
  todayRoute,
  todayScheduleRoute,
  workflowRoute,
} from "@/lib/routes";

export type NavTab = "list" | "schedule" | "review" | "workflow" | "settings";

export interface NavItem {
  tab: NavTab;
  label: string;
  href: string;
}

export const NAV_ITEMS: readonly NavItem[] = [
  { tab: "list", label: "List", href: todayRoute() },
  { tab: "schedule", label: "Schedule", href: todayScheduleRoute() },
  { tab: "review", label: "Review", href: reviewRoute() },
  { tab: "workflow", label: "Workflow", href: workflowRoute() },
  { tab: "settings", label: "Settings", href: settingsRoute() },
];

/** The Review dot's visually-hidden text — nav & system §11. */
export const REVIEW_DOT_LABEL = "items waiting";

/**
 * Which tab owns a path.
 *
 * ACTIVE IS A PREFIX RULE, not equality: `/day/2026-09-04` and `/today` are
 * both the List, and a person who navigated to yesterday should still see
 * where they are. `/settings/habits` is Settings for the same reason.
 *
 * One implementation, three readers — `TabBar`, `Rail`, and `PageFrame`'s
 * scroll memory. Three copies of a prefix rule is three chances for the
 * navigation, the highlight and the remembered scroll to disagree about which
 * tab a route belongs to.
 */
export function tabForPath(pathname: string): NavTab {
  // Before the schedule rule: a Workflow path is Workflow's whatever it ends in.
  if (isWorkflowPath(pathname)) return "workflow";
  if (pathname.startsWith("/settings")) return "settings";
  if (pathname.startsWith("/review")) return "review";
  if (pathname.endsWith("/schedule")) return "schedule";
  return "list";
}
