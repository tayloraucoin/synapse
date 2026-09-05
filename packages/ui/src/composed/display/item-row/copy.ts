/**
 * ItemRow's strings — v2 handoff §5.6.
 *
 * The checkbox label names the item and the direction, so a screen reader
 * hears "Mark Read done" rather than "checkbox" fourteen times down a list.
 */
export const ITEM_ROW_COPY = {
  markDone: (title: string) => `Mark ${title} done`,
  markNotDone: (title: string) => `Mark ${title} not done`,
  addUnit: (unit: string) => unit,
} as const;
