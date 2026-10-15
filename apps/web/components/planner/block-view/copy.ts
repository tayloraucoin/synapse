/**
 * Block view's words (USE-48; block-view/words-and-access.md). Gloss: no
 * second person; times and lengths are the only numbers; nothing says
 * missed, late or skipped.
 */
export const BLOCK_VIEW_COPY = {
  length: (min: number) => `${min} min`,
  /** "Free until 8:00" [ASSUMPTION, open-1]. */
  freeUntil: (end: string) => `Free until ${end}`,
  /** Information in ink, never a warning (overflow.md). */
  runsPast: (min: number, end: string) => `Runs ${min} min past ${end}.`,
  /** The peek at the foot: "Training · 8:00 to 8:57". */
  peek: (name: string, span: string) => `${name} · ${span}`,
  checkbox: (title: string, start: string, length: string) =>
    `${title}, ${start}, ${length}`,
  reorder: (title: string) => `Reorder ${title}`,
} as const;
