/**
 * HueSquare — the small colour square a heading or a chip line carries beside
 * its word (D-USE-38; USE-10). The tiers draw theirs with it (red, leaf,
 * amber, slate), but it knows only a hue: what the hue means is the caller's.
 *
 * COLOUR NEVER ALONE. Decorative, `aria-hidden`; the word beside it is what
 * is read and what tells one square from another (P-A03).
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export type SquareHue =
  | "alert"
  | "leaf"
  | "sky"
  | "clay"
  | "rose"
  | "amber"
  | "slate"
  | "plum"
  | "moss"
  | "yellow";

/** Whole class names, so Tailwind sees every one. */
const FILL: Record<SquareHue, string> = {
  alert: "bg-alert",
  leaf: "bg-category-leaf-dot",
  sky: "bg-category-sky-dot",
  clay: "bg-category-clay-dot",
  rose: "bg-category-rose-dot",
  amber: "bg-category-amber-dot",
  slate: "bg-category-slate-dot",
  plum: "bg-category-plum-dot",
  moss: "bg-category-moss-dot",
  yellow: "bg-category-yellow-dot",
};

export interface HueSquareProps {
  hue: SquareHue;
  className?: string;
}

export function HueSquare({ hue, className }: HueSquareProps) {
  return (
    <span
      aria-hidden="true"
      data-hue-square={hue}
      className={cn("inline-block size-2 shrink-0", FILL[hue], className)}
    />
  );
}
