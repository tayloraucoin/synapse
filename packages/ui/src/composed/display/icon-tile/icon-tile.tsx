/**
 * IconTile — an `IconValue` on its kind-colour chip, the icon picker's tile
 * (USE-11, D-USE-30): a meal topic's row in the Meal topics sheet, and the
 * same icon bare at a chip's leading edge (USE-22).
 *
 * The one place a Lucide icon stored by name (`kind: "lucide"`) is drawn
 * outside the picker. The drawing comes from the picker's own lazy set
 * (`loadIconSet`), so a screen with a few tiles shares the chunk the picker
 * loads and fetches nothing beyond our bundle; until it lands the tile holds
 * its size, empty. Emoji, curated glyphs and none go through `ItemIcon`.
 *
 * A kind colour fills the tile with its chip tint and draws the glyph in its
 * dot; a custom hex draws the glyph in the hex on the neutral fill. Emoji and
 * curated glyphs sit on the neutral fill. `aria-hidden` always: the name
 * beside it is the meaning.
 */
"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import type { CategoryKey, IconValue } from "@syn/types";
import { cn } from "../../../lib/cn";
import { loadIconSet } from "../../control/icon-picker/icon-sets";
import { ItemIcon } from "../item-icon";

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

const KIND_GLYPH: Record<CategoryKey, string> = {
  leaf: "text-category-leaf-dot",
  sky: "text-category-sky-dot",
  clay: "text-category-clay-dot",
  rose: "text-category-rose-dot",
  amber: "text-category-amber-dot",
  slate: "text-category-slate-dot",
  plum: "text-category-plum-dot",
  moss: "text-category-moss-dot",
};

function isKind(colour: string): colour is CategoryKey {
  return Object.hasOwn(KIND_TILE, colour);
}

/** The Lucide drawing for a name, once the picker's set has loaded. */
function useLucideDrawing(name: string | null): LucideIcon | undefined {
  const [drawing, setDrawing] = React.useState<LucideIcon | undefined>();
  React.useEffect(() => {
    if (name === null) return;
    let live = true;
    loadIconSet()
      .then((set) => {
        if (live) setDrawing(() => set.draw(name));
      })
      .catch(() => {
        // The tile keeps its size, empty; the name beside it still reads.
      });
    return () => {
      live = false;
    };
  }, [name]);
  return name === null ? undefined : drawing;
}

export interface IconTileProps {
  icon: IconValue | null;
  /** `tile`: 36px on its chip; `bare`: the 16px glyph alone, for a chip's leading edge. */
  variant?: "tile" | "bare";
  className?: string;
}

export function IconTile({ icon, variant = "tile", className }: IconTileProps) {
  const lucide = icon?.kind === "lucide" ? icon : null;
  const Drawing = useLucideDrawing(lucide?.value ?? null);
  const bare = variant === "bare";

  const kind = lucide !== null && isKind(lucide.color) ? lucide.color : null;
  const glyph =
    lucide === null ? (
      <ItemIcon icon={icon} size={bare ? 20 : 24} />
    ) : (
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          bare ? "size-4" : "size-6",
          kind === null ? undefined : KIND_GLYPH[kind],
        )}
        style={kind === null ? { color: lucide.color } : undefined}
      >
        {Drawing === undefined ? null : (
          <Drawing size={bare ? 16 : 20} strokeWidth={1.75} />
        )}
      </span>
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
