/**
 * CategoryChip — a category's name in its own hue (v2 handoff §5.5).
 *
 * Official spec §9.3 pairs chips as 100 background / 700 text in light and
 * 800 / 200 in dark. The pairing is switched by the `dark:` variant rather
 * than by reading `--chip-bg-step`, because Tailwind needs both class names
 * present at build time and a CSS variable holding the string "100" cannot
 * produce a utility.
 *
 * WHY A STATIC MAP: `bg-cat-${key}-100` does not survive Tailwind's scanner —
 * it looks for whole class names in source text. Every pair is written out so
 * every pair is emitted. Adding a ninth hue means adding a row here.
 *
 * The name is the meaning; the hue is the reminder. A chip never appears
 * without its name (official spec §9.3 — colour never carries meaning alone).
 */
import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";

const CHIP_CLASSES: Record<CategoryKey, string> = {
  leaf: "bg-cat-leaf-100 text-cat-leaf-700 dark:bg-cat-leaf-800 dark:text-cat-leaf-200",
  sky: "bg-cat-sky-100 text-cat-sky-700 dark:bg-cat-sky-800 dark:text-cat-sky-200",
  clay: "bg-cat-clay-100 text-cat-clay-700 dark:bg-cat-clay-800 dark:text-cat-clay-200",
  rose: "bg-cat-rose-100 text-cat-rose-700 dark:bg-cat-rose-800 dark:text-cat-rose-200",
  amber:
    "bg-cat-amber-100 text-cat-amber-700 dark:bg-cat-amber-800 dark:text-cat-amber-200",
  slate:
    "bg-cat-slate-100 text-cat-slate-700 dark:bg-cat-slate-800 dark:text-cat-slate-200",
  plum: "bg-cat-plum-100 text-cat-plum-700 dark:bg-cat-plum-800 dark:text-cat-plum-200",
  moss: "bg-cat-moss-100 text-cat-moss-700 dark:bg-cat-moss-800 dark:text-cat-moss-200",
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
