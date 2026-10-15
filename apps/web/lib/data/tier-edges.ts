import { TIER_USUAL } from "@syn/constants";
import type { WorkTier } from "@syn/types";
import { activeBlock } from "@syn/utils";
import type { Today } from "./derive-today";
import type { TodayWorkView } from "./today-work";

/**
 * Today's tier edges (USE-61; work/today/states/primary-only.md,
 * urgent-above-primary.md, past-a-cap.md, later-work-block.md). Pure, so a
 * test reads the rules the screen draws: a tier past its usual number takes
 * a soft helper and the add still goes through (D-USE-65); the day's second
 * Work block shows only what is still open, with a quiet line naming where
 * the done work stays; a firing item is not done, so it stays, firing.
 */

export const TIER_EDGE_COPY = {
  /** D-USE-65: the helper is the usual number, never a count of the tier. */
  usual: {
    primary: "Two is the usual for Primary.",
    secondary: "Four is the usual for Secondary.",
  },
  /** A folded heading's add [PROPOSED, D-USE-77]. */
  add: "+ Add",
  /** The desk's add on an empty tier (D-USE-41). */
  addTo: (word: string) => `+ Add to ${word}`,
  /** The folded add's name carries its tier. */
  addToName: (word: string) => `Add to ${word}`,
  /** The later block's quiet line [PROPOSED, D-USE-77]. */
  stillOpen: (startsAt: string) =>
    `What's still open from the morning's Work. What was done stays in the ${startsAt} block.`,
} as const;

/** The tier's helper once it holds more than its usual number; else none. */
export function capHelper(tier: WorkTier, count: number): string | null {
  if (tier !== "primary" && tier !== "secondary") return null;
  return count > TIER_USUAL[tier] ? TIER_EDGE_COPY.usual[tier] : null;
}

/** The later Work block: the current one, when a Work block ran before it. */
export interface LaterWorkBlock {
  /** The current block's start: work done before it stays in its block. */
  start: Date;
  /** "9:30": the day's first Work block's start, as the line names it. */
  earlierStartsAt: string;
}

/**
 * The current block when it is Work and an earlier Work block ran today
 * [ASSUMPTION: the line names the day's first Work block, the morning's].
 */
export function laterWorkBlockOf(
  today: Today,
  now: Date,
): LaterWorkBlock | null {
  const blocks = today.occurrences.blocks;
  const current = activeBlock(
    blocks.map((occurrence) => ({
      id: occurrence.block.id,
      start: occurrence.start,
      end: occurrence.end,
      occurrence,
    })),
    now,
  )?.occurrence;
  if (!current || current.block.kind !== "work") return null;
  const earlier = blocks
    .filter(
      (occurrence) =>
        occurrence.block.kind === "work" && occurrence.end <= current.start,
    )
    .sort((a, b) => a.start.getTime() - b.start.getTime())[0];
  if (!earlier) return null;
  return {
    start: current.start,
    earlierStartsAt: earlier.startsAt.replace(/^0(\d)/, "$1"),
  };
}

/**
 * The later block's tiers on the phone (C-USE-today-later-work-block-1):
 * a row done before the block began is left out, so it never sits in two
 * blocks; a row done inside it stays with its record, and a firing row is
 * not done, so it stays in its tier, still firing (D-USE-57). Next is
 * untouched: a done row is never Next. A tier left with nothing folds.
 */
export function stillOpenView(view: TodayWorkView): TodayWorkView {
  const later = view.later;
  if (!later) return view;
  return {
    ...view,
    tiers: view.tiers.flatMap((group) => {
      const rows = group.rows.filter((row) => !later.doneBefore.has(row.id));
      if (group.tier === "urgent" && rows.length === 0) return [];
      return [{ ...group, rows }];
    }),
  };
}
