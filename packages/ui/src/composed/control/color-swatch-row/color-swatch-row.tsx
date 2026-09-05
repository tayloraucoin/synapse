/**
 * ColorSwatchRow — the eight category hues (v2 handoff §5.4).
 *
 * CT-02's category colour and `CuratedIconGrid`'s tint. Eight 32px circles in
 * 44px cells, selected by a 2px ink ring at 2px offset — not by a checkmark
 * inside the circle, which would sit on eight different backgrounds and be
 * illegible on at least two.
 *
 * THE NAME IS THE LABEL, ALWAYS. Official spec §9.3: colour never carries
 * meaning on its own. Each swatch's accessible name is its key word — *leaf*,
 * *sky*, *clay* — and on compact that word also shows beneath the row for the
 * selected swatch, so a person who cannot separate two hues can still tell
 * which one they picked.
 *
 * `allowNone` adds a leading "None" cell for habits that belong to no
 * category. It is a hairline ring rather than a hue, because the absence of a
 * category is not a ninth category.
 */
"use client";

import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

/** Static so Tailwind's scanner emits all eight — see CategoryChip. */
const SWATCH: Record<CategoryKey, string> = {
  leaf: "bg-cat-leaf-500",
  sky: "bg-cat-sky-500",
  clay: "bg-cat-clay-500",
  rose: "bg-cat-rose-500",
  amber: "bg-cat-amber-500",
  slate: "bg-cat-slate-500",
  plum: "bg-cat-plum-500",
  moss: "bg-cat-moss-500",
};

const KEYS = Object.keys(SWATCH) as CategoryKey[];

export type ColorSwatchValue = CategoryKey | "none" | null;

export interface ColorSwatchRowProps {
  value: ColorSwatchValue;
  onChange: (value: ColorSwatchValue) => void;
  allowNone?: boolean;
  label: React.ReactNode;
  disabled?: boolean;
  className?: string;
}

export function ColorSwatchRow({
  value,
  onChange,
  allowNone = false,
  label,
  disabled = false,
  className,
}: ColorSwatchRowProps) {
  const groupName = React.useId();
  const groupLabelId = React.useId();

  const options: readonly ColorSwatchValue[] = allowNone
    ? ["none", ...KEYS]
    : KEYS;

  return (
    <div className={cn("flex flex-col gap-(--space-2)", className)}>
      <Text as="span" id={groupLabelId} variant="secondary" weight={500}>
        {label}
      </Text>

      <div
        role="radiogroup"
        aria-labelledby={groupLabelId}
        className="flex flex-wrap gap-(--space-1)"
      >
        {options.map((option) => {
          const selected = value === option;
          const name = option === "none" ? "None" : (option ?? "");

          return (
            <label
              key={name}
              title={name}
              className={cn(
                "inline-flex size-(--target) cursor-pointer items-center justify-center rounded-(--radius)",
                "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
                disabled && "pointer-events-none opacity-40",
              )}
            >
              <input
                type="radio"
                name={groupName}
                value={name}
                checked={selected}
                disabled={disabled}
                onChange={() => onChange(option)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  "block size-8 rounded-full",
                  option === "none"
                    ? "border-neutral-300 border-2 border-dashed dark:border-neutral-600"
                    : SWATCH[option as CategoryKey],
                  selected && "ring-ink ring-2 ring-offset-2 ring-offset-(--paper)",
                )}
              />
              <span className="sr-only">{name}</span>
            </label>
          );
        })}
      </div>

      {value === null ? null : (
        <Text as="span" variant="caption" tone="secondary" className="wide:sr-only">
          {value === "none" ? "None" : value}
        </Text>
      )}
    </div>
  );
}
