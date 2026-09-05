/**
 * ListRow's skin — v2 handoff §5.5.
 *
 * The row's interactive surface is the variant target, not the wrapper: the
 * wrapper carries the trailing control as a sibling, so hover and focus belong
 * to the link/button that fills the rest of the width.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const listRowSurfaceVariants = cva(
  [
    "flex w-full min-h-(--row-min) items-center gap-(--space-3) text-left",
    "px-(--space-4) py-(--space-2)",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
  ],
  {
    variants: {
      interactive: {
        true: "cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800",
        false: "",
      },
      muted: {
        true: "opacity-55",
        false: "",
      },
    },
    defaultVariants: { interactive: true, muted: false },
  },
);

export type ListRowSurfaceVariants = VariantProps<typeof listRowSurfaceVariants>;
