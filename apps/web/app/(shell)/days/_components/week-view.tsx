"use client";

import * as React from "react";
import type { StoredBlockKind } from "@syn/types";
import {
  cn,
  DisclosureIcon,
  RegionRetry,
  SegmentedControl,
  Skeleton,
  Text,
} from "@syn/ui";
import { addDays, weekKeyOf, type StripPart } from "@syn/utils";
import { BLOCK_HUE } from "@/components/planner";
import { HUE_DOT } from "@/components/planner/block-hue";
import {
  rowBounds,
  rowDayLabel,
  rowLine,
  rowName,
  weekRangeWords,
} from "@/lib/data/set-up-view";
import type { DaysPlace } from "@/lib/data/use-days";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { useWeek } from "@/lib/data/use-week";
import { DAYS_COPY as COPY } from "./copy";

/**
 * The week (B; usual-week.md, the-week.md): the which-week switch, the
 * stepper ("Every week" with its arrows kept in place but hidden, so the
 * list never jumps), then seven rows, each its bounds, a strip in kind
 * colours and one line in words, never a count. A row opens its day (A).
 * A day not set offers Copy from… in the chevron's place. At 1024 the list
 * is the week pane and the open day's row is selected: the muted fill and
 * an ink edge at the leading side, not colour alone (the-day.md).
 */
export interface WeekViewProps {
  place: DaysPlace;
  onWeek: (week: string) => void;
  onDay: (day: number) => void;
  /** The 1024 week pane's selected day; unset on the phone. */
  selected?: number | null;
}

type Which = "usual" | "this";

export function WeekView({
  place,
  onWeek,
  onDay,
  selected = null,
}: WeekViewProps) {
  const { week, isError, retry } = useWeek(place.week);
  const dated = place.week !== "usual";
  const range = weekRangeWords(place.dates);

  const step = (by: number) => {
    const first = place.dates[0];
    if (first !== undefined) onWeek(weekKeyOf(addDays(first, by * 7)));
  };

  return (
    <div className="flex flex-col gap-(--space-4) pb-(--space-8)">
      <div className="px-(--space-4)">
        <SegmentedControl<Which>
          label={COPY.whichWeek}
          value={dated ? "this" : "usual"}
          onChange={(next) =>
            onWeek(next === "usual" ? "usual" : place.thisWeek)
          }
          stacked={false}
          options={[
            { value: "usual", label: COPY.usualWeek },
            { value: "this", label: COPY.thisWeek },
          ]}
          classes={{
            root: "gap-0",
            label: "sr-only",
            group:
              "w-full gap-1 rounded-(--radius-control) border-0 bg-fill-muted p-1",
            item: "h-9 flex-1 rounded-(--radius-control) bg-transparent text-muted-foreground hover:bg-transparent has-checked:bg-background has-checked:font-semibold has-checked:text-ink motion-reduce:transition-none",
          }}
        />
      </div>

      <div className="flex items-center justify-between px-(--space-4)">
        <StepButton
          label={COPY.previousWeek}
          hidden={!dated}
          onClick={() => step(-1)}
        >
          ‹
        </StepButton>
        <Text
          as="p"
          variant="body"
          weight={600}
          aria-live="polite"
          aria-label={dated ? COPY.weekOf(range) : undefined}
        >
          {dated ? range : COPY.everyWeek}
        </Text>
        <StepButton
          label={COPY.nextWeek}
          hidden={!dated}
          onClick={() => step(1)}
        >
          ›
        </StepButton>
      </div>

      {isError ? (
        <RegionRetry
          label={COPY.dayFailed}
          onRetry={() => void retry()}
          className="mx-(--space-4)"
        />
      ) : (
        <ul
          aria-label={COPY.days}
          aria-busy={week === undefined}
          className="flex flex-col border-t border-border"
        >
          {week === undefined
            ? Array.from({ length: 7 }, (_, index) => (
                <li
                  key={index}
                  className="border-b border-border px-(--space-4) py-(--space-4)"
                >
                  <Skeleton className="h-16 w-full rounded-(--radius-control)" />
                </li>
              ))
            : week.days.map((day) => (
                <li key={day.weekday} className="border-b border-border">
                  <WeekRow
                    day={day}
                    selected={selected === day.weekday}
                    onOpen={() => onDay(day.weekday)}
                  />
                </li>
              ))}
        </ul>
      )}

      {/* The pane beside it is the column, so the hint is the phone's. */}
      {dated && selected === null ? (
        <Text
          as="p"
          variant="secondary"
          tone="muted"
          className="px-(--space-4)"
        >
          {COPY.weekHint}
        </Text>
      ) : null}
    </div>
  );
}

function StepButton({
  label,
  hidden,
  onClick,
  children,
}: {
  label: string;
  hidden: boolean;
  onClick: () => void;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      // Kept in the layout, out of sight and the tab order (usual-week.md).
      className={cn(
        "inline-flex h-8 w-11 items-center justify-center rounded-(--radius-control) text-(length:--fs-heading) text-foreground",
        "hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        hidden && "invisible",
      )}
    >
      {children}
    </button>
  );
}

/**
 * One day: its name in a 110 px slot, its bounds, a chevron; the strip; its
 * line. The row's button covers it; Copy from… sits on top as its own.
 */
function WeekRow({
  day,
  selected,
  onOpen,
}: {
  day: SetUpDay;
  selected: boolean;
  onOpen: () => void;
}) {
  const line = rowLine(day);
  return (
    <div
      data-selected={selected || undefined}
      className={cn(
        "relative flex w-full flex-col gap-(--space-2) px-(--space-4) py-(--space-4)",
        selected ? "bg-fill-muted" : "has-[>button:hover]:bg-surface",
      )}
    >
      {selected ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-0 w-0.5 bg-foreground"
        />
      ) : null}
      <button
        type="button"
        onClick={onOpen}
        aria-label={rowName(day)}
        aria-current={selected ? "date" : undefined}
        className="absolute inset-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none focus-visible:ring-inset"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none flex w-full items-center gap-(--space-2)"
      >
        <Text
          as="span"
          variant="row-title"
          weight={600}
          className="w-27.5 shrink-0"
        >
          {rowDayLabel(day)}
        </Text>
        <Text
          as="span"
          variant="secondary"
          tone="muted"
          className="flex-1 whitespace-nowrap"
        >
          {rowBounds(day)}
        </Text>
        {day.isSet ? (
          <DisclosureIcon
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
        ) : (
          // Copy from's picker is its own ticket's; until then a tap opens the day [ASSUMPTION].
          <span
            data-copy-from
            className="inline-flex h-8 shrink-0 items-center rounded-(--radius-control) border border-border bg-background px-(--space-3) text-(length:--fs-secondary) font-semibold text-foreground"
          >
            {COPY.copyFrom}
          </span>
        )}
      </span>
      {day.strip.length > 0 ? <DayStrip parts={day.strip} /> : null}
      {line !== "" ? (
        <Text
          as="span"
          variant="secondary"
          tone="muted"
          aria-hidden="true"
          className="pointer-events-none"
        >
          {line}
        </Text>
      ) : null}
    </div>
  );
}

/** A part's fill: Orient ink, open time nothing, Break the muted fill, else the kind's dot. */
function partClass(part: string): string | null {
  if (part === "orient") return "bg-foreground";
  if (part === "open") return null;
  if (part === "break") return "bg-fill-muted";
  const hue = BLOCK_HUE[part as StoredBlockKind];
  return hue ? HUE_DOT[hue] : "bg-fill-muted";
}

/**
 * The day's strip: 8 px, segments in kind colours with 2 px gaps, each its
 * share of the day between its bounds. Decoration: the line says it in words.
 */
export function DayStrip({ parts }: { parts: readonly StripPart[] }) {
  return (
    <span aria-hidden="true" className="flex h-2 w-full gap-0.5">
      {parts.map((part, index) => (
        <span
          key={index}
          data-strip-part={part.part}
          style={{ flexGrow: part.share, flexBasis: 0 }}
          className={cn(
            "min-w-0.5",
            partClass(part.part),
            // Orient's sliver keeps its width at any scale.
            part.part === "orient" && "max-w-1.5 min-w-1.5",
          )}
        />
      ))}
    </span>
  );
}
