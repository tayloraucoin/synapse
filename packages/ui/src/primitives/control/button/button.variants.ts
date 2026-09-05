import { cva } from "class-variance-authority";

/**
 * Button skin — official spec §9.7.
 *
 * There is no accent variant, by construction. `--primary` is ink, not the
 * verdigris: the accent marks time (the now line, the now/soon dot, the focus
 * ring, the active-timer border) and never fills a surface. A button that
 * wanted an accent fill would be asking for a different product.
 *
 * `destructive` exists for exactly one surface — Delete account. Nothing else,
 * including "Missed", is permitted to be red.
 */
export const buttonVariants = cva(
  [
    "inline-flex shrink-0 items-center justify-center gap-(--space-2)",
    "rounded-(--radius) whitespace-nowrap",
    "font-sans text-(length:--fs-secondary) font-medium",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    "outline-none",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    "[&_svg:not([class*='size-'])]:size-5",
  ],
  {
    variants: {
      variant: {
        /** The one primary action on a screen. Ink fill, paper text. */
        default: "bg-primary text-primary-foreground hover:bg-neutral-700",
        /** Outlined. The counterpart action — Cancel, Keep editing. */
        secondary:
          "border-hairline text-ink border bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
        /** Text only. Inline actions — Undo, Bring back, Change. */
        ghost: "text-ink bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800",
        /** Delete account, and nowhere else. */
        destructive:
          "bg-destructive text-neutral-50 hover:bg-destructive/90",
      },
      size: {
        sm: "h-9 px-(--space-3)",
        md: "h-(--target) px-(--space-4)",
        lg: "h-12 px-(--space-5)",
        /** Square. Requires `aria-label` — an icon never stands alone (§9.9). */
        icon: "size-(--target)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  },
);
