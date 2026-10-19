import type { StoredBlockKind } from "@syn/types";

/** A block kind's category hue: the band's wash takes the chip, its edge the dot. */
export type BlockHue =
  | "leaf"
  | "sky"
  | "clay"
  | "rose"
  | "amber"
  | "slate"
  | "plum"
  | "moss"
  | "yellow";

/**
 * The kinds' hues (D-USE-38, D-USE-79; open-3): Work sky, Training clay,
 * Break amber, Life yellow, To-dos moss, Wellness leaf, Evening slate. The
 * old kinds keep v1.3's mapping for the rows that still carry them.
 */
export const BLOCK_HUE: Record<StoredBlockKind, BlockHue> = {
  wellness: "leaf",
  training: "clay",
  work: "sky",
  life: "yellow",
  todos: "moss",
  break: "amber",
  evening: "slate",
  orient: "slate",
  morning: "leaf",
  prep: "amber",
  transition: "amber",
  activity: "plum",
  wind_down: "rose",
};

/** Whole class names, so Tailwind sees every one. */
export const HUE_CHIP: Record<BlockHue, string> = {
  leaf: "bg-category-leaf-chip",
  sky: "bg-category-sky-chip",
  clay: "bg-category-clay-chip",
  rose: "bg-category-rose-chip",
  amber: "bg-category-amber-chip",
  slate: "bg-category-slate-chip",
  plum: "bg-category-plum-chip",
  moss: "bg-category-moss-chip",
  yellow: "bg-category-yellow-chip",
};

export const HUE_DOT: Record<BlockHue, string> = {
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

/** The dot's colour as a glyph's: the close card's check (USE-25). */
export const HUE_TEXT: Record<BlockHue, string> = {
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

/** A dashed edge in the kind's colour: a block outside the bounds (USE-39). */
export const HUE_BORDER: Record<BlockHue, string> = {
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

/** An event's colour: a palette key, else plum (D-USE-38) [ASSUMPTION: hex reads plum]. */
export function eventHue(color: string | null): BlockHue {
  const hues = new Set<string>(Object.values(BLOCK_HUE));
  return color !== null && hues.has(color) ? (color as BlockHue) : "plum";
}
