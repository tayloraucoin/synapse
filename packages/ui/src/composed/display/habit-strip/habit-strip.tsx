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

import type { HabitSummaryView, StripState } from "@syn/types";
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
  "not-counted": "border border-neutral-400",
  half: "border border-neutral-400 bg-gradient-to-r from-(--ink) from-50% to-transparent to-50%",
  "didnt-do": "border border-neutral-400",
  "not-assigned": "",
  pending: "border border-dashed border-neutral-400",
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
        <span
          aria-hidden="true"
          className="absolute inset-0 bg-[linear-gradient(to_top_right,transparent_calc(50%-0.5px),var(--syn-neutral-400)_calc(50%-0.5px),var(--syn-neutral-400)_calc(50%+0.5px),transparent_calc(50%+0.5px))]"
        />
      ) : null}
    </span>
  );
}

export interface HabitStripProps {
  habit: HabitSummaryView;
  /** Monday–Sunday. */
  days: readonly [
    StripState,
    StripState,
    StripState,
    StripState,
    StripState,
    StripState,
    StripState,
  ];
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
        "hover:bg-neutral-100 dark:hover:bg-neutral-800",
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
