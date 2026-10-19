"use client";

import { weekKeyOf } from "@syn/utils";
import { WeekStrip } from "@/components/work";
import { useWeekView } from "@/lib/data/use-week-view";
import { todayRoute } from "@/lib/routes";
import { DESK_COPY as COPY } from "./copy";
import { stripDays } from "./strip-days";

/**
 * The week strip over the desk's Today (USE-58): the shown date's week
 * through `useWeekView`, that date selected. A card opens its date; today's
 * opens Today itself. Nothing shows until the week reads, and a week that
 * fails leaves the strip out: Today below it stands alone [ASSUMPTION].
 */
export function DeskStrip({
  dateKey,
  todayKey,
}: {
  dateKey: string;
  todayKey: string;
}) {
  const { view, range } = useWeekView(weekKeyOf(dateKey));
  if (view === null) return <div aria-hidden="true" className="min-h-20" />;
  return (
    <WeekStrip
      days={stripDays(view)}
      selected={dateKey}
      hrefFor={(day) =>
        day === todayKey ? todayRoute() : todayRoute({ date: day })
      }
      todayWord={COPY.today}
      label={COPY.stripLabel(range)}
    />
  );
}
