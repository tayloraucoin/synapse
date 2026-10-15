"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChecklistIcon, cn, PlanBlocksIcon, RegionRetry, Text } from "@syn/ui";
import { weekdayForDayKey } from "@syn/utils";
import {
  AllDayStrip,
  DAY_COLUMN_PX_PER_HOUR,
  DayColumn,
  DayColumnSkeleton,
  OfflineLine,
  type DayColumnBlock,
  type DayColumnEvent,
} from "@/components/planner";
import { BLOCK_HUE, type BlockHue } from "@/components/planner/block-hue";
import { DAY_COLUMN_COPY } from "@/components/planner/day-column/copy";
import { useIsOffline } from "@/lib/data/source";
import { useTodayKey } from "@/lib/data/use-morning";
import {
  useSchedule,
  type ScheduleBlockView,
  type ScheduleEvent,
} from "@/lib/data/use-schedule";
import { useScrollToNow } from "@/lib/hooks/use-scroll-to-now";
import { daysRoute, todayBlockRoute, todayReviewRoute } from "@/lib/routes";
import { NowTodosTray } from "../../_components/now/now-todos-tray";
import { SCHEDULE_COPY as COPY } from "./copy";

/** Where now sits under the top when the column scrolls to it: an hour down. */
const NOW_FROM_TOP_PX = DAY_COLUMN_PX_PER_HOUR;

/** An event's colour: a palette key, else plum (D-USE-38) [ASSUMPTION: hex reads plum]. */
function hueOf(color: string | null): BlockHue {
  const hues = new Set<string>(Object.values(BLOCK_HUE));
  return color !== null && hues.has(color) ? (color as BlockHue) : "plum";
}

function eventOf(event: ScheduleEvent, inside: boolean): DayColumnEvent {
  return {
    id: event.id,
    title: event.title,
    startsAt: event.startsAt,
    endsAt: event.endsAt,
    hue: hueOf(event.color),
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

  /** A path with this screen's query kept, so `?state=` travels. */
  const kept = (path: string) => `${path}${window.location.search}`;
  const openBlock = (id: string) => router.push(kept(todayBlockRoute(id)));

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

      {view?.empty ? <EmptyChoices dateKey={dateKey} /> : null}

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

/**
 * Nothing on the day (D-USE-77): D-USE-68's three choices under the title,
 * as Review the day's Sunday. Their flows are Review the day's tickets;
 * here they link [ASSUMPTION: a checklist is made on Review the day, blocks
 * and a copy in Set my days at this date].
 */
function EmptyChoices({ dateKey }: { dateKey: string }) {
  const words = COPY.empty;
  return (
    <section className="flex flex-col gap-(--space-3) px-(--space-4) pt-(--space-4)">
      <div className="flex flex-col gap-0.5">
        <Text as="p" variant="body" weight={600}>
          {words.title(weekdayForDayKey(dateKey))}
        </Text>
        <Text as="p" variant="body" tone="muted">
          {words.line}
        </Text>
      </div>
      <Choice
        href={todayReviewRoute()}
        icon={<ChecklistIcon aria-hidden="true" className="size-5" />}
        title={words.checklist}
        line={words.checklistLine}
        likely
      />
      <Choice
        href={daysRoute({ day: dateKey })}
        icon={<PlanBlocksIcon aria-hidden="true" className="size-5" />}
        title={words.blocks}
        line={words.blocksLine}
      />
      <Link
        href={daysRoute({ day: dateKey })}
        className="flex min-h-(--target) items-center self-start text-(length:--fs-label) font-medium text-link focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {words.copy}
      </Link>
    </section>
  );
}

function Choice({
  href,
  icon,
  title,
  line,
  likely = false,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  line: string;
  /** The likely one, outlined in ink. */
  likely?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex min-h-(--target) items-center gap-(--space-3) rounded-(--radius-control) px-(--space-3) py-(--space-3)",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        likely ? "border-2 border-foreground" : "border border-border",
      )}
    >
      {icon}
      <span className="flex min-w-0 flex-col">
        <Text as="span" variant="secondary" weight={600}>
          {title}
        </Text>
        <Text as="span" variant="caption" tone="muted">
          {line}
        </Text>
      </span>
    </Link>
  );
}
