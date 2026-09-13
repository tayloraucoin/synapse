import { cva, type VariantProps } from "class-variance-authority";

/**
 * The bands' skin — UX v1.1 §6.5, §3.11, §10.3.
 *
 * "A very light fill (`bg-surface`) with the block's name in the gutter at
 * the band's top." No new colour (§10.3): a band at rest is `bg-surface`; a
 * pooled band is lighter still (transparent with a dashed hairline — the
 * shape says *nothing here yet*, not a tint); a gap is transparent with its
 * minutes; a gap of zero is a hairline. Nothing here is ever coloured, and a
 * slack band on the Schedule is "never coloured" by the same rule.
 */
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
    },
    defaultVariants: { tone: "block" },
  },
);

export type BandVariants = VariantProps<typeof bandVariants>;
