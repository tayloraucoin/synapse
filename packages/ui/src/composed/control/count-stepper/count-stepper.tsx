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
 *
 * OPTIMISTIC BY RULE (UX v1.2 §2 guardrail 4, TD-18; RUN-7): the value moves
 * on the tap, `onChange` hears it at once, `onCommit` fires once after the
 * debounce, the edge pulses while the write is out, and a rejection reverts.
 * See `MinutesStepper` for the contract in full.
 *
 * BY ONE, EMPTY ALLOWED, WRITTEN ON BLUR (UX v1.3 R62; DAY-1). Typing holds
 * the value and writes nothing until blur — it used to commit every
 * keystroke. An emptied field holds `null` and shows *0* as its placeholder;
 * blur on empty commits `min`; a typed value outside the bounds clamps on
 * blur. A `null` value reads as the placeholder and the first *+* gives `min`.
 */
"use client";

import { useOptimisticValue } from "@syn/hooks/use-optimistic-value";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { COMMITTING_PULSE } from "../../../lib/committing";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "../../../primitives/control/input-group";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";

export interface CountStepperProps {
  /** `null` — nothing yet; the field shows the *0* placeholder. */
  value: number | null;
  /** Every local change, at once — for a form's own state. */
  onChange?: (value: number) => void;
  /** The write, debounced by the control; reject to revert. */
  onCommit?: (value: number) => Promise<void> | void;
  committing?: boolean;
  onCommitError?: (error: unknown) => void;
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
  onCommit,
  committing: committingProp = false,
  onCommitError,
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

  const typed = React.useRef(false);

  const { local, set, hold, committing: writing } = useOptimisticValue<number | null>({
    value,
    onCommit: onCommit === undefined ? undefined : (next) => (next === null ? undefined : onCommit(next)),
    onError: onCommitError,
  });
  const committing = committingProp || writing;

  const clamp = (next: number) => Math.min(max, Math.max(min, next));
  const change = (next: number) => {
    const clamped = clamp(next);
    set(clamped);
    onChange?.(clamped);
  };
  const current = local ?? min;
  // An empty field steps to `min` first — the placeholder is not a value to step from.
  const stepBy = (delta: -1 | 1) => change(local === null ? min : local + delta);
  const showZeroWord = zeroLabel !== undefined && local === 0;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="label" htmlFor={inputId} variant="secondary" weight={500}>
        {label}
      </Text>

      <InputGroup
        data-committing={committing || undefined}
        className={cn("border-hairline h-(--target) w-fit", committing && COMMITTING_PULSE)}
      >
        <InputGroupAddon align="inline-start" className="p-0">
          <InputGroupButton
            aria-label="One fewer"
            disabled={disabled || current <= min}
            onClick={() => stepBy(-1)}
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
          value={local ?? ""}
          placeholder="0"
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={local ?? undefined}
          aria-valuetext={showZeroWord ? zeroLabel : undefined}
          aria-describedby={helperText === undefined ? undefined : helperId}
          onChange={(event) => {
            typed.current = true;
            // Emptied: the field holds nothing and shows the placeholder; blur decides.
            if (event.target.value === "") {
              hold(null);
              return;
            }
            const parsed = Number.parseInt(event.target.value, 10);
            if (Number.isNaN(parsed)) return;
            // Mid-typing: the control shows it, the form hears it, the write waits for blur.
            hold(parsed);
            onChange?.(parsed);
          }}
          onBlur={(event) => {
            // A field focused and left untouched writes nothing.
            if (!typed.current) return;
            typed.current = false;
            const parsed = Number.parseInt(event.target.value, 10);
            change(Number.isNaN(parsed) ? min : parsed);
          }}
          className={cn(
            "placeholder:text-text-disabled w-14 text-center tabular-nums",
            showZeroWord && "sr-only",
          )}
        />

        <InputGroupAddon align="inline-end" className="p-0">
          <InputGroupButton
            aria-label="One more"
            disabled={disabled || current >= max}
            onClick={() => stepBy(1)}
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
