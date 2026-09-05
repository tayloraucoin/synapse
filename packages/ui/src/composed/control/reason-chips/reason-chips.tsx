/**
 * ReasonChips — the reasons under a selected tier (v2 handoff §5.4).
 *
 * DR-03's second step, reached through `TierRadioRows`. A wrapping row of
 * single-select chips from the person's own reason set, plus *Other*, which
 * reveals a short text field and a *Keep this reason* action that adds it to
 * the set for next time.
 *
 * MAXLENGTH 80 (DR-03). A reason is a few words — "car wouldn't start" — not a
 * paragraph. The note field, which is where a paragraph belongs, is a separate
 * control at 280.
 *
 * Selected is a 1px ink outline over the chip's own surface, the same rule as
 * `ChipPicker`: eight filled words is a wall.
 */
"use client";

import type { ReasonView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";
import { Input } from "../../../primitives/control/input";
import { Text } from "../../../primitives/typography/text";

export const OTHER_REASON_KEY = "other";

const MAX_REASON_LENGTH = 80;

export interface ReasonChipsProps {
  reasons: readonly ReasonView[];
  value: string | null;
  onChange: (key: string) => void;
  otherText?: string;
  onOtherTextChange?: (text: string) => void;
  onKeepReason?: () => void;
  label: React.ReactNode;
  error?: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ReasonChips({
  reasons,
  value,
  onChange,
  otherText = "",
  onOtherTextChange,
  onKeepReason,
  label,
  error,
  disabled = false,
  className,
}: ReasonChipsProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();

  const chips: readonly { key: string; label: string }[] = [
    ...reasons.map((reason) => ({ key: reason.key, label: reason.label })),
    { key: OTHER_REASON_KEY, label: "Other" },
  ];

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="caption" tone="secondary">
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="flex flex-wrap gap-(--space-2)"
      >
        {chips.map((chip) => {
          const selected = chip.key === value;

          return (
            <label
              key={chip.key}
              className={cn(
                "inline-flex min-h-(--target) cursor-pointer items-center",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 rounded-(--radius-full)",
                disabled && "pointer-events-none opacity-40",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={chip.key}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(chip.key)}
                className="sr-only"
              />
              <span
                className={cn(
                  "inline-flex h-8 items-center rounded-(--radius-full) border px-(--space-3)",
                  "text-(length:--fs-caption)",
                  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
                  selected
                    ? "border-ink text-ink bg-surface"
                    : "text-text-body border-transparent bg-surface hover:bg-fill-muted",
                )}
              >
                {chip.label}
              </span>
            </label>
          );
        })}
      </div>

      {value === OTHER_REASON_KEY && onOtherTextChange !== undefined ? (
        <div className="flex flex-col gap-(--space-2)">
          <Input
            aria-label="Reason"
            value={otherText}
            maxLength={MAX_REASON_LENGTH}
            error={error}
            disabled={disabled}
            onChange={(event) => onOtherTextChange(event.target.value)}
          />
          {onKeepReason === undefined ? null : (
            <Button
              variant="ghost"
              size="sm"
              disabled={disabled || otherText.trim() === ""}
              onClick={onKeepReason}
              className="self-start"
            >
              Keep this reason
            </Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
