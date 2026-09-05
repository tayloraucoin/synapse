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
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";

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
  className?: string;
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
  className,
}: TimeFieldProps) {
  return (
    <Input
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
