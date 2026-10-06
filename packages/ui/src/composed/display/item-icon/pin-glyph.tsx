/**
 * PinGlyph — the small anchor glyph a pin carries before its title (UX v1.1
 * §6.1, §10.1 *Pinned*, §12.2 *Pin · Fixed*).
 *
 * ONE DRAWING, THREE HOMES: `ItemRow`, `ScheduleBlock`, `SlotRow`. It is an
 * inline SVG in `currentColor`, not an emoji and not a font glyph, so it
 * renders the same in both themes and at every text size. Decorative: the
 * word *pinned* is in the row's accessible name, not here.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";

export interface PinGlyphProps {
  /** Pixels; 12 in a row, 10 in a block. */
  size?: 10 | 12;
  className?: string;
}

export function PinGlyph({ size = 12, className }: PinGlyphProps) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("shrink-0", className)}
    >
      <circle cx="6" cy="2.75" r="1.5" />
      <path d="M6 4.25v6.5" />
      <path d="M2.5 7.25c0 1.9 1.6 3.25 3.5 3.25s3.5-1.35 3.5-3.25" />
      <path d="M2.5 7.25h1.2M8.3 7.25h1.2" />
    </svg>
  );
}
