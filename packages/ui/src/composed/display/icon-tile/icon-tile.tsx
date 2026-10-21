/**
 * IconTile — an `IconValue` on its kind-colour chip, the icon picker's tile
 * (USE-11, D-USE-30): a meal topic's row in the Meal topics sheet, and the
 * same icon bare at a chip's leading edge (USE-22).
 *
 * A Lucide icon stored by name (`kind: "lucide"`) draws through
 * `LucideGlyph`, the same drawing ItemIcon uses (USE-144). Emoji, curated
 * glyphs and none go through `ItemIcon`.
 *
 * A kind colour fills the tile with its chip tint and draws the glyph in its
 * dot; a custom hex draws the glyph in the hex on the neutral fill. Emoji and
 * curated glyphs sit on the neutral fill. `aria-hidden` always: the name
 * beside it is the meaning.
 */
"use client";

import type { CategoryKey, IconValue } from "@syn/types";
import { cn } from "../../../lib/cn";
import { isKindColour, ItemIcon, LucideGlyph } from "../item-icon";

/** Static so Tailwind's scanner sees every class — see CategoryChip. */
const KIND_TILE: Record<CategoryKey, string> = {
  leaf: "bg-category-leaf-chip",
  sky: "bg-category-sky-chip",
  clay: "bg-category-clay-chip",
  rose: "bg-category-rose-chip",
  amber: "bg-category-amber-chip",
  slate: "bg-category-slate-chip",
  plum: "bg-category-plum-chip",
  moss: "bg-category-moss-chip",
};

export interface IconTileProps {
  icon: IconValue | null;
  /** `tile`: 36px on its chip; `bare`: the 16px glyph alone, for a chip's leading edge. */
  variant?: "tile" | "bare";
  className?: string;
}

export function IconTile({ icon, variant = "tile", className }: IconTileProps) {
  const lucide = icon?.kind === "lucide" ? icon : null;
  const bare = variant === "bare";

  const kind =
    lucide !== null && isKindColour(lucide.color) ? lucide.color : null;
  const glyph =
    lucide === null ? (
      <ItemIcon icon={icon} size={bare ? 20 : 24} />
    ) : (
      <LucideGlyph
        name={lucide.value}
        color={lucide.color}
        px={bare ? 16 : 20}
        className={bare ? "size-4" : "size-6"}
      />
    );

  if (bare) {
    return (
      <span
        aria-hidden="true"
        className={cn("inline-flex shrink-0", className)}
      >
        {glyph}
      </span>
    );
  }

  return (
    <span
      aria-hidden="true"
      data-icon-tile
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius)",
        kind === null ? "bg-fill-muted" : KIND_TILE[kind],
        className,
      )}
    >
      {glyph}
    </span>
  );
}
