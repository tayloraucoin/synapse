/**
 * QuickChipRow — a row of small chips (v2 handoff §5.4; UX v1.1 §3.7, §5.3,
 * §6.6).
 *
 * TWO USES, ONE ROW. TR-01's "−15 · −30 · −45 · −60" is a set of actions:
 * each tap applies a delta and nothing stays selected. v1.1 adds the chip
 * row as a set of STATES — the training placements (*Before the routine ·
 * After the routine · Inside work · After work · Not today*) with the last
 * placement preselected, and the Adjust sheet's reason chips. `selected`
 * turns the row into that: one chip pressed (`aria-pressed`), the rest not,
 * and `onSelect` with the chip's value. Without `selected`, the row is what
 * it was.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";

export interface QuickChip {
  label: string;
  /** TR-01's delta; unused when the row is a selection. */
  delta?: number;
  /** The selection's value; the label when omitted. */
  value?: string;
}

export interface QuickChipRowProps {
  chips: readonly QuickChip[];
  /** TR-01: each tap applies a delta. */
  onApply?: (delta: number) => void;
  /** UX v1.1: one chip is the answer; `null` is none yet. */
  selected?: string | null;
  onSelect?: (value: string) => void;
  label: string;
  disabled?: boolean;
  className?: string;
}

function valueOf(chip: QuickChip): string {
  return chip.value ?? chip.label;
}

export function QuickChipRow({
  chips,
  onApply,
  selected,
  onSelect,
  label,
  disabled = false,
  className,
}: QuickChipRowProps) {
  const selecting = selected !== undefined;

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("flex flex-wrap gap-(--space-2)", className)}
    >
      {chips.map((chip) => {
        const value = valueOf(chip);
        const pressed = selecting && selected === value;
        return (
          <Button
            key={value}
            variant={pressed ? "default" : "secondary"}
            size="sm"
            disabled={disabled}
            aria-pressed={selecting ? pressed : undefined}
            onClick={() => {
              if (selecting) onSelect?.(value);
              else if (chip.delta !== undefined) onApply?.(chip.delta);
            }}
          >
            {chip.label}
          </Button>
        );
      })}
    </div>
  );
}
