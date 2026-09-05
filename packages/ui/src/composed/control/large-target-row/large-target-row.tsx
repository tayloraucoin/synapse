/**
 * LargeTargetRow — four big choices in a row (v2 handoff §5.4).
 *
 * SF-01 step 1: "how far behind are you?", answered while running late, one
 * handed, probably walking. Four 56px targets, no scrolling, no typing.
 *
 * The selected option becomes `default` (ink fill) and the rest stay
 * `secondary`, so the answer is visible from arm's length. Native radios, as
 * everywhere else in this package, for arrow-key movement and a real
 * radiogroup.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface LargeTargetOption {
  value: string;
  label: string;
}

export interface LargeTargetRowProps {
  options: readonly LargeTargetOption[];
  value: string | null;
  onChange: (value: string) => void;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function LargeTargetRow({
  options,
  value,
  onChange,
  label,
  disabled = false,
  className,
}: LargeTargetRowProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="flex gap-(--space-2)"
      >
        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label
              key={option.value}
              className={cn(
                "flex h-14 flex-1 cursor-pointer items-center justify-center rounded-(--radius)",
                "text-(length:--fs-body) font-medium",
                "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                selected
                  ? "bg-primary text-primary-foreground border border-transparent"
                  : "border-hairline text-ink border hover:bg-neutral-100 dark:hover:bg-neutral-800",
                disabled && "pointer-events-none opacity-40",
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
    </div>
  );
}
