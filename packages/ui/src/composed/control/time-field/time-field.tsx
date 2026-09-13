/**
 * TimeField — a native time input with our reading of it (v2 handoff §5.4).
 *
 * Over `Input mode="time"`, which already sets `type="time"`. The wrapper adds
 * `min`/`max` bounds and a read-back line in the *day's* zone, so a person
 * editing a time while travelling sees the value the day will use.
 *
 * THE NATIVE PICKER, ON BOTH PLATFORMS (Epic 1 §0.3). The wheel on iOS and the
 * clock dial on Android are what people already know, and a custom picker
 * would be a worse version of both plus a keyboard story to write.
 *
 * The value is "HH:mm" — a wall-clock string, not an instant. A time slot in a
 * template has no date, so it cannot be a `Date`; turning it into one is the
 * caller's job, on the day it belongs to.
 *
 * `disclosed` — UX v1.1 §4 (the frame, once), W1: "Pre-filled fields show
 * **value + Change** and open their control only on demand." The field
 * renders its value as a labelled line with a ghost *Change* beside it;
 * tapping opens the picker in place and moves focus into it. A field that
 * is usually left alone should read as an answer, not as a question.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";

export interface TimeFieldProps {
  /** "HH:mm", or null for empty. */
  value: string | null;
  onChange: (value: string) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  /** "HH:mm" bounds passed through to the native picker. */
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  /** Value + *Change*; the picker opens on demand (W1). */
  disclosed?: boolean;
  /** The *Change* button's text; the label is read after it. */
  changeLabel?: string;
  /** "9:00" — the value as the line shows it; defaults to a plain reading of `HH:mm`. */
  formatValue?: (value: string) => string;
  className?: string;
}

function readClock(value: string): string {
  const [hour = "0", minute = "00"] = value.split(":");
  return `${Number(hour)}:${minute}`;
}

export function TimeField({
  value,
  onChange,
  label,
  helperText,
  error,
  min,
  max,
  required = false,
  disabled = false,
  disclosed = false,
  changeLabel = "Change",
  formatValue = readClock,
  className,
}: TimeFieldProps) {
  const [open, setOpen] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const labelId = React.useId();

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  if (disclosed && !open) {
    return (
      <div className={cn("flex flex-col gap-(--space-1)", className)}>
        <Text as="span" id={labelId} variant="secondary" weight={500}>
          {label}
        </Text>
        <div className="flex min-h-(--target) items-center justify-between gap-(--space-3)">
          <Text as="span" variant="body" className="tabular-nums" aria-labelledby={labelId}>
            {value === null || value === "" ? "—" : formatValue(value)}
          </Text>
          <Button
            variant="ghost"
            size="sm"
            disabled={disabled}
            aria-describedby={labelId}
            onClick={() => setOpen(true)}
          >
            {changeLabel}
          </Button>
        </div>
        {helperText ? (
          <Text as="span" variant="caption" tone="secondary">
            {helperText}
          </Text>
        ) : null}
      </div>
    );
  }

  return (
    <Input
      ref={inputRef}
      mode="time"
      label={label}
      helperText={helperText}
      error={error}
      value={value ?? ""}
      min={min}
      max={max}
      required={required}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className={cn("tabular-nums", className)}
    />
  );
}
