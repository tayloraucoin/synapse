import type { BlockHue } from "../block-hue";

/**
 * Schedule's hue classes beside `block-hue.ts`'s fills (USE-27), whole so
 * Tailwind sees each: a check takes its block's dot colour as a glyph; a
 * meeting band its event's dot colour as a hairline.
 */
export const HUE_CHECK: Record<BlockHue, string> = {
  leaf: "text-category-leaf-dot",
  sky: "text-category-sky-dot",
  clay: "text-category-clay-dot",
  rose: "text-category-rose-dot",
  amber: "text-category-amber-dot",
  slate: "text-category-slate-dot",
  plum: "text-category-plum-dot",
  moss: "text-category-moss-dot",
  yellow: "text-category-yellow-dot",
};

export const HUE_EDGE: Record<BlockHue, string> = {
  leaf: "border-category-leaf-dot",
  sky: "border-category-sky-dot",
  clay: "border-category-clay-dot",
  rose: "border-category-rose-dot",
  amber: "border-category-amber-dot",
  slate: "border-category-slate-dot",
  plum: "border-category-plum-dot",
  moss: "border-category-moss-dot",
  yellow: "border-category-yellow-dot",
};
