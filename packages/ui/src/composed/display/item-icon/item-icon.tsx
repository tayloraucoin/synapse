/**
 * ItemIcon — renders an `IconValue` wherever an item appears (v2 handoff §5.5).
 *
 * Four kinds, one box: emoji as text, a curated Lucide glyph tinted by the
 * category, an uploaded image, and — when there is no icon — a neutral dot.
 * The dot matters: rows are read down a column, and a missing icon that
 * collapses the box would make every row below it sit at a different indent.
 *
 * ALWAYS `aria-hidden`. The item's title carries the meaning; an icon that
 * announced itself would make every row read twice (official spec §9.9).
 *
 * IMAGE URLS ARE RESOLVED BY THE CALLER. An `IconValue` of kind "image" holds
 * a storage key, not a URL, and turning a key into a signed URL is a server
 * concern. This component takes the resolved `imageUrl` and falls back to the
 * dot while it is null, so a row never waits on a signature to lay out.
 */
import type { CategoryKey, IconValue } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { getCuratedGlyph } from "./curated-glyphs";

/** Static so Tailwind's scanner sees every class — see CategoryChip. */
const GLYPH_TINT: Record<CategoryKey, string> = {
  leaf: "text-cat-leaf-500",
  sky: "text-cat-sky-500",
  clay: "text-cat-clay-500",
  rose: "text-cat-rose-500",
  amber: "text-cat-amber-500",
  slate: "text-cat-slate-500",
  plum: "text-cat-plum-500",
  moss: "text-cat-moss-500",
};

export type ItemIconSize = 20 | 24 | 48;

export interface ItemIconProps {
  icon: IconValue | null;
  size?: ItemIconSize;
  /** Resolved by the caller from an `IconValue` of kind "image". */
  imageUrl?: string | null;
  /** Phase 2 — a calendar-sourced item carries its own glyph. */
  calendar?: boolean;
  className?: string;
}

const BOX: Record<ItemIconSize, string> = {
  20: "size-5",
  24: "size-6",
  48: "size-12",
};

const EMOJI_TEXT: Record<ItemIconSize, string> = {
  20: "text-[1rem]",
  24: "text-[1.25rem]",
  48: "text-[2.5rem]",
};

/** The glyph sits at 20/24 of the box, as the handoff's sizes read. */
const GLYPH_PX: Record<ItemIconSize, number> = { 20: 16, 24: 20, 48: 40 };

export function ItemIcon({
  icon,
  size = 24,
  imageUrl = null,
  calendar = false,
  className,
}: ItemIconProps) {
  const box = cn(
    "inline-flex shrink-0 items-center justify-center",
    BOX[size],
    className,
  );

  if (icon?.kind === "emoji") {
    return (
      <span aria-hidden="true" className={cn(box, EMOJI_TEXT[size], "leading-none")}>
        {icon.value}
      </span>
    );
  }

  if (icon?.kind === "curated") {
    const glyph = getCuratedGlyph(icon.value);
    if (glyph !== undefined) {
      const { Icon } = glyph;
      return (
        <span
          aria-hidden="true"
          className={cn(
            box,
            icon.colorKey === null
              ? "text-text-body"
              : GLYPH_TINT[icon.colorKey],
          )}
        >
          <Icon size={GLYPH_PX[size]} strokeWidth={1.75} />
        </span>
      );
    }
  }

  if (icon?.kind === "image" && imageUrl !== null) {
    return (
      // A plain <img>, not next/image: @syn/ui must render in Storybook and,
      // one day, in the Expo re-skin. next/image would bind it to Next.
      <img
        src={imageUrl}
        alt=""
        aria-hidden="true"
        className={cn(box, "rounded-(--radius) object-cover")}
      />
    );
  }

  return (
    <span aria-hidden="true" className={cn(box, calendar && "text-text-muted")}>
      <span className="block size-1.5 rounded-full bg-edge" />
    </span>
  );
}
