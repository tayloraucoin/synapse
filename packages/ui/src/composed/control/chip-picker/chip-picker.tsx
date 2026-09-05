/**
 * ChipPicker — single-select from labelled chips, with a create row
 * (v2 handoff §5.4).
 *
 * LB-02's category field. Chips rather than a select because the set is small,
 * already coloured, and worth seeing at once; a select would hide seven of
 * eight categories behind a tap.
 *
 * Selected is a 1px ink outline, not a fill: category chips already carry
 * their own hue, and filling one would produce a colour pair the token file
 * never authored.
 *
 * `noneLabel` is always present and always first — "no category" is a real
 * answer, and making it a chip means it is chosen rather than left behind.
 */
"use client";

import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { CategoryChip } from "../../display/category-chip";

export interface ChipPickerOption {
  value: string;
  label: string;
  colorKey?: CategoryKey;
}

export interface ChipPickerProps {
  options: readonly ChipPickerOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  noneLabel: string;
  createLabel?: string;
  onCreate?: () => void;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ChipPicker({
  options,
  value,
  onChange,
  noneLabel,
  createLabel,
  onCreate,
  label,
  disabled = false,
  className,
}: ChipPickerProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();

  const chipShell = (selected: boolean) =>
    cn(
      "inline-flex min-h-(--target) cursor-pointer items-center rounded-(--radius-full)",
      "border px-(--space-1) py-(--space-1)",
      "transition-colors duration-(--dur-state) ease-(--ease-settle)",
      "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
      selected ? "border-ink" : "border-transparent",
      disabled && "pointer-events-none opacity-40",
    );

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="flex flex-wrap items-center gap-(--space-2)"
      >
        <label className={chipShell(value === null)}>
          <input
            type="radio"
            name={groupName}
            checked={value === null}
            disabled={disabled}
            onChange={() => onChange(null)}
            className="sr-only"
          />
          <span
            className={cn(
              "inline-flex h-6 items-center rounded-(--radius) px-(--space-2)",
              "bg-surface text-text-body text-(length:--fs-caption)",
            )}
          >
            {noneLabel}
          </span>
        </label>

        {options.map((option) => {
          const selected = option.value === value;

          return (
            <label key={option.value} className={chipShell(selected)}>
              <input
                type="radio"
                name={groupName}
                value={option.value}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option.value)}
                className="sr-only"
              />
              {option.colorKey === undefined ? (
                <span className="inline-flex h-6 items-center rounded-(--radius) bg-surface px-(--space-2) text-(length:--fs-caption)">
                  {option.label}
                </span>
              ) : (
                <CategoryChip
                  categoryKey={option.colorKey}
                  name={option.label}
                />
              )}
            </label>
          );
        })}

        {createLabel === undefined || onCreate === undefined ? null : (
          <button
            type="button"
            onClick={onCreate}
            disabled={disabled}
            className={cn(
              "text-ink inline-flex min-h-(--target) items-center px-(--space-2)",
              "text-(length:--fs-secondary) font-medium underline-offset-4 hover:underline",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
            )}
          >
            {createLabel}
          </button>
        )}
      </div>
    </div>
  );
}
