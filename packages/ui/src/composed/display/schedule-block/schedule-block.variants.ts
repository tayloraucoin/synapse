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
          "border border-neutral-200 bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800",
        passed:
          "border border-neutral-200 bg-neutral-100 opacity-55 dark:border-neutral-700 dark:bg-neutral-800",
        active: "border-[1.5px] border-accent-500 bg-neutral-100 dark:bg-neutral-800",
        done: "border border-neutral-200 bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-700",
        moved:
          "border-[1.5px] border-violet-500 bg-neutral-100 dark:bg-neutral-800",
      },
      size: {
        full: "px-(--space-2) py-(--space-1)",
        compact: "px-(--space-2) py-0",
        /** Under 16px: a 2px rule with a caption beside it. */
        hairline: "border-0 bg-transparent px-0",
      },
    },
    defaultVariants: { tone: "upcoming", size: "full" },
  },
);

export type ScheduleBlockVariants = VariantProps<typeof scheduleBlockVariants>;
