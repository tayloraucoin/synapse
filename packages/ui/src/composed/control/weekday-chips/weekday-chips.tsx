/**
 * WeekdayChips — the seven-day multi-select (v2 handoff §5.4).
 *
 * TP-02's "which days does this template run". Seven 44×44 cells showing the
 * single-letter initial, with the full weekday name visually hidden inside the
 * label — "M T W T F S S" is unreadable to a screen reader and ambiguous even
 * to a person (two Ts, two Ss), so the letter is decoration and the word is
 * the name.
 *
 * Native checkboxes: a multi-select is checkboxes, and the browser then gives
 * Space to toggle and one Tab stop per day, which is correct here — unlike a
 * radiogroup, there is no single value to rove between.
 *
 * Days are 0–6 with 0 = Sunday, matching `Date.getDay()` so nothing has to
 * remember an offset. The visual order starts on Monday, which is how the week
 * grid reads (Epic 1 WK-01).
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export type Weekday = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/** Monday first for display; the value is still `Date.getDay()`. */
const DAYS: readonly { value: Weekday; initial: string; name: string }[] = [
  { value: 1, initial: "M", name: "Monday" },
  { value: 2, initial: "T", name: "Tuesday" },
  { value: 3, initial: "W", name: "Wednesday" },
  { value: 4, initial: "T", name: "Thursday" },
  { value: 5, initial: "F", name: "Friday" },
  { value: 6, initial: "S", name: "Saturday" },
  { value: 0, initial: "S", name: "Sunday" },
];

/**
 * UX v1.1 (DYN-7): `fixtures.weekdays`, `habits.typical_days` and
 * `users.work_days` count Monday as 0 (`@syn/types` `Weekday`), while this
 * control has always spoken `Date.getDay()` (Sunday as 0). `indexing="monday"`
 * makes the value Monday-first in and out, so a caller storing a fixture's
 * days never carries an offset in its own code — the two conventions meet
 * here and nowhere else.
 */
export type WeekdayIndexing = "date" | "monday";

/** `Date.getDay()` → Monday-first. */
function toMondayFirst(day: Weekday): Weekday {
  return ((day + 6) % 7) as Weekday;
}

/** Monday-first → `Date.getDay()`. */
function toDateDay(day: Weekday): Weekday {
  return ((day + 1) % 7) as Weekday;
}

export interface WeekdayChipsProps {
  value: ReadonlyArray<Weekday>;
  onChange: (next: Weekday[]) => void;
  label: React.ReactNode;
  disabled?: boolean;
  /** Which convention `value` and `onChange` speak. Default: `Date.getDay()`. */
  indexing?: WeekdayIndexing;
  /**
   * UX v1.2 §4.11 (RUN-7) — a leading *Flexible* chip: set, it clears every
   * day and renders ink; picking a day clears it. `undefined` hides the chip.
   */
  flexible?: boolean;
  onFlexible?: (flexible: boolean) => void;
  flexibleLabel?: string;
  /**
   * UX v1.2 §4.13a (RUN-12) — a word beneath a chip, in `value`'s indexing:
   * the other plan that holds the day (*Day A's*). Read after the day's name.
   */
  notes?: Partial<Record<Weekday, string>>;
  className?: string;
}

export function WeekdayChips({
  value,
  onChange,
  label,
  disabled = false,
  indexing = "date",
  flexible,
  onFlexible,
  flexibleLabel = "Flexible",
  notes,
  className,
}: WeekdayChipsProps) {
  const groupLabelId = React.useId();
  const selected = new Set(indexing === "monday" ? value.map(toDateDay) : value);
  const showFlexible = flexible !== undefined;
  const noteFor = (day: Weekday): string | undefined =>
    notes?.[indexing === "monday" ? toMondayFirst(day) : day];
  const anyNote = DAYS.some((day) => noteFor(day.value) !== undefined);

  const toggle = (day: Weekday) => {
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    const ordered = DAYS.map((d) => d.value).filter((d) => next.has(d));
    onChange(indexing === "monday" ? ordered.map(toMondayFirst) : ordered);
    // A day is a day; the week is no longer flexible.
    if (flexible) onFlexible?.(false);
  };

  const toggleFlexible = () => {
    const next = !flexible;
    onFlexible?.(next);
    // Flexible clears the days — the two are one answer.
    if (next && value.length > 0) onChange([]);
  };

  return (
    <div
      role="group"
      aria-labelledby={groupLabelId}
      className={cn("flex flex-col gap-(--space-2)", className)}
    >
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div className="flex flex-wrap gap-(--space-1)">
        {showFlexible ? (
          <label
            className={cn(
              "inline-flex h-(--target) cursor-pointer items-center justify-center px-(--space-3)",
              "rounded-(--radius) text-(length:--fs-body) font-medium",
              "transition-colors duration-(--dur-state) ease-(--ease-settle)",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
              flexible
                ? "bg-primary text-primary-foreground border border-transparent"
                : "border-edge text-ink border hover:bg-surface",
              disabled && "pointer-events-none opacity-40",
            )}
          >
            <input
              type="checkbox"
              checked={flexible}
              disabled={disabled}
              onChange={toggleFlexible}
              className="sr-only"
            />
            <span>{flexibleLabel}</span>
          </label>
        ) : null}
        {DAYS.map((day) => {
          const isOn = selected.has(day.value);
          const note = noteFor(day.value);

          return (
            <span key={day.name} className="inline-flex flex-col items-center gap-(--space-1)">
              <label
                className={cn(
                  "inline-flex size-(--target) cursor-pointer items-center justify-center",
                  "rounded-(--radius) text-(length:--fs-body) font-medium",
                  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                  "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                  isOn
                    ? "bg-primary text-primary-foreground border border-transparent"
                    : "border-edge text-ink border hover:bg-surface",
                  disabled && "pointer-events-none opacity-40",
                )}
              >
                <input
                  type="checkbox"
                  checked={isOn}
                  disabled={disabled}
                  onChange={() => toggle(day.value)}
                  className="sr-only"
                />
                <span aria-hidden="true">{day.initial}</span>
                <span className="sr-only">{note === undefined ? day.name : `${day.name}, ${note}`}</span>
              </label>
              {/* The note beneath keeps every column the same height once any day has one. */}
              {anyNote ? (
                <Text as="span" variant="caption" tone="secondary" aria-hidden="true" className="max-w-(--target) truncate">
                  {note ?? " "}
                </Text>
              ) : null}
            </span>
          );
        })}
      </div>
    </div>
  );
}
