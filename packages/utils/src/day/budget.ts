import { compareForTrim } from "./priority";
import type { StackItem } from "./stack";

/**
 * The morning's budget and the fit — UX v1.1 §3.3, §3.10, §5.3, §6.6, R4.
 *
 * `computeBudget` is the one line of arithmetic the first-run fit screen, the
 * quick-pick's budget line, and Adjust all show: wake to work, minus orient,
 * minus mandatory prep, is what the routine has (§3.3: `120 − 3 − 45 = 72`).
 *
 * `fitToBudget` is R4 as code — "shortening stops at each item's range floor;
 * if it still doesn't fit, the lowest-priority items are cut" — and the
 * quick-pick's *Shorten to fit*, Adjust's *Shorten everything* and *Cut
 * some*, and the `auto_trim` overflow mode all call it.
 *
 * WHAT IS COUNTED. Durations only. The budget line reads *68 chosen · 72
 * available*, and "chosen" is the sum of what the person ticked; transitions
 * are the walk's business (`stackBlock`) and a menu morning has none.
 *
 * WHAT IS NEVER TOUCHED. A hard item is neither shortened nor cut, and always
 * counts (v1 §5.8: "Hard items are never trimmed"). The range floor is the
 * only bound anything here applies, and only downward, only in *shorten* —
 * nothing in this file clamps a duration to a range (R21).
 *
 * THE SHORTEN ORDER. Lowest priority first, each to its floor, until it fits
 * — the same order the cut step uses, so the two halves of the rule agree
 * about what matters least. Shortening stops as soon as the total fits: a
 * three-minute overrun costs one item three minutes, not five items their
 * floors. Logged in TECHNICAL-DECISIONS (DYN-1).
 */

export function computeBudget(input: {
  wakeMin: number;
  workStartMin: number;
  orientMin: number;
  prepTotalMin: number;
}): { availableMin: number } {
  return {
    availableMin: Math.max(
      0,
      input.workStartMin - input.wakeMin - input.orientMin - input.prepTotalMin,
    ),
  };
}

export type FitItem = StackItem & {
  /** The habit's range floor; null when the habit has no range. */
  durationMinMin: number | null;
  /** Only assigned items are on the table; the rest are ignored entirely. */
  isAssigned: boolean;
};

export type FitResult = {
  /** In input order. `durationMin` is the length after any shortening. */
  keep: Array<{ id: string; durationMin: number; shortened: boolean }>;
  /** In the order they were cut — least important first. */
  cut: string[];
  /** Sum of kept durations. */
  totalMin: number;
  /** Minutes still over when nothing soft is left to give; 0 when it fits. */
  overMin: number;
};

export type FitMode = "shorten_then_cut" | "cut_only";

/** `compareForTrim` wants a start; on a menu the stack position is the start. */
function sortable(item: FitItem, position: number, durationMin: number) {
  return {
    priority: item.priority,
    durationMin,
    scheduledStart: new Date(position * 60000),
  };
}

export function fitToBudget(
  items: ReadonlyArray<FitItem>,
  availableMin: number,
  mode: FitMode,
): FitResult {
  const assigned = items
    .map((item, position) => ({ item, position }))
    .filter(({ item }) => item.isAssigned);

  const durations = new Map<string, number>(
    assigned.map(({ item }) => [item.id, Math.max(0, item.durationMin)]),
  );
  const shortenedIds = new Set<string>();
  const cutIds: string[] = [];

  const total = (): number =>
    assigned.reduce(
      (sum, { item }) =>
        cutIds.includes(item.id) ? sum : sum + (durations.get(item.id) ?? 0),
      0,
    );

  // Least important first — the same order for shortening and for cutting.
  const soft = assigned
    .filter(({ item }) => item.scheduling === "soft")
    .sort((a, b) =>
      compareForTrim(
        sortable(a.item, a.position, durations.get(a.item.id) ?? 0),
        sortable(b.item, b.position, durations.get(b.item.id) ?? 0),
      ),
    );

  if (mode === "shorten_then_cut") {
    for (const { item } of soft) {
      const over = total() - availableMin;
      if (over <= 0) break;
      const current = durations.get(item.id) ?? 0;
      const floor = Math.min(current, Math.max(0, item.durationMinMin ?? current));
      const give = Math.min(over, current - floor);
      if (give <= 0) continue;
      durations.set(item.id, current - give);
      shortenedIds.add(item.id);
    }
  }

  for (const { item } of soft) {
    if (total() <= availableMin) break;
    cutIds.push(item.id);
  }

  const totalMin = total();

  return {
    keep: assigned
      .filter(({ item }) => !cutIds.includes(item.id))
      .map(({ item }) => ({
        id: item.id,
        durationMin: durations.get(item.id) ?? 0,
        shortened: shortenedIds.has(item.id),
      })),
    cut: cutIds,
    totalMin,
    overMin: Math.max(0, totalMin - availableMin),
  };
}
