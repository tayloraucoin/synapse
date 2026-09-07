/**
 * HabitStrip · StripSquare — the week in seven squares (v2 handoff §5.9).
 *
 * WR-01's per-habit row. Seven squares, Monday to Sunday, in the tier
 * register: filled, filled-with-a-dot, outline, half-filled, hairline-crossed,
 * spacer, dotted.
 *
 * NEVER COLOUR (official spec §9.3). Seven states told apart by hue would be
 * unreadable for a person with a colour-vision difference and meaningless in
 * a screenshot. They are told apart by *shape*, and each square carries its
 * own label — "Tuesday, done" — so the row reads correctly out loud.
 *
 * This is deliberately not a heatmap and not a streak. A `not-assigned` day is
 * a spacer, not a gap in a chain: the strip says what happened, and says
 * nothing about how many in a row.
 */
"use client";

import type { HabitSummaryView, StripState, StripWeek } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { ItemIcon } from "../item-icon";

export type StripSize = 16 | 20 | 24;

const BOX: Record<StripSize, string> = {
  16: "size-4",
  20: "size-5",
  24: "size-6",
};

/** Shape, never hue — see the note above. */
const SQUARE: Record<StripState, string> = {
  done: "bg-ink",
  "done-moved": "bg-ink",
  "not-counted": "border border-edge",
  half: "border border-edge bg-gradient-to-r from-(--ink) from-50% to-transparent to-50%",
  "didnt-do": "border border-edge",
  "not-assigned": "",
  pending: "border border-dashed border-edge",
};

/** Words for the label, so the strip reads out loud correctly. */
const STATE_WORDS: Record<StripState, string> = {
  done: "done",
  "done-moved": "done, moved",
  "not-counted": "not counted",
  half: "counts half",
  "didnt-do": "missed",
  "not-assigned": "not assigned",
  pending: "pending",
};

export interface StripSquareProps {
  state: StripState;
  size: StripSize;
  /** "Tuesday, done" */
  label: string;
  className?: string;
}

export function StripSquare({
  state,
  size,
  label,
  className,
}: StripSquareProps) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-block shrink-0 rounded-[2px]",
        BOX[size],
        SQUARE[state],
        className,
      )}
    >
      {state === "done-moved" ? (
        <span
          aria-hidden="true"
          className="bg-paper absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full"
        />
      ) : null}
      {state === "didnt-do" ? (
        /*
         * A rotated 1px rule, not a gradient: an arbitrary-value gradient with
         * `calc()` stops needs its operators escaped (`calc(50%_-_0.5px)`) and
         * silently renders nothing when they are not — which is how this square
         * first shipped looking identical to `not-counted`. 141% is √2, so the
         * line reaches both corners.
         */
        <span
          aria-hidden="true"
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
        >
          <span className="block h-px w-[141%] -rotate-45 bg-neutral-400" />
        </span>
      ) : null}
    </span>
  );
}

export interface HabitStripProps {
  /**
   * Only the icon and the title are read, so only those are asked for.
   *
   * It took a whole `HabitSummaryView` until REV-4, whose week model carries a
   * DIFFERENT view of the same habit — it has the two fields this needs and
   * none of the library ones. Widening the caller to satisfy a type nothing
   * here uses would have meant a cast at the one call site, which is the type
   * system being talked out of its job. (`ReflectionBlock` was narrowed for the
   * same reason in REV-3.)
   */
  habit: Pick<HabitSummaryView, "icon" | "title">;
  /** Monday–Sunday — the named tuple, so callers never cast (`@syn/utils`). */
  days: StripWeek;
  /** "Monday" … — the accessible names for each square. */
  dayLabels: readonly string[];
  credit: number;
  counted: number;
  layout: "inline" | "stacked";
  size?: StripSize;
  onOpen: () => void;
  className?: string;
}

export function HabitStrip({
  habit,
  days,
  dayLabels,
  credit,
  counted,
  layout,
  size = 20,
  onOpen,
  className,
}: HabitStripProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full min-h-(--row-min) items-center gap-(--space-3) px-(--space-4) py-(--space-2) text-left",
        layout === "stacked" && "flex-col items-start gap-(--space-2)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        "hover:bg-surface",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
        className,
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-(--space-2)">
        <ItemIcon icon={habit.icon} size={24} />
        <Text as="span" variant="body" truncate>
          {habit.title}
        </Text>
      </span>

      <span className="flex shrink-0 items-center gap-(--space-1)">
        {days.map((state, index) => (
          <StripSquare
            key={dayLabels[index] ?? String(index)}
            state={state}
            size={size}
            label={`${dayLabels[index] ?? ""}, ${STATE_WORDS[state]}`}
          />
        ))}
      </span>

      <Text
        as="span"
        variant="secondary"
        tone="secondary"
        className="shrink-0 tabular-nums"
      >
        {`${credit} of ${counted}`}
      </Text>
    </button>
  );
}
