/**
 * The Tomorrow peek (USE-44; D-USE-73): Close the day names the next day's
 * first two blocks and the first's start, "Wellness at 7:05, then Training".
 *
 * The input is the next date's read (`readDay`'s `blocks`), structural so a
 * block record fits without this package importing it. A day with no blocks
 * has nothing to peek at: `null`, and the card is not drawn.
 */

export interface PeekOccurrence {
  block: { name: string };
  /** `HH:MM`, the time it runs on that date. */
  startsAt: string;
}

export interface TomorrowPeek {
  first: { name: string; startsAt: string };
  second?: { name: string };
}

export function tomorrowPeek(
  occurrences: ReadonlyArray<PeekOccurrence>,
): TomorrowPeek | null {
  const [first, second] = [...occurrences].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  if (first === undefined) return null;
  const peek: TomorrowPeek = {
    first: { name: first.block.name, startsAt: first.startsAt },
  };
  if (second !== undefined) peek.second = { name: second.block.name };
  return peek;
}
