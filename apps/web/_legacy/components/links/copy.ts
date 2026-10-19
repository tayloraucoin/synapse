/**
 * The links' strings — UX v1.3 §4.4 B8, R53, §3.17 (DAY-10), verbatim where
 * the document writes them; the rest `[COPY — needs Vesper sign-off]`. No
 * glyph in here (R29): the mark beside a link is `BrandGlyph`, from the kind
 * the server stored.
 */
export const LINKS_COPY = {
  /** `[COPY]` — the group's heading on B8 and under Settings → First thing. */
  heading: "To open",
  /** The empty line (§4.4 B8). */
  nothingYet: "A playlist, a track, a page. It opens with one tap from the morning.",
  addALink: "Add a link",
  /** The sheet's noun — `[COPY]`. */
  sheetTitle: "A link",
  editTitle: "Edit",
  title: "Title",
  link: "Link",
  linkPlaceholder: "https://…",
  cancel: "Cancel",
  save: "Save",
  edit: "Edit",
  remove: "Remove",
  /** The invalid-URL line (§4.4 B8, §13 #40) — the validator's own message. */
  invalid: "That link doesn't look right.",
  /** [COPY] */
  saveError: "Couldn’t save. Try again.",
} as const;
