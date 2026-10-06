/**
 * ScheduleBlock — an item drawn in time (v2 handoff §5.7, Phase 2; UX v1.1
 * §6.5, §10.1).
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
 * UNDER v1.1 A BLOCK CAN BE DRAGGED, RESIZED, PINNED, OR BE THE CONTAINER:
 *
 *  - `pinned` draws the anchor glyph and marks the block `data-pinned`, which
 *    is how the `DragLayer` knows not to lift it (§6.5: "the block does not
 *    lift; instead a Dialog asks").
 *  - `resizable` renders the bottom-edge handle (§6.5: "Drag an item's
 *    bottom edge to change its length for today"). The handle is decorative;
 *    the keyboard path (Shift+↑/↓) is the layer's.
 *  - `container` is the work block (§6.1): the focus as its title, the band's
 *    own fill, and the fixtures slotted as children inside it. Its body does
 *    not lift.
 *  - `ghostOutline` is the *not confirmed* face (§10.1: "Ghost outline").
 *  - `lifted` is the layer's ghost: 0.9 opacity, 1.5px `border-accent-mark`.
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
import { PinGlyph } from "../item-icon";
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

  /* ---- UX v1.1 (§6.1, §6.5, §10.1) ---- */
  /** The `DragLayer` may lift it; the layer finds it by `data-item-id`. */
  draggable?: boolean;
  /** The bottom-edge handle. */
  resizable?: boolean;
  /** The anchor glyph; the block never lifts. Read from `item.pinned` when omitted. */
  pinned?: boolean;
  /** The work block: the focus as the title, fixtures as `children`. */
  container?: boolean;
  /** *Not confirmed* — a hairline outline, no fill. */
  ghostOutline?: boolean;
  /** The layer's lifted ghost. */
  lifted?: boolean;
  /** A container's nested blocks, positioned relative to it. */
  children?: React.ReactNode;
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
    case "not-confirmed":
      return "ghost" as const;
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
  draggable = false,
  resizable = false,
  pinned,
  container = false,
  ghostOutline = false,
  lifted = false,
  children,
  className,
}: ScheduleBlockProps) {
  const resolved = size ?? sizeFor(heightPx);
  const isPinned = pinned ?? item.pinned;
  const tone = container ? "container" : ghostOutline ? "ghost" : toneFor(item.state);

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

  const stateLabel = item.state === "not-confirmed" ? "not confirmed" : item.state;
  const label = `${item.title}, ${startLabel}–${endLabel}, ${stateLabel}${isPinned ? ", pinned" : ""}${container ? ", block" : ""}`;

  const face =
    resolved === "hairline" ? (
      <span className="flex items-center gap-(--space-1)">
        <span aria-hidden="true" className="bg-ink h-0.5 w-4 shrink-0" />
        {isPinned ? <PinGlyph size={10} className="text-text-secondary" /> : null}
        <Text as="span" variant="caption" tone="secondary" truncate>
          {item.title}
        </Text>
      </span>
    ) : (
      <span
        className={cn(
          "flex flex-col overflow-hidden",
          container ? "h-auto justify-start" : "h-full justify-center",
        )}
      >
        <span className="flex items-center gap-(--space-1)">
          {isPinned ? (
            <PinGlyph size={10} className="text-text-secondary" />
          ) : item.scheduling === "hard" ? (
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
    );

  /*
   * A container is a positioned box whose title is a button and whose
   * children are blocks of their own; an item is the button itself. Both
   * carry SYS-4's handles (`data-item-row`, `data-item-id`, `data-row-open`)
   * so roving focus and `Enter` behave alike.
   */
  if (container) {
    return (
      <div
        data-schedule-block
        data-item-id={item.id}
        data-container
        style={{ top: `${topPx}px`, height: `${heightPx}px`, width, insetInlineStart: offset }}
        className={cn(scheduleBlockVariants({ tone, size: resolved, lifted }), className)}
      >
        <button
          type="button"
          data-item-row
          data-item-id={item.id}
          data-row-open
          onClick={() => onOpen(item)}
          aria-label={label}
          className={cn(
            "w-full text-left",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
          )}
        >
          {face}
        </button>
        {children}
      </div>
    );
  }

  return (
    <button
      type="button"
      data-schedule-block
      data-item-row
      data-item-id={item.id}
      data-row-open
      data-pinned={isPinned ? "true" : undefined}
      data-draggable={draggable && !isPinned ? "true" : undefined}
      onClick={() => onOpen(item)}
      aria-label={label}
      style={{
        top: `${topPx}px`,
        height: `${heightPx}px`,
        width,
        insetInlineStart: offset,
      }}
      className={cn(
        scheduleBlockVariants({ tone, size: resolved, lifted }),
        draggable && !isPinned && "touch-none",
        lifted && "motion-safe:scale-[1.02] motion-safe:transition-transform motion-safe:duration-(--dur-state)",
        className,
      )}
    >
      {face}
      {resizable && resolved !== "hairline" ? (
        <span
          aria-hidden="true"
          data-resize-handle
          data-item-id={item.id}
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none"
        />
      ) : null}
    </button>
  );
}
