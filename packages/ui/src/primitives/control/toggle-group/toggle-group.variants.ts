import { cva, type VariantProps } from "class-variance-authority";

/**
 * Toggle-group skin.
 *
 * `default` and `outline` are the CLI's, kept so the installed primitive still
 * behaves as shadcn documents it. `chip` and `cell` are Synapse's, required by
 * v2 handoff §5.0 and by everything built over this primitive:
 *
 * - `cell` is the 44px square used by `Stepper17`, `WeekdayChips`,
 *   `ColorSwatchRow` and `SegmentedControl`. Selected is an ink fill with
 *   paper text — never the accent, which in this product marks *now*, not
 *   *chosen* (official spec §9.3).
 * - `chip` is the rounded, wrapping badge used by `ReasonChips` and
 *   `ChipPicker`. Selected is a 1px ink outline rather than a fill, because a
 *   chip row is a list of words a person reads before choosing, and eight
 *   filled words is a wall.
 *
 * Both keep a 44px minimum target (official spec §5.9) even where the visual
 * is smaller — the swatch in `ColorSwatchRow` is 32px inside a 44px cell.
 */
export const toggleVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-sans font-medium outline-none",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-transparent text-sm hover:bg-muted hover:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        outline:
          "rounded-md border border-input bg-transparent text-sm shadow-xs hover:bg-accent hover:text-accent-foreground focus-visible:ring-[3px] focus-visible:ring-ring/50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground",
        /** The 44px square — Stepper17, WeekdayChips, ColorSwatchRow. */
        cell: [
          "border-neutral-300 text-ink rounded-(--radius) border bg-transparent",
          "text-(length:--fs-body)",
          "hover:bg-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-800",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
          "data-[state=on]:border-transparent",
        ],
        /** The wrapping word chip — ReasonChips, ChipPicker. */
        chip: [
          "rounded-(--radius-full) border border-transparent bg-neutral-100",
          "text-text-body text-(length:--fs-caption)",
          "hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-700",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "data-[state=on]:border-ink data-[state=on]:text-ink",
        ],
      },
      size: {
        default: "h-9 min-w-9 px-2",
        sm: "h-8 min-w-8 px-1.5",
        lg: "h-10 min-w-10 px-2.5",
        /** 44×44 — the target floor, official spec §5.9. */
        target: "size-(--target) min-w-(--target) p-0",
        /** 32px tall with 44px of vertical target from the parent's padding. */
        chip: "h-8 px-(--space-3)",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export type ToggleVariantProps = VariantProps<typeof toggleVariants>;
