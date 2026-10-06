/**
 * The budget line's words — UX v1.1 §5.3, verbatim: *68 chosen · 72
 * available*. No "over", no "left", no adjective: the two numbers are the
 * whole sentence.
 */
export const BUDGET_LINE_COPY = {
  chosen: "chosen",
  available: "available",
  /** The live region's sentence; the numbers, then the words. */
  sentence: (chosenMin: number, availableMin: number, availableLabel: string = "available") =>
    `${chosenMin} chosen, ${availableMin} ${availableLabel}`,
} as const;
