import type { ItemState, StateWordKind } from "@syn/types";
import { cva, type VariantProps } from "class-variance-authority";

/**
 * ItemRow's skin and its state matrix — v2 handoff §5.6, official spec §5.9.
 *
 * The matrix is a table rather than a chain of conditionals in the component,
 * because there are fifteen `ItemState`s and the question "what does `closing`
 * look like" should have one place to read the answer.
 */
export const itemRowVariants = cva(
  [
    /*
     * `min-w-0` is load-bearing at 200% text (official spec §11). The row body
     * is a flex item beside the checkbox column, whose 56px is a rem-based
     * `size-14` and so becomes 112px when a person doubles their text size.
     * A flex item defaults to `min-width: auto`, which is its min-content —
     * and the title inside is `truncate`, i.e. `white-space: nowrap`, so its
     * min-content is the whole title. The row then refuses to shrink and the
     * page scrolls sideways. `min-w-0` lets the title clip as it was always
     * meant to. Found on the landing page (SYS-6); the List has the same shape.
     */
    "relative flex w-full min-w-0 min-h-(--row-min) items-center gap-(--space-2) text-left",
    "pe-(--space-4) py-(--space-2)",
    "transition-colors duration-(--dur-state) ease-(--ease-settle)",
  ],
  {
    variants: {
      interactive: {
        true: "hover:bg-surface",
        false: "",
      },
      faded: { true: "opacity-55", false: "" },
    },
    defaultVariants: { interactive: true, faded: false },
  },
);

export type ItemRowVariantProps = VariantProps<typeof itemRowVariants>;

/** States that read at 0.55 — the day has moved past them. */
const FADED: readonly ItemState[] = ["passed", "deferred", "cut-by-shift"];

/** States whose title reads as recorded rather than pending. */
const DONE: readonly ItemState[] = ["done", "done-off-schedule"];

export function isFadedState(state: ItemState): boolean {
  return FADED.includes(state);
}

export function isDoneState(state: ItemState): boolean {
  return DONE.includes(state);
}

/**
 * The word a state puts in the row's state slot, or null for silence.
 *
 * `upcoming`, `passed` and `active` are deliberately silent: an item that has
 * simply not happened yet, or has gone by, is not carrying news. `active` is
 * announced by the elapsed time that replaces its scheduled time, not by a
 * word as well.
 */
export function stateWordFor(state: ItemState): StateWordKind | null {
  switch (state) {
    case "now":
      return "now";
    case "soon":
      return "soon";
    case "open":
      return "open";
    case "closing":
      return "closing";
    case "done-off-schedule":
      return "moved";
    case "carried":
      return "from";
    case "deferred":
      return "not-today";
    case "pending-review":
      return "pending";
    case "not-assigned":
      return "archived";
    default:
      return null;
  }
}
