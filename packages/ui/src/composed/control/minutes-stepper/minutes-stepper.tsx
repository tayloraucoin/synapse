/**
 * MinutesStepper — a bounded minutes field (v2 handoff §5.4).
 *
 * Over `input-group`: a number input, a *min* suffix, and −/+ addon buttons at
 * 44px.
 *
 * BY ONE, EMPTY ALLOWED, WRITTEN ON BLUR (UX v1.3 R62; DAY-1). The buttons
 * move by one — the handoff's *by 5* is amended (T9.1). The field can be
 * emptied: it holds `null` and shows *0* as its placeholder, so a person can
 * delete *9* and type *7* without the control putting a number back
 * mid-word. Nothing snaps before blur. On blur an empty field commits `min`
 * (a length of nothing is not a length); a typed value inside the bounds
 * commits as typed; outside them it clamps with the note. A `null` value
 * reads as the placeholder, and the first tap on *+* gives `min`.
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
 *
 * OPTIMISTIC BY RULE (UX v1.2 §2 guardrail 4, TD-18; RUN-7). The control's own
 * value changes on the tap: `useOptimisticValue` holds it locally, `onChange`
 * hears every change at once (a form's state), and `onCommit` — the write —
 * fires once after `STEPPER_COMMIT_DEBOUNCE_MS` of quiet across any number of
 * taps. While the write is in flight the group's edge pulses; nothing is
 * disabled. A rejected write reverts the value to the last `value` and hands
 * the error to `onCommitError` for the screen's one line.
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
  InputGroupText,
} from "../../../primitives/control/input-group";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { MINUTES_STEPPER_COPY } from "./copy";

const SNAP_NOTE_MS = 2000;

export interface MinutesStepperProps {
  value: number | null;
  /** Every local change, at once — for a form's own state. */
  onChange?: (value: number) => void;
  /** The write, debounced by the control; reject to revert. */
  onCommit?: (value: number) => Promise<void> | void;
  /** The screen's word when it owns the request; the control's own is OR-ed in. */
  committing?: boolean;
  /** After a rejected commit has reverted the value. */
  onCommitError?: (error: unknown) => void;
  min: number;
  max: number;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** Show the snap note for two seconds after a clamp. */
  boundedNote?: boolean;
  /**
   * UX v1.2 §4.7 (RUN-10) — the length row: a 56px field and no *min* suffix,
   * so handle · glyph · title · stepper · menu fit one 375px line. The unit
   * is in the accessible name (*Length, Breakfast*) and the row's meaning.
   */
  compact?: boolean;
  disabled?: boolean;
  className?: string;
}

export function MinutesStepper({
  value,
  onChange,
  onCommit,
  committing: committingProp = false,
  onCommitError,
  min,
  max,
  label,
  helperText,
  error,
  boundedNote = true,
  compact = false,
  disabled = false,
  className,
}: MinutesStepperProps) {
  const inputId = React.useId();
  const helperId = React.useId();
  const [snapped, setSnapped] = React.useState(false);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const typed = React.useRef(false);

  const { local, set, hold, committing: writing } = useOptimisticValue<number | null>({
    value,
    onCommit: onCommit === undefined ? undefined : (next) => (next === null ? undefined : onCommit(next)),
    onError: onCommitError,
  });
  const committing = committingProp || writing;

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
      set(clamped);
      onChange?.(clamped);
    },
    [boundedNote, max, min, onChange, set],
  );

  const current = local ?? min;
  // An empty field steps to `min` first — the placeholder is not a value to step from.
  const stepBy = (delta: -1 | 1) => commit(local === null ? min : local + delta);
  const invalid = error !== undefined && error !== null;
  const message = error ?? (snapped ? MINUTES_STEPPER_COPY.boundedNote : helperText);

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
            aria-label="Fewer minutes"
            disabled={disabled || current <= min}
            onClick={() => stepBy(-1)}
            className="size-(--target) rounded-none text-(length:--fs-body)"
          >
            −
          </InputGroupButton>
        </InputGroupAddon>

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
          aria-invalid={invalid || undefined}
          aria-describedby={message === undefined ? undefined : helperId}
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
            commit(Number.isNaN(parsed) ? min : parsed);
          }}
          className={cn(
            "placeholder:text-text-disabled text-center tabular-nums",
            compact ? "w-14" : "w-[88px]",
          )}
        />

        <InputGroupAddon align="inline-end" className="gap-0 p-0">
          {compact ? null : <InputGroupText className="px-(--space-2)">min</InputGroupText>}
          <InputGroupButton
            aria-label="More minutes"
            disabled={disabled || current >= max}
            onClick={() => stepBy(1)}
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
