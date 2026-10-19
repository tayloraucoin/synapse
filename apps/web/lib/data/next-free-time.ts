import { clockMinutes } from "@syn/utils";

/**
 * Where the rail + sits (D-USE-15: one +, at the next free time; USE-37).
 * From the later of now and Orient's end, the first gap between blocks of
 * at least `minGapMin`, else where the last block ends. Meals count as
 * taken [ASSUMPTION: a meal is planned time, not free]. On Review the day's
 * Monday that is 15:00, past the screen, so the + rests at the column's foot
 * beside Lunch; after Yoga's swap it is the freed 8:50.
 */

/** D-USE-81: the shortest thing the day plans is five minutes. */
export const MIN_FREE_GAP_MIN = 5;

export function nextFreeTimeMin({
  fromMin,
  blocks,
  minGapMin = MIN_FREE_GAP_MIN,
}: {
  fromMin: number;
  blocks: readonly { startsAt: string; endsAt: string }[];
  minGapMin?: number;
}): number {
  const spans = blocks
    .map((block) => ({
      start: clockMinutes(block.startsAt),
      end: clockMinutes(block.endsAt),
    }))
    .sort((a, b) => a.start - b.start);
  let cursor = fromMin;
  for (const span of spans) {
    if (span.end <= cursor) continue;
    if (span.start - cursor >= minGapMin) return cursor;
    cursor = Math.max(cursor, span.end);
  }
  return cursor;
}
