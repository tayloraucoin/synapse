/**
 * RangeInput — the from/to minutes pair (v2 handoff §5.4).
 *
 * LB-02's "how long does this usually take": two numbers with the word *to*
 * between them and *min* after. Not a slider — official spec §9.7 — and not
 * two separate fields, because the pair is one fact and shares one helper and
 * one error.
 *
 * Both inputs point at the same `aria-describedby`, so whichever one has focus
 * hears the same rule. Validation is the parent's: a range is only wrong in
 * relation to the habit it belongs to, and this component does not know that.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Input } from "../../../primitives/control/input";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";

export interface RangeValue {
  from: number | null;
  to: number | null;
}

export interface RangeInputProps {
  from: number | null;
  to: number | null;
  onChange: (next: RangeValue) => void;
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

const parse = (raw: string): number | null => {
  if (raw === "") return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
};

export function RangeInput({
  from,
  to,
  onChange,
  label,
  helperText,
  error,
  required = false,
  disabled = false,
  className,
}: RangeInputProps) {
  const groupLabelId = React.useId();
  const helperId = React.useId();
  const fromId = React.useId();
  const toId = React.useId();

  const invalid = error !== undefined && error !== null;
  const message = error ?? helperText;
  const described = message === undefined ? undefined : helperId;

  return (
    <div
      role="group"
      aria-labelledby={groupLabelId}
      className={cn("flex flex-col gap-(--space-2)", className)}
    >
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div className="flex items-center gap-(--space-2)">
        <Input
          id={fromId}
          mode="number"
          inputMode="numeric"
          aria-label="From"
          value={from ?? ""}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={described}
          onChange={(event) =>
            onChange({ from: parse(event.target.value), to })
          }
          className="w-24 text-center tabular-nums"
        />
        <Text as="span" variant="secondary" tone="secondary">
          to
        </Text>
        <Input
          id={toId}
          mode="number"
          inputMode="numeric"
          aria-label="To"
          value={to ?? ""}
          required={required}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={described}
          onChange={(event) =>
            onChange({ from, to: parse(event.target.value) })
          }
          className="w-24 text-center tabular-nums"
        />
        <Text as="span" variant="secondary" tone="secondary">
          min
        </Text>
      </div>

      {message === undefined ? null : (
        <HelperText id={helperId} error={invalid}>
          {message}
        </HelperText>
      )}
    </div>
  );
}
