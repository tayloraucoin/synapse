"use client";

import { Button, cn, Text } from "@syn/ui";

/**
 * LengthStepper — one end of a work item's length, "− 1 h +" (USE-65; the
 * size dev note): − and + move it, the value between in its own unit. The
 * steps and the words are the caller's (`stepLength`, `lengthWords`), so the
 * rule lives in one place. A `null` value reads "—" and + gives `start`.
 * The group is named by `label` and says its value, so a screen reader hears
 * "From, 1 h" before the buttons. Props only.
 */
export interface LengthStepperProps {
  /** The group's name: "From", "To", "Length". */
  label: string;
  value: number | null;
  /** "1 h", "45 min". */
  words: (minutes: number) => string;
  /** The next value either way; null when it cannot go further. */
  step: (minutes: number, by: -1 | 1) => number | null;
  /** + on an empty stepper. */
  start: number;
  stepLabels: { decrease: string; increase: string };
  onChange: (minutes: number) => void;
  className?: string;
}

export function LengthStepper({
  label,
  value,
  words,
  step,
  start,
  stepLabels,
  onChange,
  className,
}: LengthStepperProps) {
  const shown = value === null ? "—" : words(value);
  const down = value === null ? null : step(value, -1);
  const up = value === null ? start : step(value, 1);

  return (
    <div
      role="group"
      aria-label={`${label}, ${shown}`}
      className={cn(
        "border-hairline bg-background flex h-(--target) min-w-0 flex-1 items-center rounded-(--radius-control) border",
        className,
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        aria-label={stepLabels.decrease}
        disabled={down === null}
        onClick={() => down !== null && onChange(down)}
      >
        −
      </Button>
      <Text
        as="span"
        variant="body"
        aria-live="polite"
        className="flex-1 text-center tabular-nums"
      >
        {shown}
      </Text>
      <Button
        variant="ghost"
        size="icon"
        aria-label={stepLabels.increase}
        disabled={up === null}
        onClick={() => up !== null && onChange(up)}
      >
        +
      </Button>
    </div>
  );
}
