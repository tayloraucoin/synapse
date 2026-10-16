"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { RegionRetry } from "@syn/ui";
import { weekdayForDayKey } from "@syn/utils";
import {
  AllDayStrip,
  DAY_COLUMN_PX_PER_HOUR,
  DayColumn,
  DayColumnSkeleton,
  EmptyDayChoices,
  OfflineLine,
  type DayColumnBlock,
  type DayColumnEvent,
} from "@/components/planner";
import { eventHue } from "@/components/planner/block-hue";
import { DAY_COLUMN_COPY } from "@/components/planner/day-column/copy";
import { useIsOffline } from "@/lib/data/source";
import { useTodayKey } from "@/lib/data/use-morning";
import {
  useSchedule,
  type ScheduleBlockView,
  type ScheduleEvent,
} from "@/lib/data/use-schedule";
import { useScrollToNow } from "@/lib/hooks/use-scroll-to-now";
import {
  daysRoute,
  todayBlockRoute,
  todayReviewRoute,
  withSearch,
} from "@/lib/routes";
import { NowTodosTray } from "../../_components/now/now-todos-tray";
import { SCHEDULE_COPY as COPY } from "./copy";

/** Where now sits under the top when the column scrolls to it: an hour down. */
const NOW_FROM_TOP_PX = DAY_COLUMN_PX_PER_HOUR;

function eventOf(event: ScheduleEvent, inside: boolean): DayColumnEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    hue: eventHue(event.color),
    meta: inside
      ? DAY_COLUMN_COPY.meeting(event.startsAt, event.endsAt)
      : DAY_COLUMN_COPY.eventMeta(event.startsAt, event.endsAt, event.tag),
    underWay: event.underWay,
  };
}

function columnBlock(block: ScheduleBlockView): DayColumnBlock {
  return {
    ...block,
    bands: block.bands.map((band) => eventOf(band, true)),
  };
}

/**
 * Schedule (USE-27; day/schedule/): the whole day on the phone, after Ready,
 * go and before it. Top to bottom: the offline line when there is no
 * connection; the To-dos tray, closed (D-USE-26); the All day strip on a
 * checklist day, pinned; then the day column at 96 px an hour under its own
 * scroll, with the now line at the minute and one verdigris edge (D-P02).
 * Nothing is asked here; a block or the strip opens its Block view.
 *
 * Each region loads and fails on its own (D-USE-69): the tray is USE-19's
 * own; the column is still bands while it waits and `RegionRetry` when it
 * fails, the tray live. Offline is not an error: one line, the day from the
 * phone, the line still moving.
 *
 * It opens scrolled to now, and comes back to it on a re-tap of the tab or
 * `t` (jumping, never gliding). At the desk the same column, centred at
 * `--content-text` beside the rail (D-USE-39).
 */
export function ScheduleScreen() {
  const router = useRouter();
  const dateKey = useTodayKey();
  const offline = useIsOffline();
  const query = useSchedule(dateKey);
  const { view, now } = query;
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const scrollToNow = React.useCallback(() => {
    const scroller = scrollRef.current;
    if (!scroller || !view || !now) return;
    const nowPx = ((now.atMin - view.startMin) / 60) * DAY_COLUMN_PX_PER_HOUR;
    scroller.scrollTo({ top: Math.max(0, nowPx - NOW_FROM_TOP_PX) });
  }, [view, now]);
  useScrollToNow(scrollToNow);

  // Once, when the day first arrives: the page opens at now.
  const opened = React.useRef(false);
  React.useLayoutEffect(() => {
    if (opened.current || !view) return;
    opened.current = true;
    scrollToNow();
  }, [view, scrollToNow]);

  const openBlock = (id: string) =>
    router.push(
      withSearch(todayBlockRoute(id, "schedule"), window.location.search),
    );

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-(--content-text) flex-1 flex-col">
      {offline ? <OfflineLine text={COPY.offline} /> : null}
      <NowTodosTray />

      {view?.allDay ? (
        <AllDayStrip
          name={view.allDay.name}
          rows={view.allDay.rows}
          underWay={view.allDay.underWay}
          onOpen={() => openBlock(view.allDay!.id)}
        />
      ) : null}

      {view?.empty ? (
        // D-USE-77: Review the day's three choices; the checklist is made there.
        <EmptyDayChoices
          weekday={weekdayForDayKey(dateKey)}
          checklist={{ href: todayReviewRoute() }}
          blocksHref={daysRoute({ day: dateKey })}
          copyHref={daysRoute({ day: dateKey })}
        />
      ) : null}

      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto pt-(--space-3) pb-(--space-8)"
      >
        {view !== undefined ? (
          <DayColumn
            hours={{ startMin: view.startMin, endMin: view.endMin }}
            orient={null}
            blocks={view.blocks.map(columnBlock)}
            events={view.events.map((event) => eventOf(event, false))}
            now={now}
            timeZone={view.timeZone}
            onBlock={openBlock}
          />
        ) : query.isError ? (
          <RegionRetry
            // The detail line joins when RegionRetry's `detail` lands (USE-34).
            label={COPY.dayFailed}
            onRetry={() => void query.retry()}
            className="px-(--space-4)"
          />
        ) : (
          <DayColumnSkeleton label={COPY.loading} />
        )}
      </div>
    </div>
  );
}
