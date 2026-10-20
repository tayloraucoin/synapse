/**
 * The passage and link sheets' words (USE-153; ux/account/morning-reading/
 * words-and-access.md), as drawn. The link line and the limit lines are the
 * validators' (`UNOPENABLE_LINK`, `TITLE_LIMIT`), so the sheet and the
 * server refuse in the same words. The new-row discard lines are [PROPOSED].
 */
export const READING_SHEET_COPY = {
  close: "Close",
  save: "Save",
  addPassage: "Add a passage",
  editPassage: "Edit passage",
  addLink: "Add a link",
  editLink: "Edit link",
  title: "Title",
  optional: "Optional",
  untitled: "Untitled",
  passage: "Passage",
  passagePlaceholder: "A few lines, a paragraph, a page.",
  linkTitlePlaceholder: "What it is, in a few words",
  link: "Link",
  linkPlaceholder: "https://",
  linkHint: "A web address or a Spotify link.",
  notSaved: "Not saved. The words are still here; Save tries again.",
  offline: "Offline. The words stay here; Save waits for a connection.",
  /** Why Save waits, for a screen reader. */
  waits: "Save waits until there are words.",
  discardPassage: (title: string | null) =>
    title === null
      ? "The edits are not kept. The passage stays as it was."
      : `The edits to “${title}” are not kept. The passage stays as it was.`,
  discardLink: (title: string) =>
    `The edits to “${title}” are not kept. The link stays as it was.`,
  discardNewPassage: "The new passage is not kept.",
  discardNewLink: "The new link is not kept.",
} as const;
