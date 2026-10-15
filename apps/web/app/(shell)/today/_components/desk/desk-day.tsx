"use client";

import { RegionRetry } from "@syn/ui";
import { weekKeyOf } from "@syn/utils";
import { DeskDayColumn } from "@/components/work";
import { useSchedule } from "@/lib/data/use-schedule";
import { useWeek } from "@/lib/data/use-week";
import { useWeekView } from "@/lib/data/use-week-view";
import { DESK_COPY as COPY } from "./copy";
import { deskColumn } from "./desk-column";

/**
 * The day column beside the desk's Today (USE-58): the shown date through
 * `useSchedule` (on `useToday`), its Up at and Lights out from the week's
 * set-up, its Fits line from the Week's view. The now line only on today:
 * `now` is null on any other date (C-USE-today-opened-day-3).
 */
export function DeskDay({
  dateKey,
  isToday,
  className,
}: {
  dateKey: string;
  isToday: boolean;
  className?: string;
}) {
  const schedule = useSchedule(dateKey);
  const weekKey = weekKeyOf(dateKey);
  const week = useWeek(weekKey);
  const { view } = useWeekView(weekKey);

  if (schedule.isError) {
    return (
      <div className={className}>
        <RegionRetry
          label={COPY.dayError}
          onRetry={() => void schedule.retry()}
        />
      </div>
    );
  }
  if (schedule.view === undefined) return <div className={className} />;

  const day = week.week?.days.find((entry) => entry.date === dateKey);
  const fits = view?.days.find((entry) => entry.dateKey === dateKey)?.fits;
  const column = deskColumn({
    schedule: schedule.view,
    bounds: day?.bounds ?? null,
    fits: fits ?? "",
    now: isToday ? schedule.now : null,
  });
  return (
    <DeskDayColumn
      {...column}
      timeZone={schedule.view.timeZone}
      className={className}
    />
  );
}
