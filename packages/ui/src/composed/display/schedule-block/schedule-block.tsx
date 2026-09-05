/**
 * ScheduleBlock — an item drawn in time (v2 handoff §5.7, Phase 2).
 *
 * Three sizes, chosen by height rather than by the caller: a 15-minute item at
 * 64px an hour is 16px tall and cannot hold a title at all. `full` (≥32px)
 * shows title and time, `compact` (16–32px) shows the title alone, `hairline`
 * (<16px) is a 2px rule with a caption beside it. Deriving the size from the
 * geometry is what stops a five-minute block from rendering unreadable text.
 *
 * MULTITASK BLOCKS SHARE THE BAND. `{ index, count }` splits the width with
 * 4px gutters, so two things at 9:00 sit side by side instead of on top of
 * each other.
 *
 * The accessible label carries what the visual cannot at small sizes:
 * "{title}, {start}–{end}, {state}". A hairline block is still a complete
 * sentence to a screen reader.
 */
"use client";

import type { DayItemView } from "@syn/types";
import { formatClock } from "@syn/utils";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { scheduleBlockVariants } from "./schedule-block.variants";

const MULTITASK_GUTTER_PX = 4;

export type ScheduleBlockSize = "full" | "compact" | "hairline";

export interface ScheduleBlockProps {
  item: DayItemView;
  topPx: number;
  heightPx: number;
  /** Derived from `heightPx` when omitted. */
  size?: ScheduleBlockSize;
  multitask?: { index: number; count: number };
  timeZone: string;
  locale?: string;
  onOpen: (item: DayItemView) => void;
  className?: string;
}

function sizeFor(heightPx: number): ScheduleBlockSize {
  if (heightPx >= 32) return "full";
  if (heightPx >= 16) return "compact";
  return "hairline";
}

function toneFor(state: DayItemView["state"]) {
  switch (state) {
    case "active":
      return "active" as const;
    case "done":
      return "done" as const;
    case "done-off-schedule":
      return "moved" as const;
    case "passed":
    case "deferred":
    case "cut-by-shift":
      return "passed" as const;
    default:
      return "upcoming" as const;
  }
}

export function ScheduleBlock({
  item,
  topPx,
  heightPx,
  size,
  multitask,
  timeZone,
  locale,
  onOpen,
  className,
}: ScheduleBlockProps) {
  const resolved = size ?? sizeFor(heightPx);
  const tone = toneFor(item.state);

  const startLabel =
    item.scheduledStart === null
      ? ""
      : formatClock(item.scheduledStart, timeZone, locale);
  const endLabel =
    item.scheduledEnd === null
      ? ""
      : formatClock(item.scheduledEnd, timeZone, locale);

  const width =
    multitask === undefined
      ? "100%"
      : `calc((100% - ${(multitask.count - 1) * MULTITASK_GUTTER_PX}px) / ${multitask.count})`;
  const offset =
    multitask === undefined
      ? "0px"
      : `calc(${multitask.index} * ((100% - ${(multitask.count - 1) * MULTITASK_GUTTER_PX}px) / ${multitask.count} + ${MULTITASK_GUTTER_PX}px))`;

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${item.title}, ${startLabel}–${endLabel}, ${item.state}`}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        width,
        insetInlineStart: offset,
      }}
      className={cn(scheduleBlockVariants({ tone, size: resolved }), className)}
    >
      {resolved === "hairline" ? (
        <span className="flex items-center gap-(--space-1)">
          <span aria-hidden="true" className="bg-ink h-0.5 w-4 shrink-0" />
          <Text as="span" variant="caption" tone="secondary" truncate>
            {item.title}
          </Text>
        </span>
      ) : (
        <span className="flex h-full flex-col justify-center overflow-hidden">
          <span className="flex items-center gap-(--space-1)">
            {item.scheduling === "hard" ? (
              <span
                aria-hidden="true"
                className="text-text-secondary shrink-0 text-(length:--fs-caption)"
              >
                ▲
              </span>
            ) : null}
            <Text as="span" variant="caption" truncate weight={500}>
              {item.title}
            </Text>
          </span>
          {resolved === "full" ? (
            <Text
              as="span"
              variant="caption"
              tone={tone === "moved" ? "violet" : "secondary"}
              className="tabular-nums"
              truncate
            >
              {tone === "moved" ? "moved" : `${startLabel}–${endLabel}`}
            </Text>
          ) : null}
        </span>
      )}
    </button>
  );
}
