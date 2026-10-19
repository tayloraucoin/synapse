/**
 * The reader's words (USE-13; orient/states/passage-open.md). The caption is
 * the caller's ("Morning reading"); the × is named "Close" [ASSUMPTION: Gloss].
 */
export const PASSAGE_READER_COPY = {
  close: "Close",
  slide: (position: number, count: number) => `${position} of ${count}`,
} as const;
