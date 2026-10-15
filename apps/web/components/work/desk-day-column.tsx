"use client";

import type * as React from "react";
import { cn, NowLine, ScheduleAxis, Text } from "@syn/ui";
import { clockMinutes } from "@syn/utils";
import {
  HUE_CHIP,
  HUE_DOT,
  type BlockHue,
} from "@/components/planner/block-hue";
import { DayBar, type DayBarSegment } from "@/components/planner/day-bar";

/**
 * DeskDayColumn — the day beside Today at the desk (USE-58; today/index.md,
 * N6, D-USE-41): "The day" with its range words, the whole day as one bar
 * from Up at to Lights out with "Work ends" under it, then the hours on
 * `ScheduleAxis`, each block in its kind's colour, events in plum inside the
 * block they fall in or on their own, and the `NowLine` in verdigris on
 * today only (`now: null` on any other date, C-USE-today-opened-day-3).
 *
 * Named apart from the planner's `DayColumn` (Review the day, Schedule),
 * which draws a block's items at 96 px an hour; this one names blocks only.
 * Blocks are words here: USE-76 makes a block open its Block panel.
 * Desk-only: the screen mounts it inside `hidden split:block`.
 */

export interface DeskColumnEvent {
  id: string;
  title: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
}

export interface DeskColumnBlock {
  id: string;
  /** "Work · 9:30 to 12:00", "Lunch". */
  label: string;
  /** "HH:MM" */
  startsAt: string;
  endsAt: string;
  hue: BlockHue;
  /** Before now on today: faded, never marked (P-A07). */
  past: boolean;
  /** Events inside it, by start: a plum band each at its time. */
  bands: readonly DeskColumnEvent[];
}

export interface DeskDayColumnWords {
  /** "The day". */
  title: string;
  /** "whole day, then 8:00 to 18:00". */
  range: string;
  /** The bar's three words: "7:00", "Work ends 17:00", "Lights out 22:30". */
  ticks: { start: string; middle: string; end: string };
  /** "15:30 [Dentist]". */
  event: (event: DeskColumnEvent) => string;
  /** The axis's hour label: "8:00". */
  hour: (minutes: number) => string;
}

export interface DeskDayColumnProps {
  words: DeskDayColumnWords;
  /** The bar: Up at to Lights out, minutes from midnight. */
  bar: { from: number; to: number; segments: readonly DayBarSegment[] };
  /** The axis's hours, minutes from midnight on whole hours. */
  hours: { startMin: number; endMin: number };
  blocks: readonly DeskColumnBlock[];
  /** Events inside no block. */
  events: readonly DeskColumnEvent[];
  /** Today's minute; null on any other date: no line, no tick. */
  now: { atMin: number; label: string } | null;
  timeZone: string;
  className?: string;
}

/** 56 px an hour as drawn; the axis's nearest scale (opened-day.md) [ASSUMPTION]. */
const PX_PER_HOUR = 64;
const GUTTER_PX = 52;
/** The breath between two blocks, taken from the earlier one's foot. */
const BLOCK_GAP_PX = 2;

const pxOf = (minutes: number) => (minutes / 60) * PX_PER_HOUR;

export function DeskDayColumn({
  words,
  bar,
  hours,
  blocks,
  events,
  now,
  timeZone,
  className,
}: DeskDayColumnProps) {
  const top = (clock: string) =>
    pxOf(clamp(clockMinutes(clock), hours) - hours.startMin);
  const span = (startsAt: string, endsAt: string) =>
    pxOf(
      clamp(clockMinutes(endsAt), hours) - clamp(clockMinutes(startsAt), hours),
    );
  const shown = blocks.filter(
    (block) => span(block.startsAt, block.endsAt) > 0,
  );
  const free = events.filter((event) => span(event.startsAt, event.endsAt) > 0);

  return (
    <section
      aria-label={words.title}
      className={cn("flex flex-col gap-(--space-4)", className)}
    >
      <div className="flex items-baseline justify-between gap-(--space-2)">
        <Text as="h2" variant="secondary" weight={600}>
          {words.title}
        </Text>
        <Text as="span" variant="caption" tone="muted">
          {words.range}
        </Text>
      </div>
      <DayBar
        label={words.title}
        from={bar.from}
        to={bar.to}
        segments={bar.segments}
        nowAt={now?.atMin ?? null}
        ticks={words.ticks}
        className="border-b border-border pb-(--space-3)"
      />
      <ScheduleAxis
        startMin={hours.startMin}
        endMin={hours.endMin}
        pxPerHour={PX_PER_HOUR}
        timeZone={timeZone}
        ariaLabel={words.title}
        gutterPx={GUTTER_PX}
        formatHour={words.hour}
        hourLinesOnly
        hourLabelAlign="start"
        className="overflow-visible pt-(--space-2)"
      >
        {shown.map((block) => (
          <div
            key={block.id}
            data-desk-block={block.id}
            style={{
              top: `${top(block.startsAt)}px`,
              height: `${Math.max(0, span(block.startsAt, block.endsAt) - BLOCK_GAP_PX)}px`,
              insetInlineStart: `${GUTTER_PX}px`,
            }}
            className={cn(
              "absolute end-0 overflow-hidden rounded-(--radius-control)",
              HUE_CHIP[block.hue],
              block.past && "opacity-60",
            )}
          >
            <span
              aria-hidden="true"
              className={cn(
                "absolute inset-y-0 start-0 w-0.75",
                HUE_DOT[block.hue],
              )}
            />
            <Text
              as="p"
              variant="caption"
              weight={600}
              tone={block.past ? "muted" : "ink"}
              truncate
              className="ps-(--space-3) pe-(--space-2) pt-0.5"
            >
              {block.label}
            </Text>
            {block.bands.map((band) => (
              <EventBand
                key={band.id}
                event={band}
                words={words}
                style={{
                  top: `${pxOf(clockMinutes(band.startsAt) - clockMinutes(block.startsAt))}px`,
                  insetInlineStart: "var(--space-3)",
                  insetInlineEnd: "var(--space-2)",
                }}
              />
            ))}
          </div>
        ))}
        {free.map((event) => (
          <EventBand
            key={event.id}
            event={event}
            words={words}
            style={{
              top: `${top(event.startsAt)}px`,
              insetInlineStart: `${GUTTER_PX}px`,
              insetInlineEnd: 0,
            }}
          />
        ))}
        {now !== null ? (
          <NowLine
            atMin={now.atMin}
            topPx={pxOf(now.atMin - hours.startMin)}
            label=""
            className="ms-(--space-12)"
          />
        ) : null}
      </ScheduleAxis>
    </section>
  );
}

function clamp(minutes: number, hours: { startMin: number; endMin: number }) {
  return Math.min(hours.endMin, Math.max(hours.startMin, minutes));
}

/** An event in plum, its time and name, never a control here. */
function EventBand({
  event,
  words,
  style,
}: {
  event: DeskColumnEvent;
  words: DeskDayColumnWords;
  style: React.CSSProperties;
}) {
  return (
    <div
      data-desk-event={event.id}
      style={style}
      className={cn(
        "absolute flex h-6 items-center overflow-hidden rounded-(--radius-control)",
        HUE_CHIP.plum,
      )}
    >
      <span
        aria-hidden="true"
        className={cn("absolute inset-y-0 start-0 w-0.75", HUE_DOT.plum)}
      />
      <Text as="span" variant="caption" truncate className="ps-(--space-3)">
        {words.event(event)}
      </Text>
    </div>
  );
}
