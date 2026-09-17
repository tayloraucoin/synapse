/**
 * The carousel's words — UX v1.2 §5.2 (RUN-7). [COPY — needs Vesper sign-off]
 */
export const PASSAGE_CAROUSEL_COPY = {
  region: "Today's reading",
  /** The chrome caption above a quote-day slide. */
  quoteCaption: "A quote",
  dots: "Passages",
  dot: (position: number, count: number) => `Passage ${position} of ${count}`,
} as const;
