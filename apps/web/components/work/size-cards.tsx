"use client";

import type { WorkSize } from "@syn/types";
import { cn, SegmentedControl } from "@syn/ui";

/**
 * SizeCards — Size as five cards, Linear's point over its word (USE-65;
 * item-sheet/states/size-and-length.md, the size dev note): "1 Quick" to
 * "8 Huge". A radio group named by its label; the picked card takes the
 * surface fill, an ink edge and a bold word, so the choice never rests on
 * colour. Props only: the words and the points are the caller's.
 */
export interface SizeCardOption {
  value: WorkSize;
  points: number;
  word: string;
}

export interface SizeCardsProps {
  /** The group's name; shown by the caller's own label row. */
  label: string;
  options: readonly SizeCardOption[];
  value: WorkSize | null;
  onChange: (size: WorkSize) => void;
}

export function SizeCards({ label, options, value, onChange }: SizeCardsProps) {
  return (
    <SegmentedControl
      label={label}
      stacked={false}
      value={value ?? ("" as WorkSize)}
      onChange={onChange}
      options={options.map((option) => ({
        value: option.value,
        label: (
          <span className="flex flex-col items-center leading-(--lh-caption)">
            <span className="text-(length:--fs-body) text-foreground">
              {option.points}
            </span>
            <span className="text-(length:--fs-caption)">{option.word}</span>
          </span>
        ),
      }))}
      classes={{
        label: "sr-only",
        group: "bg-transparent gap-(--space-1) border-0 p-0",
        item: cn(
          "border-hairline bg-background text-muted-foreground h-14 min-w-0 flex-1 rounded-(--radius-control) border font-normal",
          "hover:bg-surface",
          "has-checked:bg-surface has-checked:border-foreground has-checked:text-foreground has-checked:font-semibold",
        ),
      }}
    />
  );
}
