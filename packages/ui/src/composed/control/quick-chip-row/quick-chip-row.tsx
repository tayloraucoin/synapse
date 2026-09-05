/**
 * QuickChipRow — four quick adjustments (v2 handoff §5.4).
 *
 * TR-01's "−15 · −30 · −45 · −60". A `role="group"` of small secondary
 * buttons, not toggles: each tap applies a delta and nothing stays selected,
 * because the row is a set of actions, not a set of states.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";

export interface QuickChip {
  label: string;
  delta: number;
}

export interface QuickChipRowProps {
  chips: readonly QuickChip[];
  onApply: (delta: number) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

export function QuickChipRow({
  chips,
  onApply,
  label,
  disabled = false,
  className,
}: QuickChipRowProps) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-(--space-2)", className)}
    >
      {chips.map((chip) => (
        <Button
          key={chip.label}
          variant="secondary"
          size="sm"
          disabled={disabled}
          onClick={() => onApply(chip.delta)}
        >
          {chip.label}
        </Button>
      ))}
    </div>
  );
}
