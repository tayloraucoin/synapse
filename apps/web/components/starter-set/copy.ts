/**
 * The starter chooser's strings — Epic 1 FR-02, verbatim.
 *
 * The ten habit titles are not here: they are `STARTER_HABITS` in
 * `@syn/constants`, because they are data a person confirms by saving rather
 * than copy the product says. The server reads the same constant, so a client
 * cannot invent an eleventh.
 */
export const STARTER_SET_COPY = {
  open: "Start from a small set",
  /** "10–20 min · importance 6" — the row's suggestion, not a promise. */
  suggestion: (min: number, max: number, importance: number) =>
    `${min}–${max} min · importance ${importance}`,
  wakeAnchorMark: "This is my wake-up habit",
  added: "Added",
  addSelected: (count: number) => `Add ${count} selected`,
  close: "Close",
} as const;
