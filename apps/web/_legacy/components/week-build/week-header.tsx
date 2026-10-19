"use client";

import { useRouter } from "next/navigation";

import { Button } from "@syn/ui";
import { weekKeyOf } from "@syn/utils";

import { ShellPageHeader } from "@/components/page-frame";
import { settingsWeekRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { WEEK_COPY as COPY } from "./copy";
import { weekRangeLabel } from "./week-canvas";
import { shiftWeek } from "./week-keys";

/**
 * WK-01's header: the week's date range, and the three ways to move between
 * weeks.
 *
 * THE THREE BUTTONS ARE NOT IN `AppHeader`'s ACTION SLOT. That slot is typed
 * as one `{ label, onClick }` — a screen's single action, *Add* or *New*. The
 * ticket asks for three ghost buttons there. Rather than widen a prop every
 * other screen depends on being singular, they render as a labelled navigation
 * row directly beneath the header, which is also where a `nav` landmark can
 * legally hold them. Logged as a deviation.
 *
 * *This week* is absent when the person is already on it, so the row never
 * offers a move that goes nowhere.
 */
export function WeekHeader({ weekKey }: { weekKey: string }) {
  const router = useRouter();
  const today = trpc.day.today.useQuery();
  // The current week is the one the person's own day key falls in — their
  // close time decides which day "now" is, so a 01:00 Monday can still be
  // Sunday's week.
  const currentWeekKey =
    today.data === undefined ? null : weekKeyOf(today.data.todayKey);
  const onCurrentWeek = currentWeekKey === weekKey;

  return (
    <>
      <ShellPageHeader title={weekRangeLabel(weekKey)} showBack />
      <nav
        aria-label="Week"
        className="flex items-center gap-(--space-2) px-(--space-4) pb-(--space-2)"
      >
        <Button
          variant="ghost"
          onClick={() => router.push(settingsWeekRoute(shiftWeek(weekKey, -1)))}
        >
          {COPY.previous}
        </Button>
        <Button
          variant="ghost"
          onClick={() => router.push(settingsWeekRoute(shiftWeek(weekKey, 1)))}
        >
          {COPY.next}
        </Button>
        {currentWeekKey === null || onCurrentWeek ? null : (
          <Button
            variant="ghost"
            onClick={() => router.push(settingsWeekRoute(currentWeekKey))}
          >
            {COPY.thisWeek}
          </Button>
        )}
      </nav>
    </>
  );
}
