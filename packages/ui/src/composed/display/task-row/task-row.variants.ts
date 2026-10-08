/**
 * TaskRow's skin — Workflow UX v0.1 §3.3, §3.4, WF-01 (*Hover / focus-visible /
 * active / disabled*).
 *
 * The surface is the `li`: the toggle, the main button and the menu are three
 * siblings inside it, so hover and focus belong to the whole row.
 *
 * - AT REST A ROW IS ON PAPER. Only *next* sits on `bg-surface` — and always
 *   with the word — so it is the one row on the board with a surface behind
 *   it. A firing row gets nothing: no border, no wash, no movement.
 * - Focus-visible on the main button rings the WHOLE row (2px accent, 2px
 *   offset); the toggle and the menu ring themselves.
 * - Lifted is the product's lift grammar, typed here as `SortableList` types
 *   it: a 1.5px `border-accent-mark` and 0.9 opacity.
 */
import { cva, type VariantProps } from "class-variance-authority";

export const taskRowVariants = cva(
  [
    "group/row relative flex min-h-(--row-min) min-w-0 items-stretch gap-(--space-1) pe-(--space-1)",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
    "has-[[data-row-main]:focus-visible]:outline-2 has-[[data-row-main]:focus-visible]:outline-offset-2 has-[[data-row-main]:focus-visible]:outline-ring has-[[data-row-main]:focus-visible]:outline-solid",
  ],
  {
    variants: {
      next: {
        true: "bg-surface",
        false: "",
      },
      closed: {
        true: "opacity-55",
        false: "",
      },
      disabled: {
        true: "",
        false: "",
      },
      lifted: {
        true: "border-accent-mark z-10 border-[1.5px] opacity-90",
        false: "",
      },
    },
    compoundVariants: [
      // Hover only where it means something: never on the next row (it is
      // already the one surface) and never on a disabled one.
      { next: false, disabled: false, class: "hover:bg-fill-muted" },
    ],
    defaultVariants: { next: false, closed: false, disabled: false, lifted: false },
  },
);

export type TaskRowVariants = VariantProps<typeof taskRowVariants>;
