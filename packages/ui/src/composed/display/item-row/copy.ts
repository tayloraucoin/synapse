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
  /** UX v1.1 §7.3 — the word on a row left unticked, rendered outside the strip. */
  notConfirmed: "not confirmed",
  /** UX v1.1 §6.1, §10.1 — the accessible words for a pin and the container. */
  pinned: "pinned",
  container: "block",
} as const;
