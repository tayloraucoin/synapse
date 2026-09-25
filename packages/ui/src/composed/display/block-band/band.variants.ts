import type { BlockKind } from "@syn/types";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * The bands' skin — UX v1.1 §6.5, §3.11, §10.3.
 *
 * "A very light fill (`bg-surface`) with the block's name in the gutter at
 * the band's top." No new colour (§10.3): a band at rest is `bg-surface`; a
 * pooled band is lighter still (transparent with a dashed hairline — the
 * shape says *nothing here yet*, not a tint); a gap is transparent with its
 * minutes; a gap of zero is a hairline. On the Schedule and the Today tab
 * nothing here is ever coloured, and a slack band is "never coloured" by the
 * same rule.
 *
 * HUE — UX v1.3 R47, §3.1, §10.2, TD-29 (DAY-7). On PLANNING surfaces only
 * (the primer, the builder's B7 · B13 · B14 · B17, screen 5) a band may take
 * its kind's hue: the wash `bg-block-<kind>` (the category 100 step; 800 in
 * dark) and a label in `text-block-<kind>-label` (700; 200 in dark). `hue`
 * is a boolean — the KIND decides the colour, through the tokens; no caller
 * picks one. A pooled hued band keeps its dashed edge over the wash.
 */
const KINDS: readonly BlockKind[] = [
  "orient",
  "morning",
  "training",
  "prep",
  "work",
  "break",
  "transition",
  "activity",
  "wind_down",
];

/** The wash per kind — whole class names, so Tailwind sees every one. */
const WASH: Record<BlockKind, string> = {
  orient: "bg-block-orient",
  morning: "bg-block-morning",
  training: "bg-block-training",
  prep: "bg-block-prep",
  work: "bg-block-work",
  break: "bg-block-break",
  transition: "bg-block-transition",
  activity: "bg-block-activity",
  wind_down: "bg-block-wind-down",
};

/** The in-band label per kind — the 700-on-100 pairing (AA at caption size). */
export const BLOCK_LABEL_HUE: Record<BlockKind, string> = {
  orient: "text-block-orient-label",
  morning: "text-block-morning-label",
  training: "text-block-training-label",
  prep: "text-block-prep-label",
  work: "text-block-work-label",
  break: "text-block-break-label",
  transition: "text-block-transition-label",
  activity: "text-block-activity-label",
  wind_down: "text-block-wind-down-label",
};

export const bandVariants = cva(
  ["absolute inset-x-0 rounded-(--radius)", "transition-colors duration-(--dur-state) ease-(--ease-settle)"],
  {
    variants: {
      tone: {
        block: "bg-surface",
        pooled: "border border-dashed border-hairline bg-transparent",
        gap: "bg-transparent",
        hairline: "border-t border-hairline bg-transparent",
      },
      kind: Object.fromEntries(KINDS.map((kind) => [kind, ""])) as Record<BlockKind, string>,
      hue: { true: "", false: "" },
    },
    // `kind × hue` → the wash; the caller's `cn` puts it over the tone's own fill.
    compoundVariants: KINDS.map((kind) => ({ hue: true, kind, class: WASH[kind] })),
    defaultVariants: { tone: "block", hue: false },
  },
);

export type BandVariants = VariantProps<typeof bandVariants>;
