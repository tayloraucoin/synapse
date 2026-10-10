/**
 * CategoryChip — a category's name in its own hue (v2 handoff §5.5).
 *
 * The brand kit (WEB-1) fills a chip with `--category-<key>-chip` and sets
 * its name in `foreground`; both flip with the theme in `preset.css`, so this
 * component carries no `dark:` variant (`@syn/ui/AGENTS.md`).
 *
 * WHY A STATIC MAP: `bg-category-${key}-chip` does not survive Tailwind's scanner —
 * it looks for whole class names in source text. Every pair is written out so
 * every pair is emitted. Adding a ninth hue means adding a row here and a
 * chip and dot pair in `preset.css`.
 *
 * The name is the meaning; the hue is the reminder. A chip never appears
 * without its name (official spec §9.3 — colour never carries meaning alone).
 */
import type { CategoryKey } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";

const CHIP_CLASSES: Record<CategoryKey, string> = {
  leaf: "bg-category-leaf-chip text-foreground",
  sky: "bg-category-sky-chip text-foreground",
  clay: "bg-category-clay-chip text-foreground",
  rose: "bg-category-rose-chip text-foreground",
  amber:
    "bg-category-amber-chip text-foreground",
  slate:
    "bg-category-slate-chip text-foreground",
  plum: "bg-category-plum-chip text-foreground",
  moss: "bg-category-moss-chip text-foreground",
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
