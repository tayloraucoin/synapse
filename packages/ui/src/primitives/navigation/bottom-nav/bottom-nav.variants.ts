import { cva, type VariantProps } from "class-variance-authority";

/**
 * Tabs are word labels, never icons alone (official spec §5.1, §9.9). The
 * active tab is ink; the rest are secondary. There is no fill, no pill, and no
 * accent — the accent marks time, and a tab bar is not time.
 */
export const bottomNavItemVariants = cva(
  [
    "flex min-h-(--tabbar-h) w-full flex-col items-center justify-center",
    // No side padding under 360px: the equal cell is the label's room (FLO-5).
    "gap-(--space-1) px-(--space-2) max-[359px]:px-0",
    "font-sans text-(length:--fs-secondary) font-medium",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  ],
  {
    variants: {
      active: {
        true: "text-ink",
        false: "text-text-secondary hover:text-ink",
      },
      /** Under a sheet's scrim: visible, not tappable (cross-cutting §2.2). */
      dimmed: {
        true: "pointer-events-none opacity-55",
        false: "",
      },
    },
    defaultVariants: {
      active: false,
      dimmed: false,
    },
  },
);

export type BottomNavItemVariantProps = VariantProps<
  typeof bottomNavItemVariants
>;
