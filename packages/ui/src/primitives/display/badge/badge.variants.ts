import { cva } from "class-variance-authority";

/**
 * Badge — a short word beside a thing, in two weights.
 *
 * NEVER A COUNT. Epic 2 §0.1 rule 7: "No numbers about the day." A badge with
 * a number in it is a count of something the person is behind on, which is the
 * one thing this product does not put on a surface.
 *
 * There is no filled variant. A filled badge is a status pill, and Synapse's
 * statuses are words in the row (`now`, `soon`, `moved`), not chips.
 */
export const badgeVariants = cva(
  [
    "inline-flex w-fit shrink-0 items-center justify-center gap-1",
    "rounded-(--radius) px-(--space-2) py-0.5",
    "font-sans text-(length:--fs-caption) font-medium whitespace-nowrap",
    "[&>svg]:pointer-events-none [&>svg]:size-3",
  ],
  {
    variants: {
      variant: {
        /** Hairline outline — a category chip, a type word. */
        outline: "border-hairline text-ink border",
        /** No border — a quiet qualifier inside a line of text. */
        text: "text-text-secondary",
      },
    },
    defaultVariants: {
      variant: "outline",
    },
  },
);
