import { cva, type VariantProps } from "class-variance-authority";

/**
 * Stepper17's cell skin — v2 handoff §5.4.
 *
 * Never the accent. In this product accent-500 marks *now* — the now line, the
 * soon dot, the running border (official spec §9.3). A selected rating is not
 * a moment in the day, so it fills with ink.
 *
 * `resting` is the life default shown while nothing is chosen: a dashed ink
 * outline, so the person can see what the value will be if they leave it alone
 * without it looking already chosen.
 *
 * `size` (UX v1.3 R59, DAY-1): `cell` is the 44px square, `row` the 40px one
 * `layout="row"` draws, and `mark` the 24px miniature `PriorityMark` renders
 * — the matters number on a collapsed card, never interactive. One cva, so
 * the mark and the control share the fill and the radius.
 */
export const stepper17CellVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center",
    "rounded-(--radius) font-medium",
    "select-none",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  ],
  {
    variants: {
      size: {
        cell: "size-(--target) cursor-pointer text-(length:--fs-body)",
        row: "size-10 cursor-pointer text-(length:--fs-body)",
        mark: "size-6 cursor-default text-(length:--fs-caption) leading-none",
      },
      state: {
        unselected: "border-edge text-ink border hover:bg-surface",
        selected: "bg-primary text-primary-foreground border border-transparent",
        resting: "border-ink text-ink border border-dashed hover:bg-surface",
      },
      invalid: {
        true: "",
        false: "",
      },
      disabled: {
        true: "pointer-events-none opacity-40",
        false: "",
      },
    },
    defaultVariants: {
      size: "cell",
      state: "unselected",
      invalid: false,
      disabled: false,
    },
  },
);

export type Stepper17CellVariants = VariantProps<typeof stepper17CellVariants>;
