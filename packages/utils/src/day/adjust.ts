import { fitToBudget, type FitItem } from "./budget";
import { stackBlock, type StackItem } from "./stack";

/**
 * Adjust's arithmetic — UX v1.1 §6.6, R4, R7 (TD-6). Pure: minutes in,
 * minutes out; the service reads rows into it and writes its answer.
 *
 * ONE FUNCTION, PREVIEWED AND RECOMPUTED. The sheet renders the proposal
 * from this; *Set* runs it again on the server against the live rows and
 * refuses if the day changed in between. Neither side trusts a number the
 * other computed (USE-6's pattern).
 *
 * THE SCOPE IS THE REST OF THE DAY TO THE NEXT HARD THING — the caller
 * decides where that is (`scopeOf` in the service): usually the morning to
 * the work anchor, in the evening the activity to the wind-down's start.
 * Inside it, every item is one of two things:
 *
 *   FIXED ...... a pin, a fixture, a hard item, something done or running.
 *                It stays where it is; the stack flows around it. Never
 *                shortened, never cut, never moved.
 *   MOVABLE .... a soft, upcoming, assigned item. What gives.
 *
 * WHAT GIVES, and HOW:
 *
 *   slide ...... nothing is shortened or cut; the movable items run on from
 *                now and the anchor moves by the overrun (*Start work later*).
 *   hold ....... the anchor stays and the movable set fits the room left:
 *     shorten ... each soft item to its range floor, lowest priority first,
 *                 only as far as needed, then cut ascending (R4 — `fitToBudget`)
 *     cut ....... no lengths change; cut ascending by priority until it fits
 *     choose .... the person's ticks stay at their lengths; the rest are left
 *                 out today — a choice, not a cut (v1 R1: not assigned)
 *
 * *Keep instead* (v1 §6.8) takes an item off the table: it is neither
 * shortened nor cut, and the next-lowest goes in its place.
 *
 * HARD ITEMS ARE NEVER TRIMMED and, under *choose*, are kept even when
 * unticked — reported in `keptHard` so the sheet can say so.
 *
 * OVER IS A NUMBER, NOT A REFUSAL (R7). When nothing soft is left to give
 * the proposal still comes back with `fits: false` and `overMin`; *Set* is
 * still allowed. The number is the feedback.
 */

export type AdjustItem = StackItem & {
  /** Where the item currently sits, minutes from midnight of the day. */
  startMin: number;
  /** The habit's range floor — the only bound shortening applies (R21). */
  durationMinMin: number | null;
  /** A fixed point: pin, fixture, hard, done, or running. */
  isFixed: boolean;
};

export type AdjustWhat = "slide" | "hold";
export type AdjustHow = "shorten" | "cut" | "choose";

export type AdjustInput = {
  /** The scope's items, fixed and movable, in their current time order. */
  items: ReadonlyArray<AdjustItem>;
  nowMin: number;
  /** The next hard thing: the work anchor, the wind-down's start, a pin. */
  anchor: { min: number; isHard: boolean };
  what: AdjustWhat;
  /** Required under `hold`; ignored under `slide`. */
  how?: AdjustHow;
  /** *Choose what stays* — the ticked ids. */
  chosenIds?: ReadonlyArray<string>;
  /** *Keep instead* — never shortened or cut. */
  keepInstead?: ReadonlyArray<string>;
};

export type AdjustPlacement = {
  id: string;
  startMin: number;
  endMin: number;
  durationMin: number;
  fixed: boolean;
};

export type AdjustResult = {
  /** Every item in the scope, where the proposal puts it. */
  proposal: AdjustPlacement[];
  shortened: string[];
  /** Cut by the refit: a miss with the reason's tier. */
  cut: string[];
  /** Left out by *choose*: not assigned today, no miss. */
  notAssigned: string[];
  /** Hard items the person left unticked; kept regardless. */
  keptHard: string[];
  /** How far the anchor moves — `slide` only; 0 under `hold`. */
  slideMin: number;
  newAnchorMin: number;
  /** Minutes still over the anchor after everything above; 0 when it fits. */
  overMin: number;
  fits: boolean;
};

/** Fixed points enter the walk as pins where they are. */
function asPins(items: ReadonlyArray<AdjustItem>): StackItem[] {
  return items.map((item) =>
    item.isFixed
      ? { ...item, pinnedAtMin: item.pinnedAtMin ?? item.startMin, gapBeforeMin: 0 }
      : { ...item, pinnedAtMin: null, gapBeforeMin: 0 },
  );
}

/** Minutes of the room between now and the anchor that fixed points occupy. */
function fixedWithin(items: ReadonlyArray<AdjustItem>, nowMin: number, anchorMin: number): number {
  let occupied = 0;
  for (const item of items) {
    if (!item.isFixed) continue;
    const start = Math.max(nowMin, item.pinnedAtMin ?? item.startMin);
    const end = Math.min(anchorMin, (item.pinnedAtMin ?? item.startMin) + item.durationMin);
    if (end > start) occupied += end - start;
  }
  return occupied;
}

export function computeAdjust(input: AdjustInput): AdjustResult {
  const keep = new Set(input.keepInstead ?? []);
  const movable = input.items.filter((item) => !item.isFixed);
  const durations = new Map(input.items.map((item) => [item.id, item.durationMin]));

  const shortened: string[] = [];
  const cut: string[] = [];
  const notAssigned: string[] = [];
  const keptHard: string[] = [];

  if (input.what === "hold") {
    const availableMin = Math.max(
      0,
      input.anchor.min - input.nowMin - fixedWithin(input.items, input.nowMin, input.anchor.min),
    );

    if (input.how === "choose") {
      const chosen = new Set(input.chosenIds ?? []);
      for (const item of input.items) {
        if (item.isFixed) continue;
        if (chosen.has(item.id)) continue;
        if (item.scheduling === "hard") {
          keptHard.push(item.id);
          continue;
        }
        notAssigned.push(item.id);
      }
    } else {
      const fitItems: FitItem[] = movable.map((item) => ({
        ...item,
        // *Keep instead* is off the table: as good as hard to the fit.
        scheduling: keep.has(item.id) ? "hard" : item.scheduling,
        isAssigned: true,
      }));
      const fit = fitToBudget(
        fitItems,
        availableMin,
        input.how === "shorten" ? "shorten_then_cut" : "cut_only",
      );
      for (const kept of fit.keep) {
        if (kept.shortened) {
          shortened.push(kept.id);
          durations.set(kept.id, kept.durationMin);
        }
      }
      cut.push(...fit.cut);
    }
  }

  // The walk: what remains, forward from now, around the fixed points.
  const gone = new Set([...cut, ...notAssigned]);
  const walkItems = asPins(
    input.items.filter((item) => !gone.has(item.id)),
  ).map((item) => ({ ...item, durationMin: durations.get(item.id) ?? item.durationMin }));

  const walk = stackBlock({
    items: walkItems,
    flow: "forward",
    anchorMin: input.nowMin,
    bound: input.anchor.min,
  });

  const placedById = new Map(walk.placed.map((entry) => [entry.id, entry]));
  const proposal: AdjustPlacement[] = walkItems
    .map((item) => {
      const placed = placedById.get(item.id);
      if (!placed) return null;
      return {
        id: item.id,
        startMin: placed.startMin,
        endMin: placed.endMin,
        durationMin: item.durationMin,
        fixed: placed.pinned,
      };
    })
    .filter((entry): entry is AdjustPlacement => entry !== null)
    .sort((a, b) => a.startMin - b.startMin);

  // The overrun is measured on the movable set: a fixed point past the
  // anchor (a pin in the evening) is not the morning running long.
  const movableEnd = proposal
    .filter((entry) => !entry.fixed)
    .reduce((max, entry) => Math.max(max, entry.endMin), input.nowMin);
  const overrun = Math.max(0, movableEnd - input.anchor.min);

  if (input.what === "slide") {
    return {
      proposal,
      shortened,
      cut,
      notAssigned,
      keptHard,
      slideMin: overrun,
      newAnchorMin: input.anchor.min + overrun,
      overMin: 0,
      fits: true,
    };
  }

  return {
    proposal,
    shortened,
    cut,
    notAssigned,
    keptHard,
    slideMin: 0,
    newAnchorMin: input.anchor.min,
    overMin: overrun,
    fits: overrun === 0,
  };
}

/**
 * The day's shape at this instant — compared before a write. Ids, states,
 * done-ness, lengths and times of the scope's items: everything the proposal
 * reads. Hashed (FNV-1a, 64-bit as two hex words) so it travels as one short
 * token; a collision would need two different days to hash alike, which is
 * not a risk the ten-minute window has time for.
 */
export function fingerprintOf(
  items: ReadonlyArray<{
    id: string;
    assignmentState: string;
    completionState: string;
    doneAt: Date | null;
    durationMin: number | null;
    scheduledStart: Date | null;
  }>,
): string {
  const text = [...items]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(
      (item) =>
        `${item.id}:${item.assignmentState}:${item.completionState}:${item.doneAt?.getTime() ?? ""}:${item.durationMin ?? ""}:${item.scheduledStart?.getTime() ?? ""}`,
    )
    .join("|");

  let a = 0x811c9dc5;
  let b = 0x01000193;
  for (let index = 0; index < text.length; index += 1) {
    const code = text.charCodeAt(index);
    a = Math.imul(a ^ code, 0x01000193) >>> 0;
    b = Math.imul(b ^ code, 0x9e3779b1) >>> 0;
  }
  return `${items.length}:${a.toString(16).padStart(8, "0")}${b.toString(16).padStart(8, "0")}`;
}
