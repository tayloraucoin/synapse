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
