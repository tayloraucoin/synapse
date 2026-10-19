"use client";

import { cn, RadioGroup, RadioGroupItem, Text } from "@syn/ui";

/**
 * DayPick — one day of the week, letter over date (USE-67;
 * sub-issue-alone.md): seven chips, one pick, filled ink when picked,
 * outlined otherwise; a day that can't take it (no Work block, already
 * past, already a session) dashed and greyed and not pickable. A radio
 * group named by its label; each chip named in full ("Thursday 15",
 * "Saturday 17, no Work block"). New task's DaysField is the many-day
 * sibling. Props only.
 */
export interface DayPickChip {
  dateKey: string;
  letter: string;
  date: number;
  /** "Thursday 15", "Saturday 17, no Work block". */
  name: string;
  disabled: boolean;
}

export interface DayPickProps {
  label: string;
  chips: readonly DayPickChip[];
  value: string | null;
  onChange: (dateKey: string) => void;
}

export function DayPick({ label, chips, value, onChange }: DayPickProps) {
  return (
    <div className="flex flex-col gap-(--space-2)">
      <Text
        as="span"
        variant="secondary"
        className="text-foreground font-semibold"
      >
        {label}
      </Text>
      <RadioGroup
        aria-label={label}
        value={value ?? ""}
        onValueChange={onChange}
        className="grid w-full grid-cols-7 gap-(--space-1)"
      >
        {chips.map((chip) => {
          const on = chip.dateKey === value;
          return (
            <label
              key={chip.dateKey}
              data-day={chip.dateKey}
              className={cn(
                "relative flex h-12 min-w-0 flex-col items-center justify-center rounded-(--radius) border",
                "focus-within:ring-ring focus-within:ring-2 focus-within:ring-offset-2",
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-hairline bg-background text-foreground cursor-pointer",
                chip.disabled &&
                  "text-muted-foreground cursor-default border-dashed bg-transparent opacity-60",
              )}
            >
              <RadioGroupItem
                value={chip.dateKey}
                disabled={chip.disabled}
                aria-label={chip.name}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className="text-(length:--fs-caption) leading-none"
              >
                {chip.letter}
              </span>
              <span
                aria-hidden="true"
                className="text-(length:--fs-body) leading-tight font-medium"
              >
                {chip.date}
              </span>
            </label>
          );
        })}
      </RadioGroup>
    </div>
  );
}
