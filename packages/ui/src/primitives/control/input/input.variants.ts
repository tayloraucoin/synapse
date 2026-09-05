import { cva } from "class-variance-authority";

/**
 * The shared field skin — reused by the Select trigger and the native select,
 * so a text field and a chooser sit on the same line without being nudged.
 *
 * The error state is a 1px ink border, not a red one (official spec §9.3:
 * colour is never the only carrier, and nothing red appears on a form).
 */
export const inputSkin = [
  "w-full rounded-(--radius) border border-input bg-paper",
  "px-(--space-3) text-ink",
  "font-sans text-(length:--fs-body) leading-(--lh-body)",
  "placeholder:text-text-muted",
  "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  "hover:border-text-secondary",
];

export const inputVariants = cva(
  [
    "h-(--target)",
    ...inputSkin,
    "outline-none",
    "disabled:cursor-not-allowed disabled:text-text-disabled",
    "read-only:text-text-secondary",
  ],
  {
    variants: {
      error: {
        true: "border-ink hover:border-ink",
        false: "",
      },
      /** Leaves room for the password Show/Hide button. */
      hasSuffix: {
        true: "pr-16",
        false: "",
      },
    },
    defaultVariants: {
      error: false,
      hasSuffix: false,
    },
  },
);
