import { compareForTrim } from "./priority";

/**
 * What a shift does to a day — official spec §5.6, §6.5, §6.6.
 *
 * PURE, AND THE ONLY IMPLEMENTATION. The preview the sheet renders and the
 * write the server performs both call this function, so they cannot disagree
 * about what moves, what overflows, or what is suggested for cutting. A second
 * copy of this arithmetic is a sheet that promises one thing and a database
 * that does another — which is the risk class this ticket names.
 *
 * THREE KINDS OF ITEM NEVER MOVE, and each for its own reason:
 *
 *  - **Hard items** are appointments. The whole meaning of `scheduling = hard`
 *    is that the world, not the plan, decided when they happen.
 *  - **Done items** are records. Moving one would rewrite what happened.
 *  - **Running items** are being lived right now; the elapsed time is attached
 *    to a session that started at a real instant.
 *
 * OVERFLOW IS EVALUATED ON POST-SHIFT POSITIONS ONLY. A soft item that already
 * overlapped a hard one before the shift still counts as overflow afterwards,
 * because the question the sheet asks is "does this day fit", not "did the
 * shift make it worse". `[REVISIT: if this reads as a false cut in use.]`
 */

export type ShiftItem = {
  id: string;
  priority: number;
  durationMin: number | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  scheduling: "hard" | "soft";
  /** True for done, running, deferred, cut, or already-missed rows. */
  touched: boolean;
  /** False for `not_assigned` rows — they are not on the day's clock. */
  assigned: boolean;
};

export type ShiftFitInput = {
  items: readonly ShiftItem[];
  deltaMin: number;
  /** `dayWindow(...).end` — the instant the day closes. */
  windowEnd: Date;
  now: Date;
};

export type ShiftFit = {
  /** Ids of items the shift moves, and by how much (`deltaMin`). */
  movingIds: string[];
  /** Done or running items that stay where they are — the *{d} done* line. */
  stayingIds: string[];
  /** Post-shift positions of the items that no longer fit. */
  overflow: Array<{ id: string; newStart: Date | null; newEnd: Date | null }>;
  /** Hard items already in the past — flagged as late, never cut. */
  passedHardIds: string[];
  /** Overflowing items, lowest priority first (§6.6). Pre-checked in the UI. */
  suggestedCutIds: string[];
};

const MS_PER_MIN = 60_000;

/** Does `[aStart, aEnd)` overlap `[bStart, bEnd)`? Touching ends do not. */
function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart.getTime() < bEnd.getTime() && bStart.getTime() < aEnd.getTime();
}

/** An item's end, falling back to its start when it has no duration. */
function endOf(start: Date, end: Date | null): Date {
  return end ?? start;
}

export function computeShiftFit(input: ShiftFitInput): ShiftFit {
  const shiftMs = input.deltaMin * MS_PER_MIN;

  const movable = (item: ShiftItem): boolean =>
    item.assigned &&
    !item.touched &&
    item.scheduling === "soft" &&
    item.scheduledStart !== null;

  const movingIds: string[] = [];
  const stayingIds: string[] = [];

  for (const item of input.items) {
    if (movable(item)) movingIds.push(item.id);
    else if (item.touched && item.assigned) stayingIds.push(item.id);
  }

  /*
   * The anchors a moved item can collide with: every HARD item still on the
   * day, at its own unchanged time. Done hard items are included — a meeting
   * that happened still occupied that hour, and scheduling something on top of
   * it would be planning to be in two places at once.
   */
  const anchors = input.items
    .filter(
      (item) =>
        item.assigned &&
        item.scheduling === "hard" &&
        item.scheduledStart !== null,
    )
    .map((item) => ({
      start: item.scheduledStart as Date,
      end: endOf(item.scheduledStart as Date, item.scheduledEnd),
    }));

  const movingSet = new Set(movingIds);
  const overflow: ShiftFit["overflow"] = [];

  for (const item of input.items) {
    if (!movingSet.has(item.id)) continue;

    const start = new Date((item.scheduledStart as Date).getTime() + shiftMs);
    const end = new Date(
      endOf(item.scheduledStart as Date, item.scheduledEnd).getTime() + shiftMs,
    );

    // Past the day's own end, or on top of something the world fixed.
    const runsPastClose = end.getTime() > input.windowEnd.getTime();
    const hitsAnchor = anchors.some((anchor) =>
      overlaps(start, end, anchor.start, anchor.end),
    );

    if (runsPastClose || hitsAnchor) {
      overflow.push({ id: item.id, newStart: start, newEnd: end });
    }
  }

  /*
   * *Already passed — will show as late.* A hard item whose time has gone is
   * not something a shift can fix — it cannot move, and cutting it would erase
   * an appointment the person may still have kept. So it is named and left
   * alone (§5.6: "a hard item made already-passed is flagged, not cut").
   */
  const passedHardIds = input.items
    .filter(
      (item) =>
        item.assigned &&
        !item.touched &&
        item.scheduling === "hard" &&
        item.scheduledStart !== null &&
        (item.scheduledStart as Date).getTime() <= input.now.getTime(),
    )
    .map((item) => item.id);

  const byId = new Map(input.items.map((item) => [item.id, item]));
  const suggestedCutIds = overflow
    .map((entry) => byId.get(entry.id))
    .filter((item): item is ShiftItem => item !== undefined)
    .sort(compareForTrim)
    .map((item) => item.id);

  return { movingIds, stayingIds, overflow, passedHardIds, suggestedCutIds };
}

/**
 * How many minutes the day is still over, given what has been cut.
 *
 * IT IS THE SUM OF THE STILL-OVERFLOWING DURATIONS, which is what makes the
 * sheet's three sentences add up: cutting frees the cut items' minutes, and
 * what is left over is everything still not fitting.
 *
 * EACH ITEM'S OVERFLOW IS INDEPENDENT under the rule above — an item overflows
 * against the hard anchors and the day's end, never against another soft item —
 * so cutting one can never resolve another's, and the suggested set is simply
 * every overflowing item. The ticket's ruling says to recompute after each cut;
 * that instruction is honoured by this function being called with the live cut
 * set on every change rather than by a loop, and it is worth stating that the
 * loop would terminate in one pass today. If overflow ever gains a soft-soft
 * term, this is the function that has to grow a loop.
 */
export function overMinutes(
  overflow: ShiftFit["overflow"],
  items: readonly ShiftItem[],
  cut: ReadonlySet<string>,
): number {
  const byId = new Map(items.map((item) => [item.id, item]));

  return overflow
    .filter((entry) => !cut.has(entry.id))
    .reduce((total, entry) => total + durationOf(byId.get(entry.id)), 0);
}

/** Minutes freed by cutting a set — the *frees {f} min* half of the line. */
export function freedMinutes(
  items: readonly ShiftItem[],
  cut: ReadonlySet<string>,
): number {
  return items
    .filter((item) => cut.has(item.id))
    .reduce((total, item) => total + durationOf(item), 0);
}

function durationOf(item: ShiftItem | undefined): number {
  if (item === undefined) return 0;
  if (item.durationMin !== null) return item.durationMin;
  if (item.scheduledStart === null || item.scheduledEnd === null) return 0;
  return Math.max(
    0,
    Math.round(
      (item.scheduledEnd.getTime() - item.scheduledStart.getTime()) /
        MS_PER_MIN,
    ),
  );
}
