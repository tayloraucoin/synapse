/**
 * CategoryChip — a category's name in its own hue (v2 handoff §5.5).
 *
 * Official spec §9.3 pairs chips as 100 background / 700 text in light and
 * 800 / 200 in dark. That pairing lives in `preset.css` as `--chip-<key>-bg`
 * and `--chip-<key>-fg`, which flip with the theme — so this component names
 * one colour per slot and carries no `dark:` variant (`@syn/ui/AGENTS.md`).
 *
 * The handoff's `--chip-bg-step: 100` cannot do this job: Tailwind needs a
 * whole class name at build time, and a variable holding the string "100"
 * produces no utility.
 *
 * WHY A STATIC MAP: `bg-chip-${key}-bg` does not survive Tailwind's scanner —
 * it looks for whole class names in source text. Every pair is written out so
 * every pair is emitted. Adding a ninth hue means adding a row here and two
 * token pairs in `preset.css`.
 *
 * The name is the meaning; the hue is the reminder. A chip never appears
 * without its name (official spec §9.3 — colour never carries meaning alone).
 */
import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";

const CHIP_CLASSES: Record<CategoryKey, string> = {
  leaf: "bg-chip-leaf-bg text-chip-leaf-fg",
  sky: "bg-chip-sky-bg text-chip-sky-fg",
  clay: "bg-chip-clay-bg text-chip-clay-fg",
  rose: "bg-chip-rose-bg text-chip-rose-fg",
  amber:
    "bg-chip-amber-bg text-chip-amber-fg",
  slate:
    "bg-chip-slate-bg text-chip-slate-fg",
  plum: "bg-chip-plum-bg text-chip-plum-fg",
  moss: "bg-chip-moss-bg text-chip-moss-fg",
};

export interface CategoryChipProps {
  categoryKey: CategoryKey;
  name: string;
  className?: string;
}

export function CategoryChip({
  categoryKey,
  name,
  className,
}: CategoryChipProps) {
  return (
    <span
      className={cn(
        "inline-flex h-6 shrink-0 items-center rounded-(--radius) px-(--space-2)",
        "text-[length:var(--fs-caption)] leading-(--lh-caption) whitespace-nowrap",
        CHIP_CLASSES[categoryKey],
        className,
      )}
    >
      {name}
    </span>
  );
}
