/**
 * LucideGlyph — a Lucide icon stored by name (`kind: "lucide"`), drawn in its
 * colour (USE-144): a kind's dot token, or the person's hex. The one drawing
 * behind ItemIcon and IconTile, so an icon set in the picker draws wherever
 * it is shown.
 *
 * The drawing comes from the picker's own lazy set (`loadIconSet`), so a
 * screen with a few icons shares the chunk the picker loads and fetches
 * nothing beyond our bundle; until it lands the box holds its size, empty.
 * `aria-hidden` always: the name beside it is the meaning.
 */
"use client";

import type { CategoryKey } from "@syn/types";
import type { LucideIcon } from "lucide-react";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { loadIconSet } from "../../control/icon-picker/icon-sets";

/** Static so Tailwind's scanner sees every class — see CategoryChip. */
export const KIND_GLYPH: Record<CategoryKey, string> = {
  leaf: "text-category-leaf-dot",
  sky: "text-category-sky-dot",
  clay: "text-category-clay-dot",
  rose: "text-category-rose-dot",
  amber: "text-category-amber-dot",
  slate: "text-category-slate-dot",
  plum: "text-category-plum-dot",
  moss: "text-category-moss-dot",
};

export function isKindColour(colour: string): colour is CategoryKey {
  return Object.hasOwn(KIND_GLYPH, colour);
}

/** The Lucide drawing for a name, once the picker's set has loaded. */
function useLucideDrawing(name: string): LucideIcon | undefined {
  const [drawing, setDrawing] = React.useState<LucideIcon | undefined>();
  React.useEffect(() => {
    let live = true;
    loadIconSet()
      .then((set) => {
        if (live) setDrawing(() => set.draw(name));
      })
      .catch(() => {
        // The box keeps its size, empty; the name beside it still reads.
      });
    return () => {
      live = false;
    };
  }, [name]);
  return drawing;
}

export interface LucideGlyphProps {
  /** The Lucide name, as stored. */
  name: string;
  /** A kind's key, or a hex. */
  color: string;
  /** The drawing's size in px. */
  px: number;
  /** The muted tone, its colour set aside (the To-dos tray's rows). */
  muted?: boolean;
  /** The box: its size and anything else the caller sets. */
  className?: string;
}

export function LucideGlyph({
  name,
  color,
  px,
  muted = false,
  className,
}: LucideGlyphProps) {
  const Drawing = useLucideDrawing(name);
  const kind = isKindColour(color) ? color : null;
  const hex = !muted && kind === null;
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 items-center justify-center",
        muted ? "text-text-muted" : kind === null ? undefined : KIND_GLYPH[kind],
        className,
      )}
      style={hex ? { color } : undefined}
    >
      {/* text-current: a menu's own svg tint never mutes the colour. */}
      {Drawing === undefined ? null : (
        <Drawing size={px} strokeWidth={1.75} className="text-current" />
      )}
    </span>
  );
}
