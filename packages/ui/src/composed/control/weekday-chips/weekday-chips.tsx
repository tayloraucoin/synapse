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

export interface WeekdayChipsProps {
  value: ReadonlyArray<Weekday>;
  onChange: (next: Weekday[]) => void;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function WeekdayChips({
  value,
  onChange,
  label,
  disabled = false,
  className,
}: WeekdayChipsProps) {
  const groupLabelId = React.useId();
  const selected = new Set(value);

  const toggle = (day: Weekday) => {
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    onChange(DAYS.map((d) => d.value).filter((d) => next.has(d)));
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
        {DAYS.map((day) => {
          const isOn = selected.has(day.value);

          return (
            <label
              key={day.name}
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
              <span className="sr-only">{day.name}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
