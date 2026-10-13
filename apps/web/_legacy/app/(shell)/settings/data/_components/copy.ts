/**
 * ST-10 and ST-10a, verbatim from Epic 1 §7 and official spec §7.6, §10.3.
 *
 * TWO SENTENCES CARRY THE WHOLE TICKET. *Nothing is left out.* is a claim about
 * the export's completeness that the builder keeps by reading the schema rather
 * than a column list. *There's no undo.* is a claim about the delete being real
 * — no soft delete, no grace period, no recoverable state. Neither is a
 * flourish; if either stops being true the sentence has to change first.
 *
 * NO SECOND PERSON ON THE TABS, but this is a settings screen inside a sheet-
 * like flow, and the document's own strings use *your* here (*Your data*,
 * *Your export is ready*). The rule binds the execution tabs (official §2.4);
 * the trust surface is where the product speaks plainly about ownership.
 */
export const DATA_COPY = {
  title: "Your data",

  /* --------------------------------------------------------------- ST-10 -- */
  exportHeading: "Export",
  exportBody:
    "Everything in your account as CSV files and one JSON file. Nothing is left out.",
  exportAction: "Export everything",
  preparing: "Preparing your export…",
  ready: (size: string) => `Your export is ready (${size}).`,
  download: "Download",
  /** The promise `expire_exports` keeps. */
  linkLifetime: "Links last for 24 hours.",
  expired: "That export has expired.",
  exportAgain: "Export again",
  failed: "Couldn't prepare the export. Try again.",
  /** The link's accessible name carries the size (SET-10's accessibility note). */
  downloadLabel: (size: string) => `Download your export (${size})`,
  downloadFailed: "Couldn't open the download. Try again.",

  deleteHeading: "Delete account",
  deleteBody:
    "This removes your account and every item, day, and note in it. There's no undo.",
  deleteAction: "Delete account and all data",

  /* -------------------------------------------------------------- ST-10a -- */
  deleteTitle: "Delete your account?",
  /** The word is in the description, not only in a placeholder. */
  deleteWord: "delete",
  deleteConfirmLabel: "Confirm",
  deleteConfirmAction: "Delete account",
  cancel: "Cancel",
  deleteFailed: "Couldn't delete. Nothing was removed — try again.",
} as const;
