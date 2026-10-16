"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { WorkTier } from "@syn/types";
import {
  cn,
  NowLine,
  ScheduleAxis,
  Skeleton,
  Text,
  useDropTarget,
} from "@syn/ui";
import { BLOCK_HUE, HUE_CHIP, HUE_DOT } from "@/components/planner/block-hue";
import { DueBadge } from "@/components/work";
import { PLACE_IDS } from "@/lib/data/place";
import type { Landed } from "@/lib/data/use-place";
import type { WeekHead } from "@/lib/data/use-week-view";
import {
  TIER_WORDS,
  TIME_HOURS,
  type ChipView,
  type TimeBlockView,
  type TimeEventView,
  type WeekDayView,
  type WeekView,
} from "@/lib/data/week-view";
import { blockPanelRoute } from "@/lib/routes";
import { WEEK_COPY as COPY } from "./copy";
import { DayHead } from "./priority-lens";
import type { WeekPlacing } from "./use-week-placing";
import { LandedLine } from "./week-chip";

/**
 * The Time lens (USE-73, D-USE-41; states/time-lens.md): the week as a
 * calendar on one `ScheduleAxis`, 8:00 to 18:00 at 80 px an hour after a 48
 * px axis, seven equal columns that keep a 120 px floor and then scroll
 * sideways (D-USE-94); today's shaded surface. Every block sits at its own
 * minutes (`timeLensDay`, never its place in a list), in its kind's colour,
 * and opens its Block panel (`?panel=block&id=&date=`, USE-76 draws it).
 * Work holds its chips tier by tier, each edged in its tier's colour with
 * the tier word in its name and hover title (D-USE-101), "1/3" for a session
 * and the column's due badge, never a firing time (D-USE-98); the Fits line
 * sits in the day's last Work block. Events are plum inside the block their
 * start falls in, never splitting it. The now line crosses today only.
 * With `placing` (USE-75) a pool row dropped on a Work block files under the
 * day's first tier with room, and lands ringed with its line.
 */

const PX_PER_HOUR = 80;
const GUTTER_PX = 48;
/** The breath between two blocks, taken from the earlier one's foot. */
const BLOCK_GAP_PX = 2;
/** Under this a block is a bar in its dot colour, named only (the stretch break). */
const BAR_UNDER_MIN = 15;

const pxOf = (minutes: number) => (minutes / 60) * PX_PER_HOUR;

/** Whole class names, so Tailwind sees every one. */
const TIER_EDGE: Record<WorkTier, string> = {
  urgent: "border-alert",
  primary: "border-category-leaf-dot",
  secondary: "border-category-amber-dot",
  stretch: "border-category-slate-dot",
};

/** Column `index` of seven, after the axis's gutter. */
const columnStyle = (index: number) => ({
  insetInlineStart: `calc(${GUTTER_PX}px + (100% - ${GUTTER_PX}px) * ${index} / 7)`,
  width: `calc((100% - ${GUTTER_PX}px) / 7)`,
});

export interface TimeLensProps {
  heads: WeekHead[];
  range: string;
  view: WeekView | null;
  /** The path the Block panel opens over, query kept. */
  here: string;
  /** Today's minute when today is in the week shown; else null. */
  nowMin: number | null;
  timeZone: string;
  /** Placing from the pool (USE-75); without it the blocks only show. */
  placing?: WeekPlacing;
}

export function TimeLens({
  heads,
  range,
  view,
  here,
  nowMin,
  timeZone,
  placing,
}: TimeLensProps) {
  const days: (WeekDayView | null)[] = heads.map(
    (head) => view?.days.find((day) => day.dateKey === head.dateKey) ?? null,
  );
  const todayIndex = heads.findIndex((head) => head.isToday);
  const { startMin, endMin } = TIME_HOURS;
  const nowShown =
    nowMin !== null && todayIndex >= 0 && nowMin >= startMin && nowMin < endMin;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[calc(var(--space-12)+var(--week-col-min)*7)]">
        <div className="flex border-b border-hairline">
          <div className="w-12 shrink-0" />
          {heads.map((head, index) => {
            const day = days[index];
            return (
              <div
                key={head.dateKey}
                className="flex h-12 min-w-0 flex-1 items-center px-2.5"
              >
                <DayHead
                  head={head}
                  weekday={day?.weekday}
                  hasWork={day?.hasWork ?? index < 5}
                  inline
                />
              </div>
            );
          })}
        </div>
        <ScheduleAxis
          startMin={startMin}
          endMin={endMin}
          pxPerHour={PX_PER_HOUR}
          timeZone={timeZone}
          ariaLabel={COPY.timeGrid(range)}
          gutterPx={GUTTER_PX}
          // The axis reads 8:00 to 17:00; the grid's foot is 18:00, unlabelled.
          formatHour={(minutes) =>
            minutes === endMin ? "" : COPY.hour(minutes)
          }
          hourLinesOnly
          hourLabelAlign="start"
          className="overflow-visible pt-(--space-2)"
        >
          {heads.map((head, index) => (
            <DayColumn
              key={head.dateKey}
              index={index}
              head={head}
              day={days[index] ?? null}
              loading={view === null}
              here={here}
              placing={placing}
            />
          ))}
          {nowShown ? (
            <div
              aria-hidden="true"
              style={columnStyle(todayIndex)}
              className="pointer-events-none absolute inset-y-0"
            >
              <NowLine
                atMin={nowMin}
                topPx={pxOf(nowMin - startMin)}
                label=""
              />
            </div>
          ) : null}
        </ScheduleAxis>
      </div>
    </div>
  );
}

function DayColumn({
  index,
  head,
  day,
  loading,
  here,
  placing,
}: {
  index: number;
  head: WeekHead;
  day: WeekDayView | null;
  loading: boolean;
  here: string;
  placing: WeekPlacing | undefined;
}) {
  return (
    <div
      data-time-day={head.dateKey}
      style={columnStyle(index)}
      className={cn(
        "absolute inset-y-0 border-s border-hairline",
        head.isToday && "bg-surface",
      )}
    >
      {day === null ? (
        loading && index < 5 ? (
          <Skeleton
            style={{ top: `${pxOf(90)}px`, height: `${pxOf(150)}px` }}
            className="absolute inset-x-1"
          />
        ) : null
      ) : (
        <>
          {day.hasWork ? null : (
            <Text
              as="p"
              variant="caption"
              tone="muted"
              className="relative px-2.5 pt-(--space-2)"
            >
              {day.checklistName ?? COPY.noWorkBlocks}
            </Text>
          )}
          {day.timeBlocks.map((block) => (
            <TimeBlock
              key={block.id}
              block={block}
              dateKey={day.dateKey}
              past={day.past}
              href={blockPanelRoute(here, block.id, day.dateKey)}
              placing={placing}
            />
          ))}
          {day.looseEvents.map((event) => (
            <EventBand
              key={event.id}
              event={event}
              style={{
                top: `${pxOf(event.topMin)}px`,
                height: `${eventHeight(event)}px`,
                insetInlineStart: "var(--space-1)",
                insetInlineEnd: "var(--space-1)",
              }}
            />
          ))}
        </>
      )}
    </div>
  );
}

function TimeBlock({
  block,
  dateKey,
  href,
  past,
  placing,
}: {
  block: TimeBlockView;
  dateKey: string;
  href: string;
  past: boolean;
  placing: WeekPlacing | undefined;
}) {
  const router = useRouter();
  const hue = BLOCK_HUE[block.kind];
  const isWork = block.kind === "work";
  // A pool row only (USE-75): a chip here opens the panel, it does not carry.
  const drop = useDropTarget(PLACE_IDS.block(dateKey, block.id), {
    disabled: !isWork || placing === undefined,
  });
  const takesRow = drop.isOver && (drop.carriedId?.startsWith("row:") ?? false);
  const landed = placing?.landed?.dateKey === dateKey ? placing.landed : null;
  const top = pxOf(block.topMin);
  const height = Math.max(0, pxOf(block.lengthMin) - BLOCK_GAP_PX);

  if (block.lengthMin < BAR_UNDER_MIN) {
    return (
      <Link
        href={href}
        scroll={false}
        aria-label={block.label}
        data-time-block={block.id}
        style={{ top: `${top}px` }}
        className={cn(
          "absolute inset-x-1 h-3 rounded-(--radius-control) outline-none focus-visible:ring-2 focus-visible:ring-ring",
          HUE_DOT[hue],
          past && "opacity-60",
        )}
      />
    );
  }

  const open = () => router.push(href, { scroll: false });
  return (
    <div
      ref={drop.ref}
      data-time-block={block.id}
      style={{ top: `${top}px`, height: `${height}px` }}
      className={cn(
        "absolute inset-x-1 overflow-hidden rounded-(--radius-control)",
        HUE_CHIP[hue],
        past && "opacity-60",
        takesRow && "ring-[1.5px] ring-ink ring-inset",
      )}
    >
      {/* The block's one control: every click on it opens its panel. */}
      <Link
        href={href}
        scroll={false}
        aria-label={block.label}
        className="absolute inset-0 rounded-(--radius-control) outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
      />
      {isWork ? (
        <span
          aria-hidden="true"
          className={cn("absolute inset-y-0 start-0 w-0.75", HUE_DOT[hue])}
        />
      ) : null}
      <div className="pointer-events-none relative flex flex-col gap-1 ps-2 pe-1.5 pt-1">
        <Text
          as="p"
          variant="caption"
          weight={isWork ? 600 : 400}
          tone={isWork ? "ink" : "muted"}
          truncate
        >
          {block.name}
        </Text>
        {block.chips.length > 0 ? (
          <ul className="flex flex-col gap-1">
            {block.chips.map((chip) => (
              <TimeChip
                key={chip.id}
                chip={chip}
                onOpen={open}
                landed={landed?.workItemId === chip.workItemId ? landed : null}
                onUndo={() => void placing?.undo()}
              />
            ))}
          </ul>
        ) : null}
        {block.fits ? (
          <Text as="p" variant="caption" tone="muted" truncate>
            {block.fits}
          </Text>
        ) : null}
      </div>
      {block.events.map((event) => (
        <EventBand
          key={event.id}
          event={event}
          style={{
            top: `${pxOf(event.offsetMin)}px`,
            height: `${eventHeight(event)}px`,
            insetInlineStart: "var(--space-3)",
            insetInlineEnd: "var(--space-2)",
          }}
        />
      ))}
    </div>
  );
}

/**
 * A work chip: the tier by its edge, and by its word in the name and the
 * hover title (D-USE-101); a click opens the block's panel, as the block.
 */
function TimeChip({
  chip,
  onOpen,
  landed,
  onUndo,
}: {
  chip: ChipView;
  onOpen: () => void;
  /** Just placed here (USE-75): ringed, its line under it. */
  landed: Landed | null;
  onUndo: () => void;
}) {
  return (
    <>
      <li
        data-time-chip={chip.id}
        title={COPY.chipTitle(chip.title, TIER_WORDS[chip.tier])}
        onClick={onOpen}
        className={cn(
          "pointer-events-auto flex flex-col items-start gap-0.5 rounded-(--radius-control) border-s-2 bg-background px-1.5 py-0.5",
          TIER_EDGE[chip.tier],
          landed && "ring-[1.5px] ring-ink",
        )}
      >
        <span className="sr-only">{chip.label}</span>
        <Text as="span" variant="caption" tone="ink" aria-hidden="true">
          {chip.emoji ? `${chip.emoji}\u00a0` : null}
          {chip.title}
          {chip.session ? `\u00a0${chip.session.n}/${chip.session.of}` : null}
        </Text>
        {chip.due ? (
          <DueBadge word={chip.due.word} tone={chip.due.tone} />
        ) : null}
      </li>
      {landed ? (
        <li className="pointer-events-auto">
          <LandedLine
            line={landed.line}
            onUndo={landed.undo ? onUndo : null}
            undoName={COPY.undoName(landed.line)}
          />
        </li>
      ) : null}
    </>
  );
}

function eventHeight(event: TimeEventView): number {
  return Math.max(pxOf(15), pxOf(event.lengthMin) - BLOCK_GAP_PX * 2);
}

/** An event in plum at its time, its time and name; never a control here. */
function EventBand({
  event,
  style,
}: {
  event: TimeEventView;
  style: React.CSSProperties;
}) {
  return (
    <div
      data-time-event={event.id}
      style={style}
      className={cn(
        "pointer-events-none absolute overflow-hidden rounded-(--radius-control)",
        HUE_CHIP.plum,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 start-0 w-0.75", HUE_DOT.plum)}
      />
      <Text
        as="p"
        variant="caption"
        tone="ink"
        truncate
        className="ps-(--space-2) pe-(--space-1) pt-0.5"
      >
        {event.label}
      </Text>
    </div>
  );
}
