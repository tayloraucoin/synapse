import { compareForTrim } from "./priority";

/**
 * The capacity trim — official spec §5.8, §6.6, §6.8, §0.3 R1.
 *
 * A TRIM IS NOT A MISS, AND THAT IS THE WHOLE POINT. Setting something aside
 * because the day got shorter is a planning act, not a failure: trimmed items
 * become `not_assigned`, get no `misses` row, and are never asked about in the
 * Day Review. The product's guardrail (§2.4) is that it does not keep score of
 * things a person never agreed to do, and this is where that is enforced.
 *
 * THREE KINDS ARE NEVER TRIMMED but always COUNT toward the planned total:
 *
 *  - **Hard items** are appointments; the day's shape is built around them, and
 *    trimming one would be the app cancelling a commitment.
 *  - **Done items** already happened. Their minutes are spent.
 *  - **Active items** are being lived right now.
 *
 * Counting them while refusing to trim them is what makes *Nothing else is
 * flexible. {r} min over.* an honest sentence rather than a bug: the day really
 * is over capacity and there really is nothing left to give.
 *
 * LOWEST IMPORTANCE FIRST (§6.6), through `compareForTrim` — ties break to the
 * shorter item, then to the later one, because a day partly lived is better
 * served by dropping something small and still ahead.
 */

export type TrimItem = {
  id: string;
  priority: number;
  durationMin: number | null;
  scheduledStart: Date | null;
  scheduling: "hard" | "soft";
  /** `assignment_state` — `assigned`, `not_assigned`, or `cut_by_shift`. */
  assignmentState: string;
  /** Done or running: spent minutes that cannot be given back. */
  spent: boolean;
};

export type TrimResult = {
  /** Assigned items to set aside, in the order they were chosen. */
  trimmedIds: string[];
  /** Previously trimmed items that fit again — *{n} come back.* */
  comeBackIds: string[];
  /** Every assigned item's minutes, hard and done included. */
  plannedMin: number;
  /** Minutes still over capacity once everything trimmable is trimmed. */
  overMin: number;
  /** True when nothing further can be given up (§6.8). */
  nothingElseFlexible: boolean;
};

/** No duration is zero minutes — there is nothing to free by removing it. */
function minutesOf(item: TrimItem): number {
  return item.durationMin ?? 0;
}

export function computeTrim(
  items: readonly TrimItem[],
  capacityMin: number,
  keep: ReadonlySet<string>,
): TrimResult {
  const assigned = items.filter((item) => item.assignmentState === "assigned");
  const previouslyTrimmed = items.filter(
    (item) => item.assignmentState === "not_assigned",
  );

  const plannedMin = assigned.reduce(
    (total, item) => total + minutesOf(item),
    0,
  );

  /*
   * Candidates in the order they would be given up. An item with no duration
   * is excluded: trimming it frees nothing, so offering it would be asking a
   * person to drop something for no gain.
   */
  const candidates = assigned
    .filter(
      (item) =>
        item.scheduling === "soft" &&
        !item.spent &&
        !keep.has(item.id) &&
        minutesOf(item) > 0,
    )
    .sort(compareForTrim);

  const trimmedIds: string[] = [];
  let remaining = plannedMin;

  for (const item of candidates) {
    if (remaining <= capacityMin) break;
    trimmedIds.push(item.id);
    remaining -= minutesOf(item);
  }

  /*
   * A SECOND TRIM BRINGS THINGS BACK. Room made by a larger capacity belongs to
   * whatever was set aside last time, cheapest first — the reverse of the order
   * that removed them, so the last thing given up is the first thing returned.
   */
  const comeBackIds: string[] = [];
  let headroom = capacityMin - remaining;

  for (const item of [...previouslyTrimmed].sort(
    (a, b) => compareForTrim(b, a),
  )) {
    const minutes = minutesOf(item);
    if (minutes > headroom) continue;
    comeBackIds.push(item.id);
    headroom -= minutes;
    remaining += minutes;
  }

  return {
    trimmedIds,
    comeBackIds,
    plannedMin,
    overMin: Math.max(0, remaining - capacityMin),
    // Everything trimmable has been trimmed and the day is still over.
    nothingElseFlexible:
      remaining > capacityMin && trimmedIds.length === candidates.length,
  };
}
