"use client";

import Link from "next/link";
import { cn, HueSquare, Text } from "@syn/ui";
import { TIER_HUE, type StripDayView } from "./view";

/**
 * WeekStrip — the desk's seven days over Today (USE-58; today/index.md,
 * D-USE-55): a card a day, Mon to Sun, each with up to two lines (a work
 * item with its tier square and "2/3", an event with a plum dot and its time)
 * or its one word. Today carries "today" in the link's verdigris; the
 * selected day is outlined in ink, and filled `surface` when it is not today
 * (opened-day.md). Lengths and words only, never a count (D-USE-47).
 *
 * Desk-only: the screen mounts it inside `hidden split:block`. Under 1728
 * the cards keep `--strip-card-min` and the strip scrolls sideways. A card is
 * a link to its date (`hrefFor`); today's goes to Today itself.
 */
export interface WeekStripProps {
  days: readonly StripDayView[];
  /** The date the main column shows. */
  selected: string;
  hrefFor: (dateKey: string) => string;
  /** "today". */
  todayWord: string;
  /** The strip's name: "Week of 12 to 18 Oct". */
  label: string;
  className?: string;
}

export function WeekStrip({
  days,
  selected,
  hrefFor,
  todayWord,
  label,
  className,
}: WeekStripProps) {
  return (
    <nav aria-label={label} className={cn("overflow-x-auto", className)}>
      <ol className="flex gap-(--space-2)">
        {days.map((day) => (
          <li key={day.dateKey} className="min-w-(--strip-card-min) flex-1">
            <StripCard
              day={day}
              selected={day.dateKey === selected}
              href={hrefFor(day.dateKey)}
              todayWord={todayWord}
            />
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StripCard({
  day,
  selected,
  href,
  todayWord,
}: {
  day: StripDayView;
  selected: boolean;
  href: string;
  todayWord: string;
}) {
  return (
    <Link
      href={href}
      aria-current={selected ? "date" : undefined}
      className={cn(
        "flex h-full min-h-20 flex-col gap-(--space-1) rounded-(--radius-sheet) border px-(--space-3) py-(--space-3)",
        "transition-colors duration-(--dur-state) ease-(--ease-settle)",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected ? "border-foreground" : "border-border hover:bg-surface",
        selected && !day.isToday && "bg-surface",
      )}
    >
      <span className="sr-only">{day.name}</span>
      <span aria-hidden="true" className="flex items-baseline gap-(--space-2)">
        <Text
          as="span"
          variant="secondary"
          weight={600}
          tone={day.past ? "muted" : "ink"}
        >
          {day.head}
        </Text>
        {day.isToday ? (
          <Text as="span" variant="caption" className="text-link">
            {todayWord}
          </Text>
        ) : null}
      </span>
      {day.isToday ? <span className="sr-only">{`, ${todayWord}`}</span> : null}
      {day.lines.length === 0 ? (
        <Text as="span" variant="caption" tone="muted">
          {day.empty}
        </Text>
      ) : (
        <ul className="flex min-w-0 flex-col">
          {day.lines.map((line) => (
            <li
              key={line.id}
              className="flex min-w-0 items-center gap-(--space-2)"
            >
              <HueSquare
                hue={line.kind === "work" ? TIER_HUE[line.tier] : "plum"}
                className="shrink-0"
              />
              <Text
                as="span"
                variant="caption"
                tone={line.kind === "event" ? "muted" : "ink"}
                truncate
              >
                {line.kind === "work"
                  ? line.session
                    ? `${line.title} · ${line.session}`
                    : line.title
                  : `${line.time} ${line.title}`}
              </Text>
            </li>
          ))}
        </ul>
      )}
    </Link>
  );
}
