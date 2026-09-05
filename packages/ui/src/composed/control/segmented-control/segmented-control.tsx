/**
 * SegmentedControl — a 2–3 option choice with a value-keyed helper
 * (v2 handoff §5.4).
 *
 * Adapted from CC's: the generic `T`, the radiogroup structure and the
 * required accessible name are kept. Synapse's changes are a *visible* label
 * (CC used `aria-label` only — a control whose name is invisible is a control
 * a sighted person has to infer), the cell skin at full width, and `helper`,
 * which shows the selected option's explanation under the group so the
 * difference between "At a time" and "Anytime" is readable without tapping.
 *
 * Native radios again, for the reasons in `Stepper17`.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";

export interface SegmentedControlOption<T extends string> {
  value: T;
  label: React.ReactNode;
  /** Shown under the group while this option is selected. */
  helper?: React.ReactNode;
}

export interface SegmentedControlClasses {
  root?: string;
  label?: string;
  group?: string;
  item?: string;
  helper?: string;
}

export interface SegmentedControlProps<T extends string> {
  options: readonly SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
  label: React.ReactNode;
  disabled?: boolean;
  classes?: SegmentedControlClasses;
  className?: string;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  disabled = false,
  classes,
  className,
}: SegmentedControlProps<T>) {
  const groupName = React.useId();
  const labelId = React.useId();
  const helperId = React.useId();

  const helper = options.find((option) => option.value === value)?.helper;

  return (
    <div
      className={cn("flex flex-col gap-(--space-2)", className, classes?.root)}
    >
      <Text
        as="span"
        id={labelId}
        variant="secondary"
        weight={500}
        className={classes?.label}
      >
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={labelId}
        aria-describedby={helper === undefined ? undefined : helperId}
        className={cn(
          "border-hairline flex w-full overflow-hidden rounded-(--radius) border",
          classes?.group,
        )}
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex h-(--target) flex-1 cursor-pointer items-center justify-center",
                "border-hairline text-(length:--fs-secondary) font-medium",
                "border-s first:border-s-0",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-inset",
                selected
                  ? "bg-primary text-primary-foreground"
                  : "text-ink hover:bg-surface",
                disabled && "pointer-events-none opacity-40",
                classes?.item,
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              <span>{option.label}</span>
            </label>
          );
        })}
      </div>

      {helper === undefined ? null : (
        <HelperText id={helperId} className={classes?.helper}>
          {helper}
        </HelperText>
      )}
    </div>
  );
}
