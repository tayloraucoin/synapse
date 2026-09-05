/**
 * DayHeader — the tappable day title (v2 handoff §5.6).
 *
 * The tab's `h1`, and the way into DH-01's day options. Full-width, ghost,
 * left-aligned, so the whole title line is the target rather than a small
 * chevron beside it.
 *
 * THE SECOND LINE IS FACTS, NOT A SCORE. Template name, wake time, shift
 * amount, zone — never "3 of 7 done" (official spec §2.4). The facts are
 * assembled here rather than by the caller so the order and the separator are
 * the same on every screen that shows a day.
 *
 * When `onOpen` is absent the header renders as a heading rather than a
 * button: plan mode on a template day has nothing to open, and a dead button
 * is worse than a title.
 */
"use client";

import type { DayMode } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { DAY_HEADER_COPY } from "./copy";

export interface DayHeaderProps {
  /** "Friday 4 Sept" */
  dateLabel: string;
  templateName: string | null;
  /** Formatted in the day's zone by the caller. */
  wokeAtLabel?: string | null;
  shiftedMin?: number | null;
  /** "times in Vancouver", while the day's zone differs from the device's. */
  zoneLabel?: string | null;
  notUntilWeekday?: string | null;
  mode: DayMode;
  onOpen?: () => void;
  className?: string;
}

export function DayHeader({
  dateLabel,
  templateName,
  wokeAtLabel = null,
  shiftedMin = null,
  zoneLabel = null,
  notUntilWeekday = null,
  mode,
  onOpen,
  className,
}: DayHeaderProps) {
  const facts: string[] = [
    templateName ?? DAY_HEADER_COPY.noTemplate,
    ...(wokeAtLabel === null ? [] : [DAY_HEADER_COPY.woke(wokeAtLabel)]),
    ...(shiftedMin === null || shiftedMin === 0
      ? []
      : [DAY_HEADER_COPY.shifted(shiftedMin)]),
    ...(mode === "plan" && notUntilWeekday !== null
      ? [DAY_HEADER_COPY.notUntil(notUntilWeekday)]
      : []),
    ...(zoneLabel === null ? [] : [zoneLabel]),
  ];

  const content = (
    <>
      <Text as="span" variant="heading" weight={600}>
        {dateLabel}
      </Text>
      <Text as="span" variant="secondary" tone="secondary">
        {facts.join(DAY_HEADER_COPY.separator)}
      </Text>
    </>
  );

  const shell = cn(
    "flex w-full flex-col gap-(--space-1) px-(--space-4) py-(--space-3) text-left",
    className,
  );

  /*
   * The h1 WRAPS the button rather than sitting inside it: a heading is not
   * phrasing content and cannot legally live in a button, but a button can
   * live in a heading. That order keeps the screen's one h1 (cross-cutting
   * §3.4) and still makes the whole two-line block the tap target.
   */
  if (onOpen === undefined) {
    return (
      <h1 className={shell}>{content}</h1>
    );
  }

  return (
    <h1 className="contents">
      <button
        type="button"
        onClick={onOpen}
        aria-label={DAY_HEADER_COPY.openOptions}
        className={cn(
          shell,
          "transition-colors duration-(--dur-state) ease-(--ease-settle)",
          "hover:bg-neutral-100 dark:hover:bg-neutral-800",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none",
        )}
      >
        {content}
      </button>
    </h1>
  );
}
