/**
 * RangeEditor — a range on one compact line (UX v1.2 §10.2; RUN-7).
 *
 * *from · to · min* on a single 44px row, right-aligned, three-digit fields:
 * the habit sheet's *takes* under v1.2 sits in a card beside other facts and
 * has one line to say it in. `RangeInput` — LB-02's stacked pair with its own
 * label and helper — stays for the library sheet until RUN-15 retires it;
 * this is the compact form for the setup cards and the step sheet.
 *
 * INVALID IS ONE SENTENCE. When *to* is under *from* the row says *The second
 * number is the longer one.* in ink — never red, never a clamp (R21: the
 * range never limits a day). The two fields share the sentence through one
 * `aria-describedby`, so whichever has focus hears it.
 *
 * NEVER CLAMPS. The fields accept what is typed and `onChange` reports it;
 * whether the range fits a habit is the caller's rule. Blank is null.
 *
 * At 200% text the line stacks *to* under *from* (`flex-wrap`); nothing
 * scrolls sideways at 375px.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { inputSkin } from "../../../primitives/control/input";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";
import { RANGE_EDITOR_COPY } from "./copy";

export interface RangeEditorValue {
  from: number | null;
  to: number | null;
}

export interface RangeEditorProps {
  value: RangeEditorValue;
  onChange: (next: RangeEditorValue) => void;
  /** The row's label, read before the fields; visually the caption on the left. */
  label: React.ReactNode;
  /** Hide the label visually; it is still the group's name. */
  hideLabel?: boolean;
  /** The caller's sentence, over the built-in *to < from* one. */
  error?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

const parse = (raw: string): number | null => {
  if (raw === "") return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

const FIELD = cn(
  ...inputSkin,
  "h-(--target) w-[4.5rem] text-center tabular-nums outline-none",
  "disabled:cursor-not-allowed disabled:text-text-disabled",
);

export function RangeEditor({
  value,
  onChange,
  label,
  hideLabel = false,
  error,
  disabled = false,
  className,
}: RangeEditorProps) {
  const labelId = React.useId();
  const messageId = React.useId();

  const reversed = value.from !== null && value.to !== null && value.to < value.from;
  const message = error ?? (reversed ? RANGE_EDITOR_COPY.invalid : undefined);
  const invalid = message !== undefined && message !== null;

  return (
    <div
      role="group"
      aria-labelledby={labelId}
      aria-describedby={invalid ? messageId : undefined}
      data-invalid={invalid || undefined}
      className={cn("flex flex-col gap-(--space-1)", className)}
    >
      <div className="flex min-h-(--target) flex-wrap items-center justify-end gap-x-(--space-2) gap-y-(--space-1)">
        <Text
          as="span"
          id={labelId}
          variant="secondary"
          weight={500}
          className={cn("me-auto", hideLabel && "sr-only")}
        >
          {label}
        </Text>

        <input
          type="number"
          inputMode="numeric"
          aria-label={RANGE_EDITOR_COPY.fromLabel}
          aria-invalid={invalid || undefined}
          value={value.from ?? ""}
          min={0}
          max={999}
          disabled={disabled}
          onChange={(event) => onChange({ ...value, from: parse(event.target.value) })}
          className={cn(FIELD, invalid && "border-ink")}
        />
        <Text as="span" variant="secondary" tone="secondary" aria-hidden="true">
          {RANGE_EDITOR_COPY.to}
        </Text>
        <span className="flex items-center gap-(--space-2)">
          <input
            type="number"
            inputMode="numeric"
            aria-label={RANGE_EDITOR_COPY.toLabel}
            aria-invalid={invalid || undefined}
            value={value.to ?? ""}
            min={0}
            max={999}
            disabled={disabled}
            onChange={(event) => onChange({ ...value, to: parse(event.target.value) })}
            className={cn(FIELD, invalid && "border-ink")}
          />
          <Text as="span" variant="secondary" tone="secondary" aria-hidden="true">
            {RANGE_EDITOR_COPY.min}
          </Text>
        </span>
      </div>

      {invalid ? (
        <HelperText id={messageId} error className="text-end">
          {message}
        </HelperText>
      ) : null}
    </div>
  );
}
