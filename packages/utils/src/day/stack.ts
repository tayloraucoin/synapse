import { AppError } from "../errors";

/**
 * THE block arithmetic — UX v1.1 §3.2, §3.3, §3.5, §11.11 (TD-4).
 *
 * One function, five callers: the block editor's footer, the quick-pick's
 * budget line, the first-run fit screen, Adjust's proposal, and the
 * materialiser. That is the whole reason it exists — the arithmetic can be
 * shown live in four places without four implementations, and a second walk
 * anywhere is a defect.
 *
 * PURE. Minutes from the day's start in, minutes out. No `Date`, no zone, no
 * I/O: the materialiser converts with `wallClockToInstant`; the editor and
 * the pick never need a zone at all.
 *
 * THE RULES, in the order they bind:
 *
 *  - Items walk in `sort_order`. Each starts where the previous ended, plus
 *    its gap. Gaps are first-class (ledger §6); a negative one is a
 *    validator's job and is treated as zero here.
 *  - A PIN NEVER MOVES (R3). A pinned item starts at `pinnedAtMin` regardless
 *    of where the stack has reached; the stack flows around it — the next
 *    unpinned item starts after the pin. If the item before a pin runs past
 *    the pin's start, the pin is reported in `overrunPinIds` and still does
 *    not move. A pin before the block's own start is placed where it is and
 *    the stack starts at the anchor; that is not an overrun.
 *  - OVERRUN IS REPORTED, NEVER CLAMPED. `stackBlock` shortens nothing;
 *    `fitToBudget` does, and only when asked (R4).
 *  - A MULTITASK BRACKET IS ONE POSITION. Members share a start; the bracket
 *    ends at its longest member's end; the others contribute nothing to the
 *    walk (v1 §5.5).
 *  - A ONE-OF GROUP CONTRIBUTES EXACTLY ONE MEMBER (§3.5). The caller marks
 *    the chosen member — or, for a template, the default. Two chosen or none
 *    is a caller bug and throws; it is not a state the product has.
 *  - BACKWARD FLOW IS THE SAME WALK IN A MIRROR (§3.3). Prep flows backward to
 *    the work anchor and wind-down backward to lights-out: the reversed list
 *    walks forward in mirrored minutes and the result is mapped back, so a
 *    pin inside a backward block behaves exactly like one inside a forward
 *    block. Bracket members share a real start in both directions.
 */

export type StackItem = {
  id: string;
  durationMin: number;
  /** Transition before this item; 0 when it follows directly. */
  gapBeforeMin: number;
  /** Minutes from the day's start when the item is a pin; null otherwise. */
  pinnedAtMin: number | null;
  scheduling: "hard" | "soft";
  /** Resolved, 1–7. Read by `fitToBudget`, carried here for the callers. */
  priority: number;
  /** Members share one position (v1 §5.5). */
  multitaskId?: string | null;
  /** Exactly one member per group is chosen; the rest are not on the walk. */
  alternatesId?: string | null;
  alternatesChosen?: boolean;
};

export type StackInput = {
  /** In `sort_order`. */
  items: ReadonlyArray<StackItem>;
  flow: "forward" | "backward";
  /** Forward: where the block starts. Backward: where it must end. */
  anchorMin: number;
  /**
   * Forward: the next hard thing after the block (slack and overrun are
   * measured against it). Backward: the earliest allowed start. Null when
   * nothing bounds the block.
   */
  bound?: number | null;
};

export type PlacedItem = {
  id: string;
  startMin: number;
  endMin: number;
  pinned: boolean;
};

export type StackResult = {
  /** Every item on the walk, in walk order. Unchosen one-of members are absent. */
  placed: PlacedItem[];
  /** Counted durations plus gaps — what the block asks of the day. */
  totalMin: number;
  /** The block's span, pins included. */
  startMin: number;
  endMin: number;
  /** Distance from the block's far edge to `bound`; 0 when unbounded or over. */
  slackMin: number;
  /** How far the block passes `bound`; 0 when it fits. Never both non-zero. */
  overrunMin: number;
  /** Pins the preceding stack runs past. They did not move. */
  overrunPinIds: string[];
};

/** A gap below zero is a validator's failure; here it is simply no gap. */
function gapOf(item: StackItem): number {
  return Math.max(0, item.gapBeforeMin);
}

/**
 * The items actually on the walk: every ordinary item, and exactly one
 * member of each one-of group. Throws on a malformed group — a caller bug,
 * not a state.
 */
function walkItems(items: ReadonlyArray<StackItem>): StackItem[] {
  const chosenPerGroup = new Map<string, number>();
  for (const item of items) {
    if (!item.alternatesId) continue;
    const count = chosenPerGroup.get(item.alternatesId) ?? 0;
    chosenPerGroup.set(
      item.alternatesId,
      count + (item.alternatesChosen === true ? 1 : 0),
    );
  }
  for (const [group, count] of chosenPerGroup) {
    if (count !== 1) {
      throw new AppError(
        "stack_alternates_invalid",
        `one-of group ${group} has ${count} chosen members; exactly one is required`,
      );
    }
  }
  return items.filter(
    (item) => !item.alternatesId || item.alternatesChosen === true,
  );
}

/**
 * The walk itself, in whichever coordinates the caller hands it.
 *
 * `align` is what makes one walk serve both directions: bracket members
 * share a *start* in forward coordinates and an *end* in mirrored ones, so
 * that after the mirror is undone they share a real start either way.
 */
function walk(
  items: ReadonlyArray<StackItem>,
  originMin: number,
  align: "start" | "end",
): { placed: PlacedItem[]; totalMin: number; overrunPinIds: string[] } {
  const placed: PlacedItem[] = [];
  const overrunPinIds: string[] = [];
  let cursor = originMin;
  /** The end of the last placed item — not the anchor. Pins compare to this. */
  let lastEnd: number | null = null;
  let totalMin = 0;

  let index = 0;
  while (index < items.length) {
    const first = items[index];
    if (!first) break;

    // Gather a bracket: consecutive items sharing a multitask id.
    const members: StackItem[] = [first];
    if (first.multitaskId) {
      let next = index + 1;
      while (next < items.length && items[next]?.multitaskId === first.multitaskId) {
        const member = items[next];
        if (member) members.push(member);
        next += 1;
      }
    }

    const longest = Math.max(...members.map((member) => member.durationMin));
    const pin = members.find((member) => member.pinnedAtMin !== null) ?? null;

    let groupStart: number;
    if (pin !== null && pin.pinnedAtMin !== null) {
      groupStart = pin.pinnedAtMin;
      if (lastEnd !== null && lastEnd > groupStart) {
        overrunPinIds.push(pin.id);
      }
    } else {
      groupStart = cursor + gapOf(first);
      totalMin += gapOf(first);
    }
    const groupEnd = groupStart + longest;
    totalMin += longest;

    for (const member of members) {
      const startMin =
        align === "start" ? groupStart : groupEnd - member.durationMin;
      placed.push({
        id: member.id,
        startMin,
        endMin: startMin + member.durationMin,
        pinned: member.pinnedAtMin !== null,
      });
    }

    // After a pin the stack resumes at the later of the pin's end and the
    // overrunning item's end, so at most one overlap — the overrun itself —
    // is ever drawn.
    cursor = Math.max(cursor, groupEnd);
    lastEnd = lastEnd === null ? groupEnd : Math.max(lastEnd, groupEnd);
    index += members.length;
  }

  return { placed, totalMin, overrunPinIds };
}

export function stackBlock(input: StackInput): StackResult {
  const items = walkItems(input.items);
  const bound = input.bound ?? null;

  let placed: PlacedItem[];
  let totalMin: number;
  let overrunPinIds: string[];

  if (input.flow === "forward") {
    ({ placed, totalMin, overrunPinIds } = walk(items, input.anchorMin, "start"));
  } else {
    /*
     * The mirror: m = anchor − t. The reversed list walks forward from 0 in
     * mirrored minutes; a pin at real [p, p + d] is mirrored [anchor − p − d,
     * anchor − p]; the gap between real items i−1 and i is item i's, which in
     * the reversed list is the gap AFTER i — so each reversed item borrows its
     * successor's gap.
     */
    const reversed = [...items].reverse();
    const mirrored: StackItem[] = reversed.map((item, position) => {
      const following = reversed[position - 1];
      return {
        ...item,
        gapBeforeMin: following ? gapOf(following) : 0,
        pinnedAtMin:
          item.pinnedAtMin === null
            ? null
            : input.anchorMin - (item.pinnedAtMin + item.durationMin),
      };
    });
    const result = walk(mirrored, 0, "end");
    placed = result.placed
      .map((entry) => ({
        id: entry.id,
        startMin: input.anchorMin - entry.endMin,
        endMin: input.anchorMin - entry.startMin,
        pinned: entry.pinned,
      }))
      .reverse();
    totalMin = result.totalMin;
    overrunPinIds = result.overrunPinIds;
  }

  const startMin =
    placed.length === 0
      ? input.anchorMin
      : Math.min(...placed.map((entry) => entry.startMin));
  const endMin =
    placed.length === 0
      ? input.anchorMin
      : Math.max(...placed.map((entry) => entry.endMin));

  let slackMin = 0;
  let overrunMin = 0;
  if (bound !== null) {
    if (input.flow === "forward") {
      slackMin = Math.max(0, bound - endMin);
      overrunMin = Math.max(0, endMin - bound);
    } else {
      slackMin = Math.max(0, startMin - bound);
      overrunMin = Math.max(0, bound - startMin);
    }
  }

  return { placed, totalMin, startMin, endMin, slackMin, overrunMin, overrunPinIds };
}
