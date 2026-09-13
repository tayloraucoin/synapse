import { cva, type VariantProps } from "class-variance-authority";

/**
 * ScheduleBlock's skin — v2 handoff §5.7.
 *
 * `active` is the one border that may be accent (official spec §9.3, and see
 * `NowLine`). `done-off-schedule` is violet — the product's one "this moved"
 * signal — and everything else is neutral, because a schedule that colour-codes
 * outcomes is a schedule that grades the day.
 */
export const scheduleBlockVariants = cva(
  [
    "absolute overflow-hidden rounded-(--radius) text-left",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
  ],
  {
    variants: {
      tone: {
        upcoming:
          "border border-hairline bg-surface",
        passed:
          "border border-hairline bg-surface opacity-55",
        active: "border-[1.5px] border-accent-500 bg-surface",
        done: "border border-hairline bg-fill-muted",
        moved:
          "border-[1.5px] border-violet-500 bg-surface",
        /** UX v1.1 §10.1 *Not confirmed*: "Ghost outline" — a hairline, no fill. */
        ghost: "border border-dashed border-hairline bg-transparent opacity-55",
        /** UX v1.1 §6.1: the work container — the band's own fill, a hairline. */
        container: "border border-hairline bg-transparent",
      },
      /** UX v1.1 §6.5 *lifted*: "0.9 opacity, 1.5px `border-accent-mark`". */
      lifted: {
        true: "border-[1.5px] border-accent-mark opacity-90",
        false: "",
      },
      size: {
        full: "px-(--space-2) py-(--space-1)",
        compact: "px-(--space-2) py-0",
        /** Under 16px: a 2px rule with a caption beside it. */
        hairline: "border-0 bg-transparent px-0",
      },
    },
    defaultVariants: { tone: "upcoming", size: "full", lifted: false },
  },
);

export type ScheduleBlockVariants = VariantProps<typeof scheduleBlockVariants>;
