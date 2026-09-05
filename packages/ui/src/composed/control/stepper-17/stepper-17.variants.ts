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
 */
export const stepper17CellVariants = cva(
  [
    "inline-flex size-(--target) shrink-0 items-center justify-center",
    "rounded-(--radius) text-(length:--fs-body) font-medium",
    "cursor-pointer select-none",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  ],
  {
    variants: {
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
      state: "unselected",
      invalid: false,
      disabled: false,
    },
  },
);

export type Stepper17CellVariants = VariantProps<typeof stepper17CellVariants>;
