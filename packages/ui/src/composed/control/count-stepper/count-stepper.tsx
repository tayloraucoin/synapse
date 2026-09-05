/**
 * CountStepper — the small 0–7 integer stepper (v2 handoff §8.2).
 *
 * TP-02's weekly target, inside the Target popover. Distinct from
 * `MinutesStepper` because the units differ in kind: minutes are a duration a
 * person estimates, a weekly target is a count they decide. Sharing one
 * component would mean a `unit` prop and a `step` prop that between them
 * describe two different questions.
 *
 * `zeroLabel` renders "none" in place of 0 — a target of zero is a real
 * choice (a habit kept in the library but not aimed at this week), and the
 * word says that where the digit reads like an empty field.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../primitives/control/input-group";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";

export interface CountStepperProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  /** Shown instead of "0" — usually "none". */
  zeroLabel?: string;
  disabled?: boolean;
  className?: string;
}

export function CountStepper({
  value,
  onChange,
  min,
  max,
  label,
  helperText,
  zeroLabel,
  disabled = false,
  className,
}: CountStepperProps) {
  const inputId = React.useId();
  const helperId = React.useId();

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const showZeroWord = zeroLabel !== undefined && value === 0;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="label" htmlFor={inputId} variant="secondary" weight={500}>
        {label}
      </Text>

      <InputGroup className="border-hairline h-(--target) w-fit">
        <InputGroupAddon align="inline-start" className="p-0">
          <InputGroupButton
            aria-label="One fewer"
            disabled={disabled || value <= min}
            onClick={() => onChange(clamp(value - 1))}
            className="size-(--target) rounded-none text-(length:--fs-body)"
          >
            −
          </InputGroupButton>
        </InputGroupAddon>

        {showZeroWord ? (
          <span
            aria-hidden="true"
            className="text-text-secondary flex w-14 items-center justify-center text-(length:--fs-secondary)"
          >
            {zeroLabel}
          </span>
        ) : null}

        <InputGroupInput
          id={inputId}
          type="number"
          inputMode="numeric"
          value={value}
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={showZeroWord ? zeroLabel : undefined}
          aria-describedby={helperText === undefined ? undefined : helperId}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            onChange(clamp(Number.isNaN(parsed) ? min : parsed));
          }}
          className={cn(
            "w-14 text-center tabular-nums",
            showZeroWord && "sr-only",
          )}
        />

        <InputGroupAddon align="inline-end" className="p-0">
          <InputGroupButton
            aria-label="One more"
            disabled={disabled || value >= max}
            onClick={() => onChange(clamp(value + 1))}
            className="size-(--target) rounded-none text-(length:--fs-body)"
          >
            +
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {helperText === undefined ? null : (
        <HelperText id={helperId}>{helperText}</HelperText>
      )}
    </div>
  );
}
