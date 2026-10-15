/**
 * MonthGrid — one month to pick a day from (USE-29; D-USE-37, D-USE-69):
 * Pick a day's month, the To-do sheet's Give it a day… and its reminder's
 * Pick a day…, and Move to's Pick a day after it.
 *
 * Not `DateField` and not a date picker in a popover: a month laid out in the
 * sheet, Monday first, the month and ‹ › above it. Past days (before
 * `minDate`) are faded and cannot be picked; today is ringed in ink; the
 * picked day is a filled ink disc; a marked day has a small dot under its
 * number, its meaning the caller's (`markLabel`, read after the day's name).
 *
 * Presentational: days are `YYYY-MM-DD` keys, the month `YYYY-MM`; the
 * caller holds the month and the pick. Nothing about to-dos or blocks
 * enters here.
 *
 * KEYBOARD (the grid pattern): one Tab stop on the grid; arrows move by day
 * and by week, Home and End to the week's ends, Page Up and Page Down by
 * month, crossing into the next month through `onMonth`; Enter or Space
 * picks. A past day takes focus, so the walk is unbroken, and refuses the
 * pick.
 */
"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Text } from "../../../primitives/typography/text";

export interface MonthGridProps {
  /** The month shown, `YYYY-MM`. */
  month: string;
  /** Today, `YYYY-MM-DD`: ringed in ink. */
  today: string;
  /** The picked day, a filled ink disc. */
  picked?: string | null;
  /** Days with a dot under the number. */
  marked?: readonly string[];
  /** Read after a marked day's name: "Already set for that day". */
  markLabel?: string;
  /** The first day that can be picked; every day before it is faded. */
  minDate?: string;
  onPick: (dateKey: string) => void;
  /** ‹, ›, or a key walking past the month's edge. */
  onMonth: (month: string) => void;
  className?: string;
}

export const MONTH_GRID_WORDS = {
  weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  weekdayNames: [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ],
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  previous: "Previous month",
  next: "Next month",
  today: "today",
} as const;

function parts(dateKey: string): [number, number, number] {
  const [y = 1970, m = 1, d = 1] = dateKey.split("-").map(Number);
  return [y, m, d];
}

function keyOf(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/** The day `n` days on from `dateKey`. */
export function shiftDay(dateKey: string, n: number): string {
  const [y, m, d] = parts(dateKey);
  return keyOf(new Date(Date.UTC(y, m - 1, d + n)));
}

/** The month `n` months on from `month` (`YYYY-MM`). */
export function shiftMonth(month: string, n: number): string {
  const [y, m] = parts(`${month}-01`);
  return keyOf(new Date(Date.UTC(y, m - 1 + n, 1))).slice(0, 7);
}

/** The same day `n` months on, held to the month's last day. */
function shiftDayByMonth(dateKey: string, n: number): string {
  const [y, m, d] = parts(dateKey);
  const last = new Date(Date.UTC(y, m - 1 + n + 1, 0)).getUTCDate();
  return keyOf(new Date(Date.UTC(y, m - 1 + n, Math.min(d, last))));
}

/** 0 for Monday to 6 for Sunday. */
function weekdayIndex(dateKey: string): number {
  const [y, m, d] = parts(dateKey);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}

/** The month's weeks, Monday first; a cell outside the month is null. */
export function monthWeeks(month: string): (string | null)[][] {
  const first = `${month}-01`;
  const [y, m] = parts(first);
  const length = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array.from(
    { length: weekdayIndex(first) },
    () => null,
  );
  for (let day = 0; day < length; day += 1) cells.push(shiftDay(first, day));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** "October 2026". */
export function monthTitle(month: string): string {
  const [y, m] = parts(`${month}-01`);
  return `${MONTH_GRID_WORDS.months[m - 1]} ${y}`;
}

/** "Thursday 15 October". */
function dayName(dateKey: string): string {
  const [, m, d] = parts(dateKey);
  return `${MONTH_GRID_WORDS.weekdayNames[weekdayIndex(dateKey)]} ${d} ${MONTH_GRID_WORDS.months[m - 1]}`;
}

const inMonth = (dateKey: string, month: string) =>
  dateKey.slice(0, 7) === month;

export function MonthGrid({
  month,
  today,
  picked = null,
  marked = [],
  markLabel,
  minDate,
  onPick,
  onMonth,
  className,
}: MonthGridProps) {
  const titleId = React.useId();
  const weeks = React.useMemo(() => monthWeeks(month), [month]);
  const markedSet = React.useMemo(() => new Set(marked), [marked]);
  const gridRef = React.useRef<HTMLTableElement>(null);
  // Set by a key, so focus follows the walk and never jumps in on its own.
  const moved = React.useRef(false);
  const [focusKey, setFocusKey] = React.useState<string | null>(null);

  const isPast = (dateKey: string) =>
    minDate !== undefined && dateKey < minDate;
  const firstOpen =
    minDate !== undefined && inMonth(minDate, month) ? minDate : `${month}-01`;
  // The one Tab stop: the walk's day, else the picked, today, or the first open day.
  const active =
    [focusKey, picked, today].find(
      (key): key is string => key != null && inMonth(key, month),
    ) ?? firstOpen;

  const atStart = minDate !== undefined && month <= minDate.slice(0, 7);

  React.useEffect(() => {
    if (!moved.current) return;
    moved.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>(`[data-day="${active}"]`)
      ?.focus();
  }, [active]);

  function walk(to: string) {
    // Never into a month before the first open one.
    const target =
      minDate !== undefined && to.slice(0, 7) < minDate.slice(0, 7)
        ? minDate
        : to;
    moved.current = true;
    setFocusKey(target);
    if (!inMonth(target, month)) onMonth(target.slice(0, 7));
  }

  function onKeyDown(event: React.KeyboardEvent, dateKey: string) {
    const steps: Record<string, () => string> = {
      ArrowLeft: () => shiftDay(dateKey, -1),
      ArrowRight: () => shiftDay(dateKey, 1),
      ArrowUp: () => shiftDay(dateKey, -7),
      ArrowDown: () => shiftDay(dateKey, 7),
      Home: () => shiftDay(dateKey, -weekdayIndex(dateKey)),
      End: () => shiftDay(dateKey, 6 - weekdayIndex(dateKey)),
      PageUp: () => shiftDayByMonth(dateKey, -1),
      PageDown: () => shiftDayByMonth(dateKey, 1),
    };
    const step = steps[event.key];
    if (step === undefined) return;
    event.preventDefault();
    walk(step());
  }

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <div className="flex items-center justify-between">
        <Text as="h3" id={titleId} variant="heading" aria-live="polite">
          {monthTitle(month)}
        </Text>
        <div className="-me-(--space-3) flex items-center">
          <Button
            variant="ghost"
            size="icon"
            aria-label={MONTH_GRID_WORDS.previous}
            disabled={atStart}
            onClick={() => onMonth(shiftMonth(month, -1))}
            className="disabled:text-muted-foreground disabled:opacity-100"
          >
            <ChevronLeft aria-hidden="true" className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label={MONTH_GRID_WORDS.next}
            onClick={() => onMonth(shiftMonth(month, 1))}
          >
            <ChevronRight aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </div>

      <table
        ref={gridRef}
        role="grid"
        aria-labelledby={titleId}
        className="w-full table-fixed border-collapse"
      >
        <thead>
          <tr>
            {MONTH_GRID_WORDS.weekdays.map((short, index) => (
              <th
                key={short}
                scope="col"
                abbr={MONTH_GRID_WORDS.weekdayNames[index]}
                className="pb-(--space-2)"
              >
                <Text as="span" variant="secondary" tone="muted">
                  {short}
                </Text>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, row) => (
            <tr key={week.find(Boolean) ?? row}>
              {week.map((dateKey, column) => {
                if (dateKey === null) {
                  return <td key={`blank-${column}`} aria-hidden="true" />;
                }
                const past = isPast(dateKey);
                const isPicked = dateKey === picked;
                const isToday = dateKey === today;
                const isMarked = markedSet.has(dateKey);
                const name = [
                  dayName(dateKey),
                  isToday ? MONTH_GRID_WORDS.today : null,
                  isMarked ? markLabel : null,
                ]
                  .filter(Boolean)
                  .join(", ");
                return (
                  <td
                    key={dateKey}
                    role="gridcell"
                    aria-selected={isPicked}
                    className="p-0 text-center"
                  >
                    <button
                      type="button"
                      data-day={dateKey}
                      tabIndex={dateKey === active ? 0 : -1}
                      aria-label={name}
                      aria-current={isToday ? "date" : undefined}
                      aria-disabled={past || undefined}
                      onClick={() => {
                        setFocusKey(dateKey);
                        if (!past) onPick(dateKey);
                      }}
                      onKeyDown={(event) => onKeyDown(event, dateKey)}
                      className={cn(
                        "group mx-auto flex h-12 w-full max-w-(--row-min) flex-col items-center justify-start pt-0.5 outline-none",
                        past && "cursor-default",
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          "flex size-9 items-center justify-center rounded-full border border-transparent",
                          "text-(length:--fs-body) tabular-nums",
                          "transition-colors duration-(--dur-state) ease-(--ease-settle) motion-reduce:transition-none",
                          "group-focus-visible:ring-ring group-focus-visible:ring-2 group-focus-visible:ring-offset-2",
                          past
                            ? "text-muted-foreground opacity-50"
                            : isPicked
                              ? "bg-foreground text-background font-medium"
                              : "text-foreground",
                          isToday && !isPicked && "border-foreground",
                        )}
                      >
                        {Number(dateKey.slice(8))}
                      </span>
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-0.5 size-1 rounded-full",
                          isMarked ? "bg-muted-foreground" : "bg-transparent",
                        )}
                      />
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
