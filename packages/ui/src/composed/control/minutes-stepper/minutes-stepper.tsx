/**
 * MinutesStepper — a bounded minutes field (v2 handoff §5.4).
 *
 * Over `input-group`: a number input, a *min* suffix, and −/+ addon buttons at
 * 44px. The buttons move by 5 and typing allows 1, which is the difference
 * between adjusting and specifying.
 *
 * THE SNAP NOTE. When a typed value falls outside the habit's range it is
 * clamped, and the note says so for two seconds. Silently rewriting a person's
 * number is the thing to avoid; the note is what makes the clamp honest. The
 * timer is cleared on unmount and on every new clamp so a fast typist does not
 * stack them.
 *
 * `spinbutton` semantics come from `type="number"` plus explicit
 * `aria-valuemin/max/now`, because the visible value is the clamped one and a
 * screen reader should read the same bounds the buttons enforce.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "../../../primitives/control/input-group";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { MINUTES_STEPPER_COPY } from "./copy";

const SNAP_NOTE_MS = 2000;

export interface MinutesStepperProps {
  value: number | null;
  onChange: (value: number) => void;
  min: number;
  max: number;
  /** 5 by button; typing always allows 1. */
  step?: 5 | 1;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** Show the snap note for two seconds after a clamp. */
  boundedNote?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MinutesStepper({
  value,
  onChange,
  min,
  max,
  step = 5,
  label,
  helperText,
  error,
  boundedNote = true,
  disabled = false,
  className,
}: MinutesStepperProps) {
  const inputId = React.useId();
  const helperId = React.useId();
  const [snapped, setSnapped] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  const commit = React.useCallback(
    (next: number) => {
      const clamped = Math.min(max, Math.max(min, next));
      if (clamped !== next && boundedNote) {
        if (timer.current !== null) clearTimeout(timer.current);
        setSnapped(true);
        timer.current = setTimeout(() => setSnapped(false), SNAP_NOTE_MS);
      }
      onChange(clamped);
    },
    [boundedNote, max, min, onChange],
  );

  const current = value ?? min;
  const invalid = error !== undefined && error !== null;
  const message = error ?? (snapped ? MINUTES_STEPPER_COPY.boundedNote : helperText);

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="label" htmlFor={inputId} variant="secondary" weight={500}>
        {label}
      </Text>

      <InputGroup className="border-hairline h-(--target) w-fit">
        <InputGroupAddon align="inline-start" className="p-0">
          <InputGroupButton
            aria-label="Fewer minutes"
            disabled={disabled || current <= min}
            onClick={() => commit(current - step)}
            className="size-(--target) rounded-none text-(length:--fs-body)"
          >
            −
          </InputGroupButton>
        </InputGroupAddon>

        <InputGroupInput
          id={inputId}
          type="number"
          inputMode="numeric"
          value={value ?? ""}
          min={min}
          max={max}
          step={1}
          disabled={disabled}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value ?? undefined}
          aria-invalid={invalid || undefined}
          aria-describedby={message === undefined ? undefined : helperId}
          onChange={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            if (!Number.isNaN(parsed)) onChange(parsed);
          }}
          onBlur={(event) => {
            const parsed = Number.parseInt(event.target.value, 10);
            commit(Number.isNaN(parsed) ? min : parsed);
          }}
          className="w-[88px] text-center tabular-nums"
        />

        <InputGroupAddon align="inline-end" className="gap-0 p-0">
          <InputGroupText className="px-(--space-2)">min</InputGroupText>
          <InputGroupButton
            aria-label="More minutes"
            disabled={disabled || current >= max}
            onClick={() => commit(current + step)}
            className="size-(--target) rounded-none text-(length:--fs-body)"
          >
            +
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>

      {message === undefined ? null : (
        <HelperText id={helperId} error={invalid}>
          {message}
        </HelperText>
      )}
    </div>
  );
}
