/**
 * DateField — `Input mode="date"` in TimeField's shape (v2 handoff §5.4).
 *
 * WK-03's *Day*, and nowhere else in Phase 1. Native `type="date"`, not a
 * calendar component: §2.6 rules out `calendar` and `date-picker` outright,
 * and one field on one screen does not earn a picker.
 *
 * The value is "YYYY-MM-DD" — a day key, matching what the rest of the
 * product routes and stores.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";

export interface DateFieldProps {
  /** "YYYY-MM-DD", or null for empty. */
  value: string | null;
  onChange: (value: string) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  min?: string;
  max?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export function DateField({
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
}: DateFieldProps) {
  return (
    <Input
      mode="date"
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
