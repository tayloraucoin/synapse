/**
 * DayOutcomeRow · ShiftRow · WeekRow — the review's list rows
 * (v2 handoff §5.9).
 *
 * Three rows that all answer "what happened", at three scales: one item on one
 * day, one shift, one week. They share a file because they share a shape and
 * are only ever read together, in WR-02, WR-04 and HS-01.
 *
 * `form` on `DayOutcomeRow` is the difference between a row read on its own
 * ("long" — weekday, time, outcome, weight, minutes) and a row read inside an
 * expanded week ("short" — weekday and outcome). Same component, because the
 * facts are the same facts.
 *
 * ShiftRow states a delta and a reason, never a judgement. "+60 min, slept in"
 * is the whole row; nothing calls it a bad day.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../../../primitives/layout/collapsible";
import { Text } from "../../../primitives/typography/text";

export interface DayOutcomeRowProps {
  weekday: string;
  timeLabel?: string;
  outcome: React.ReactNode;
  /** "not counted" · "counts half" · "counts as missed". */
  weightPhrase?: string;
  minutes?: number;
  quantity?: string;
  form: "long" | "short";
  onOpen?: () => void;
  className?: string;
}

export function DayOutcomeRow({
  weekday,
  timeLabel,
  outcome,
  weightPhrase,
  minutes,
  quantity,
  form,
  onOpen,
  className,
}: DayOutcomeRowProps) {
  const tail = [
    ...(minutes === undefined ? [] : [`${minutes} min`]),
    ...(quantity === undefined ? [] : [quantity]),
  ].join(" · ");

  const body = (
    <>
      <Text
        as="span"
        variant="secondary"
        tone="secondary"
        className="w-20 shrink-0"
      >
        {weekday}
      </Text>
      {form === "long" && timeLabel !== undefined ? (
        <Text
          as="span"
          variant="secondary"
          tone="secondary"
          className="w-20 shrink-0 tabular-nums"
        >
          {timeLabel}
        </Text>
      ) : null}
      <Text as="span" variant="body" className="min-w-0 flex-1">
        {outcome}
      </Text>
      {form === "long" && weightPhrase !== undefined ? (
        <Text as="span" variant="caption" tone="secondary" className="shrink-0">
          {weightPhrase}
        </Text>
      ) : null}
      {form === "long" && tail !== "" ? (
        <Text
          as="span"
          variant="secondary"
          tone="secondary"
          className="shrink-0 tabular-nums"
        >
          {tail}
        </Text>
      ) : null}
    </>
  );

  const shell = cn(
    "flex min-h-(--target) w-full items-center gap-(--space-3) py-(--space-2) text-left",
    className,
  );

  return (
    <li className="flex">
      {onOpen === undefined ? (
        <span className={shell}>{body}</span>
      ) : (
        <button
          type="button"
          onClick={onOpen}
          className={cn(
            shell,
            "transition-colors duration-(--dur-state) ease-(--ease-settle)",
            "hover:bg-neutral-100 dark:hover:bg-neutral-800",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
          )}
        >
          {body}
        </button>
      )}
    </li>
  );
}

export interface ShiftRowProps {
  weekday: string;
  deltaMin: number;
  atLabel: string;
  reason: string;
  cutCount: number;
  onOpen?: () => void;
  className?: string;
}

export function ShiftRow({
  weekday,
  deltaMin,
  atLabel,
  reason,
  cutCount,
  onOpen,
  className,
}: ShiftRowProps) {
  const summary = [
    `+${deltaMin} min at ${atLabel}`,
    reason,
    ...(cutCount === 0 ? [] : [`${cutCount} cut`]),
  ].join(" · ");

  return (
    <DayOutcomeRow
      weekday={weekday}
      outcome={summary}
      form="short"
      onOpen={onOpen}
      className={className}
    />
  );
}

export interface WeekRowProps {
  rangeLabel: string;
  status: React.ReactNode;
  onOpenWeek: () => void;
  children: React.ReactNode;
  className?: string;
}

export function WeekRow({
  rangeLabel,
  status,
  onOpenWeek,
  children,
  className,
}: WeekRowProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <li className={cn("border-hairline border-b last:border-b-0", className)}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-(--space-2)">
          <CollapsibleTrigger
            aria-label={`${open ? "Hide" : "Show"} days in ${rangeLabel}`}
            className={cn(
              "flex min-h-(--row-min) min-w-0 flex-1 items-center gap-(--space-3) text-left",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
            )}
          >
            <Text as="span" variant="row-title" weight={500} className="shrink-0">
              {rangeLabel}
            </Text>
            <Text
              as="span"
              variant="secondary"
              tone="secondary"
              className="min-w-0 flex-1"
            >
              {status}
            </Text>
          </CollapsibleTrigger>

          <button
            type="button"
            onClick={onOpenWeek}
            className={cn(
              "text-ink shrink-0 min-h-(--target) px-(--space-2)",
              "text-(length:--fs-secondary) font-medium underline-offset-4 hover:underline",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
            )}
          >
            Open
          </button>
        </div>

        <CollapsibleContent>
          <ul className="ps-(--space-4) pb-(--space-2)">{children}</ul>
        </CollapsibleContent>
      </Collapsible>
    </li>
  );
}
