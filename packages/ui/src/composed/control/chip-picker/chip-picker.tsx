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
 *
 * UX v1.2 (RUN-8): the KIND chips — a work-day type's, a fixture's — are a
 * vocabulary, never a suggestion, and the sheet opens on none selected
 * without a *None* chip to say so: `noneLabel` may be omitted, and then
 * `value: null` is simply nothing chosen. An option may carry an `icon`
 * (its `IconValue`), drawn at the chip's leading edge through `ItemIcon`.
 */
"use client";

import type { CategoryKey, IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { CategoryChip } from "../../display/category-chip";
import { ItemIcon } from "../../display/item-icon";

export interface ChipPickerOption {
  value: string;
  label: string;
  colorKey?: CategoryKey;
  /** The kind's glyph (v1.2 §4.3, §4.4) — data, never in the label string. */
  icon?: IconValue;
}

export interface ChipPickerProps {
  options: readonly ChipPickerOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  /** The *None* chip; omit it for a vocabulary that opens on nothing chosen (v1.2). */
  noneLabel?: string;
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
        {noneLabel === undefined ? null : (
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
        )}

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
                <span className="inline-flex h-6 items-center gap-(--space-1) rounded-(--radius) bg-surface px-(--space-2) text-(length:--fs-caption)">
                  {option.icon === undefined ? null : <ItemIcon icon={option.icon} size={20} />}
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
