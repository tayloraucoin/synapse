/**
 * The resolver — official spec §7.3 and §7.4, and Epic 3 §5.
 *
 * ONE NUMBER, AND IT ALWAYS CARRIES ITS TERMS. The product's single
 * non-negotiable about scoring is that the number never appears without the
 * sentence that produced it, so `computeAdherence` returns the terms rather
 * than leaving each surface to reconstruct them. Two reconstructions would
 * eventually disagree with the number they sit under, and the number is the
 * thing people would believe.
 *
 * EXCLUDED LEAVES THE DENOMINATOR — it is not credited zero. That distinction
 * is the whole ethic of the scoring: something that genuinely could not happen
 * did not fail to happen, and counting it as a zero would make a fever look
 * like a choice. `counted` is "items not excluded", exactly as §7.4 says.
 *
 * HALF IS 0.5 AND THE ROUNDING HAPPENS ONCE, AT THE END. Rounding per item
 * would turn 2.5 of 3 into either 100% or 67% depending on which way each half
 * fell, and neither is 83%.
 *
 * NOTHING HERE READS A CLOCK. `offSchedule` and `done` are booleans the caller
 * computed; this file is arithmetic over a list, which is what makes every
 * case below runnable without a database.
 */

/** The one number's band split — official spec §7.4. */
export type PriorityBand = "high" | "mid" | "low";

/** How one item resolved, in the words the review prints. */
export type ItemVerdict =
  | "done"
  | "done-moved"
  | "half"
  | "missed"
  | "not-counted"
  | "pending"
  | "excluded";

export type TradedUp = {
  /** The traded item's CURRENT state — read fresh, never frozen. */
  done: boolean;
  priority: number;
};

export type ScoredMiss = {
  tier: "circumstance" | "scoping" | "chose_not_to";
  reasonKey: string | null;
  /** Set only for the *stayed on something more important* reason. */
  tradedUp: TradedUp | null;
};

export type ScoredItem = {
  id: string;
  /** 1–7 (official spec §6.6). */
  priority: number;
  done: boolean;
  offSchedule: boolean;
  assignmentState: "assigned" | "not_assigned" | "cut_by_shift";
  completionState:
    | "upcoming"
    | "active"
    | "done"
    | "missed"
    | "carried"
    | "pending_review";
  miss: ScoredMiss | null;
};

export type FormulaTermOut = {
  count: number;
  label: string;
  weight?: "½" | "0" | "not counted";
};

export type BandResult = { credit: number; counted: number };

export type AdherenceResult = {
  credit: number;
  counted: number;
  /** Null when nothing was counted — *Nothing was counted today.* */
  percent: number | null;
  terms: FormulaTermOut[];
  bands: Record<PriorityBand, BandResult | null>;
  offSchedule: { moved: number; done: number };
  perItem: Record<string, { credit: number | null; verdict: ItemVerdict }>;
};

/** high 5–7 · mid 3–4 · low 1–2 — official spec §7.4. */
export function bandOf(priority: number): PriorityBand {
  if (priority >= 5) return "high";
  if (priority >= 3) return "mid";
  return "low";
}

/**
 * One item's contribution, and why — official spec §7.3, in its own order.
 *
 * `credit: null` means EXCLUDED: the item leaves the denominator entirely.
 * That is different from `credit: 0`, which counts and scores nothing.
 */
export function creditFor(item: ScoredItem): {
  credit: number | null;
  verdict: ItemVerdict;
} {
  // A trimmed item was never assigned; it cannot have been missed (§5.8).
  if (item.assignmentState === "not_assigned") {
    return { credit: null, verdict: "excluded" };
  }

  // Undecided on a closed day. It scores when the review resolves it, and not
  // before — a number computed over undecided items would be a guess.
  if (item.completionState === "pending_review") {
    return { credit: null, verdict: "pending" };
  }

  // Carried forward: excluded TODAY, scored on the day it resolves (§7.3).
  if (item.completionState === "carried") {
    return { credit: null, verdict: "excluded" };
  }

  // Done is done, on schedule or moved. A late start is annotated, not
  // penalised (§6.3) — the record says *moved*, the number says 1.
  if (item.done || item.completionState === "done") {
    return { credit: 1, verdict: item.offSchedule ? "done-moved" : "done" };
  }

  const miss = item.miss;
  if (miss === null) {
    // Undone on a live day with no decision yet. It has not resolved, so it
    // does not score — the same treatment as pending, one state earlier.
    return { credit: null, verdict: "pending" };
  }

  if (miss.tier === "circumstance") {
    return { credit: null, verdict: "not-counted" };
  }

  if (miss.tier === "chose_not_to") {
    return { credit: 0, verdict: "missed" };
  }

  /*
   * `scoping`, with one exception.
   *
   * TRADED UP IS VERIFIED, NOT CLAIMED (§7.3). "I stayed on something more
   * important" is excused only when the thing stayed on was AT LEAST as
   * important and actually got DONE. Both halves matter: the priority test
   * stops the excuse from laundering a low-priority distraction, and the done
   * test stops it from excusing an afternoon that produced nothing either.
   *
   * It reads the traded item's CURRENT row, so an item still running scores a
   * half now and becomes excluded the moment it is finished — with no other
   * change and nothing to recompute. A verdict frozen at decision time would
   * have to be chased and would go stale.
   */
  const traded = miss.tradedUp;
  if (traded !== null && traded.done && traded.priority >= item.priority) {
    return { credit: null, verdict: "not-counted" };
  }

  return { credit: 0.5, verdict: "half" };
}

/** The sentence's terms, in the sentence's order (Epic 3 DR-07). */
const TERM_LABELS = {
  done: "done",
  half: "planned wrong",
  missed: "didn't do",
  excluded: "not counted",
} as const;

export function computeAdherence(
  items: readonly ScoredItem[],
): AdherenceResult {
  let credit = 0;
  let counted = 0;

  let doneCount = 0;
  let halfCount = 0;
  let missedCount = 0;
  let excludedCount = 0;

  let movedCount = 0;

  const bandTotals: Record<PriorityBand, BandResult> = {
    high: { credit: 0, counted: 0 },
    mid: { credit: 0, counted: 0 },
    low: { credit: 0, counted: 0 },
  };
  const bandSeen: Record<PriorityBand, boolean> = {
    high: false,
    mid: false,
    low: false,
  };

  const perItem: AdherenceResult["perItem"] = {};

  for (const item of items) {
    const resolved = creditFor(item);
    perItem[item.id] = resolved;

    if (resolved.verdict === "done" || resolved.verdict === "done-moved") {
      doneCount += 1;
      if (item.offSchedule) movedCount += 1;
    }

    // A pending item is in no term at all: the sentence describes what was
    // decided, and nothing has been.
    if (resolved.credit === null) {
      if (resolved.verdict === "not-counted" || resolved.verdict === "excluded") {
        excludedCount += 1;
      }
      continue;
    }

    if (resolved.verdict === "half") halfCount += 1;
    if (resolved.verdict === "missed") missedCount += 1;

    credit += resolved.credit;
    counted += 1;

    const band = bandOf(item.priority);
    bandSeen[band] = true;
    bandTotals[band].credit += resolved.credit;
    bandTotals[band].counted += 1;
  }

  const allTerms: FormulaTermOut[] = [
    { count: doneCount, label: TERM_LABELS.done },
    { count: halfCount, label: TERM_LABELS.half, weight: "½" },
    { count: missedCount, label: TERM_LABELS.missed, weight: "0" },
    {
      count: excludedCount,
      label: TERM_LABELS.excluded,
      weight: "not counted",
    },
  ];

  // A term nobody earned is not a term. The composite filters too; doing it
  // here as well is what makes the API's sentence and the screen's identical.
  const terms = allTerms.filter((term) => term.count > 0);

  return {
    credit,
    counted,
    // Rounded once, from the exact sum.
    percent: counted === 0 ? null : Math.round((credit / counted) * 100),
    terms,
    bands: {
      high: bandSeen.high ? bandTotals.high : null,
      mid: bandSeen.mid ? bandTotals.mid : null,
      low: bandSeen.low ? bandTotals.low : null,
    },
    offSchedule: { moved: movedCount, done: doneCount },
    perItem,
  };
}
