import { CurrentWeek } from "./_components/current-week";

/**
 * WK-01 Week build, on the current week.
 *
 * IT RESOLVES WITHOUT REDIRECTING (SET-6). `/settings/week` is the address a
 * person keeps; sending them to `/settings/week/2026-W37` would make Monday's
 * bookmark point at last week for the rest of the year.
 *
 * WHICH WEEK IT IS depends on the person's own close time, which only the
 * server knows, so the resolution happens in a client leaf that asks.
 */
export default function SettingsWeekPage() {
  return <CurrentWeek />;
}
