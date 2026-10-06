/**
 * NumberUnitInput — a number with a trailing unit and optional preset chips
 * (v2 handoff §5.4).
 *
 * IT-01's quantity ("3 pages", "2 km"), TR-01's available minutes, SF-01's
 * custom shift. The unit is the habit's own word, so it is text beside the
 * field rather than a select — there is nothing to choose.
 *
 * The chips apply a *delta*, not a value: "+15" reads as an adjustment to what
 * is already there, which is how a person thinks about trimming a day.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../../../primitives/control/input-group";
import { HelperText } from "../../../primitives/display/helper-text";
import { Text } from "../../../primitives/typography/text";

export interface NumberUnitChip {
  label: string;
  delta: number;
}

export interface NumberUnitInputProps {
  value: number | null;
  onChange: (value: number | null) => void;
  /**
   * Fired when the field loses focus — where an autosaving caller commits.
   *
   * A number is not finished until someone stops typing: saving on every
   * keystroke would write "1", "12", "127" for one value of 127. IT-01 uses
   * this and a flush on close, which between them cover every way a person
   * leaves the field.
   */
  onBlur?: () => void;
  /** The habit's own word — "pages", "km", "min". */
  unit: string;
  min?: number;
  max?: number;
  decimal?: boolean;
  chips?: readonly NumberUnitChip[];
  label: React.ReactNode;
  helperText?: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function NumberUnitInput({
  value,
  onChange,
  onBlur,
  unit,
  min,
  max,
  decimal = false,
  chips,
  label,
  helperText,
  error,
  disabled = false,
  className,
}: NumberUnitInputProps) {
  const inputId = React.useId();
  const helperId = React.useId();
  const chipsLabelId = React.useId();

  const invalid = error !== undefined && error !== null;
  const message = error ?? helperText;

  const clamp = (next: number) => {
    const lower = min === undefined ? next : Math.max(min, next);
    return max === undefined ? lower : Math.min(max, lower);
  };

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="label" htmlFor={inputId} variant="secondary" weight={500}>
        {label}
      </Text>

      <InputGroup className="border-hairline h-(--target) w-fit">
        <InputGroupInput
          id={inputId}
          type="number"
          inputMode={decimal ? "decimal" : "numeric"}
          value={value ?? ""}
          min={min}
          max={max}
          step={decimal ? 0.1 : 1}
          disabled={disabled}
          aria-invalid={invalid || undefined}
          aria-describedby={message === undefined ? undefined : helperId}
          onBlur={onBlur}
          onChange={(event) => {
            const raw = event.target.value;
            if (raw === "") {
              onChange(null);
              return;
            }
            const parsed = decimal
              ? Number.parseFloat(raw)
              : Number.parseInt(raw, 10);
            if (!Number.isNaN(parsed)) onChange(clamp(parsed));
          }}
          className="w-24 text-center tabular-nums"
        />
        <InputGroupAddon align="inline-end">
          <InputGroupText className="pe-(--space-3)">{unit}</InputGroupText>
        </InputGroupAddon>
      </InputGroup>

      {chips === undefined || chips.length === 0 ? null : (
        <>
          <span id={chipsLabelId} className="sr-only">
            Quick adjustments
          </span>
          <div
            role="group"
            aria-labelledby={chipsLabelId}
            className="flex flex-wrap gap-(--space-2)"
          >
            {chips.map((chip) => (
              <Button
                key={chip.label}
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => onChange(clamp((value ?? 0) + chip.delta))}
              >
                {chip.label}
              </Button>
            ))}
          </div>
        </>
      )}

      {message === undefined ? null : (
        <HelperText id={helperId} error={invalid}>
          {message}
        </HelperText>
      )}
    </div>
  );
}
