"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { RegionRetry } from "@syn/ui";
import { weekKeyOf } from "@syn/utils";
import { DeskDayColumn } from "@/components/work";
import { useBlockPanelParams } from "@/lib/data/use-block-panel";
import { useSchedule } from "@/lib/data/use-schedule";
import { useWeek } from "@/lib/data/use-week";
import { useWeekView } from "@/lib/data/use-week-view";
import { blockPanelRoute } from "@/lib/routes";
import { DESK_COPY as COPY } from "./copy";
import { deskColumn } from "./desk-column";

/**
 * The day column beside the desk's Today (USE-58): the shown date through
 * `useSchedule` (on `useToday`), its Up at and Lights out from the week's
 * set-up, its Fits line from the Week's view. The now line only on today:
 * `now` is null on any other date (C-USE-today-opened-day-3). A block
 * opens its Block panel over Today (USE-76), ringed while it is open.
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
  const { opened } = useBlockPanelParams();
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const here = search ? `${pathname}?${search}` : pathname;

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
  const blocks = column.blocks.map((block) => ({
    ...block,
    href: blockPanelRoute(here, block.id, dateKey),
    open: opened?.dateKey === dateKey && opened.blockId === block.id,
    opener: `${dateKey}:${block.id}`,
  }));
  return (
    <DeskDayColumn
      {...column}
      blocks={blocks}
      timeZone={schedule.view.timeZone}
      className={className}
    />
  );
}
