/**
 * The passages' strings — UX v1.2 §4.6, verbatim where the document writes
 * them; the rest `[COPY — needs Vesper sign-off]`. No glyph in here (R29).
 *
 * NEVER AN EXAMPLE PASSAGE, never a starter phrase: the one placeholder is
 * the empty state's own line, reused, and it describes a shape, not words.
 */
export const PASSAGES_COPY = {
  heading: "Passages",
  /** The empty state's line (§4.6) — and the editor's placeholder. */
  nothingYet: "Nothing saved yet. A few lines, a paragraph, a page.",
  editorPlaceholder: "A few lines, a paragraph, a page.",
  addAPassage: "Add a passage",
  /** The sheet-scoped noun (§4, the frame rules). */
  sheetTitle: "A passage",
  editTitle: "Edit",
  title: "Title",
  titlePlaceholder: "Untitled",
  passage: "Passage",
  images: "Images",
  addAnImage: "Add an image",
  removeImage: (n: number) => `Remove image ${n}`,
  /** [COPY] The tile when the upload failed. */
  didntUpload: "Didn’t upload",
  tryAgain: "Try again",
  tags: "Tags",
  /** [COPY — needs Vesper sign-off] */
  tagsPlaceholder: "calm, morning",
  cancel: "Cancel",
  save: "Save",
  /** [COPY — needs Vesper sign-off] */
  saveError: "Couldn’t save. Try again.",
  /** [COPY] Near the body's limit. */
  nearLimit: (used: number, max: number) => `${used} of ${max}`,
  overLimit: "That’s longer than a passage holds.",
  edit: "Edit",
  archive: "Archive",
  /** [COPY] The inline undo line. */
  archived: "Archived.",
  undo: "Undo",
  offline: "Offline — you can look, but changes need a connection.",
  /** The card's accessible name when a passage has no title: its first words. */
  untitled: "Untitled",
} as const;
