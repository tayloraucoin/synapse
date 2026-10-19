/**
 * Now's two questions (USE-16, USE-17; day/now): which block is the active
 * one, and which of its items is current; and the block's two quiet facts,
 * what comes next and whether it has run past its end. Pure, so the screen never derives either in
 * a component: Now shows the active block only and lifts its current item.
 */

/** A block on the date, at its instants for that date. */
export interface NowBlockSpan {
  /** Matched against a block put in focus (USE-20). */
  id?: string;
  start: Date;
  end: Date;
  /**
   * A checklist with no span (D-USE-28): the day's fallback, under any
   * set-time block (D-USE-72). Unset is a set-time block.
   */
  allDay?: boolean;
  /**
   * It still holds an undone item. A set-time block that ran past its end
   * open stays active: the next block does not slide on its own (N4's
   * behind). Unset is not open.
   */
  open?: boolean;
}

/** An item in a block's order, done or not. */
export interface NowItem {
  id: string;
  done: boolean;
}

/**
 * A block put in focus early (USE-20): Start <next> on the all-done footer,
 * or End break. `blockId` null is End break with nothing after it: the
 * Break yields to no block.
 */
export interface NowFocus {
  blockId: string | null;
  at: Date;
}

/**
 * The active block at `now` (USE-16, USE-17). In order:
 *
 * 1. a set-time block whose end has passed while it is still open (behind);
 * 2. the set-time block under way;
 * 3. the all-day checklist, under way all day (D-USE-72: a set-time block
 *    lifts above it at its time and it returns after);
 * 4. the next set-time block today; else none.
 *
 * Blocks come in start order (`readDay`'s); of two that qualify the earlier
 * wins.
 *
 * A `focus` (USE-20) wins from its instant until its block's own end, over
 * a planned block that is all done, closed or the all-day checklist; a
 * set-time block with an undone item keeps the screen.
 */
export function activeBlock<B extends NowBlockSpan>(
  blocks: readonly B[],
  now: Date,
  focus: NowFocus | null = null,
): B | null {
  const planned = plannedBlock(blocks, now);
  if (focus === null || now.getTime() < focus.at.getTime()) return planned;
  // A set-time block still holding an undone item keeps the screen: an
  // unchecked row takes the block back (USE-20). All done, closed or the
  // all-day checklist, it yields to the focus.
  const holds =
    planned !== null &&
    planned.open === true &&
    planned.allDay !== true &&
    planned.id !== focus.blockId;
  if (holds) return planned;
  if (focus.blockId === null) {
    return planned?.allDay === true && planned.open === true ? planned : null;
  }
  const focused = blocks.find((block) => block.id === focus.blockId);
  // From the tap until its own end; its span does not move (D-USE-72).
  if (!focused || now.getTime() >= focused.end.getTime()) return planned;
  return focused;
}

/** The active block by the plan alone: `activeBlock`'s order, no focus. */
function plannedBlock<B extends NowBlockSpan>(
  blocks: readonly B[],
  now: Date,
): B | null {
  const at = now.getTime();
  const timed = blocks.filter((block) => block.allDay !== true);
  const held = timed.find(
    (block) => block.open === true && block.end.getTime() <= at,
  );
  if (held) return held;
  const underWay = timed.find(
    (block) => block.start.getTime() <= at && at < block.end.getTime(),
  );
  if (underWay) return underWay;
  const allDay = blocks.find(
    (block) =>
      block.allDay === true &&
      block.start.getTime() <= at &&
      at < block.end.getTime(),
  );
  if (allDay) return allDay;
  return timed.find((block) => block.start.getTime() > at) ?? null;
}

/**
 * The next set-time block to start after `now`: the checklist day's
 * "next: Lunch with Sam, 13:00". The all-day checklist is never next.
 */
export function nextBlock<B extends NowBlockSpan>(
  blocks: readonly B[],
  now: Date,
): B | null {
  const at = now.getTime();
  return (
    blocks.find(
      (block) => block.allDay !== true && block.start.getTime() > at,
    ) ?? null
  );
}

/**
 * When the active block went past its planned end: the end, once `now` has
 * passed it, else null. Read as "Planned to end at <time>", never as late.
 * An all-day checklist is never behind.
 */
export function behindSince(block: NowBlockSpan, now: Date): Date | null {
  if (block.allDay === true) return null;
  return now.getTime() > block.end.getTime() ? block.end : null;
}

/**
 * How a block stands at its end (USE-20): every item done (a block with
 * none is never done; an empty Break is End break's), whether that came
 * before its planned end, and the end while it is still ahead ("Free until
 * 8:00", the add row's). No counts: names and times only.
 */
export function blockEnding(
  block: NowBlockSpan,
  items: readonly NowItem[],
  now: Date,
): { allDone: boolean; ahead: boolean; freeUntil: Date | null } {
  const allDone = items.length > 0 && items.every((item) => item.done);
  const before = block.allDay !== true && now.getTime() < block.end.getTime();
  return {
    allDone,
    ahead: allDone && before,
    freeUntil: before ? block.end : null,
  };
}

/**
 * The first undone item in order, unless one was made current (a tapped
 * row; order is a plan, not a rule, note 60). A chosen item that is done or
 * gone falls back to the order.
 */
export function currentItem<T extends NowItem>(
  items: readonly T[],
  chosenId: string | null,
): T | null {
  if (chosenId !== null) {
    const chosen = items.find((item) => item.id === chosenId);
    if (chosen && !chosen.done) return chosen;
  }
  return items.find((item) => !item.done) ?? null;
}

/**
 * What lifts after the current item is done: the next undone item after it
 * in order, else the first undone one before it. Announced as "<next> is
 * next."
 */
export function nextItem<T extends NowItem>(
  items: readonly T[],
  current: T | null,
): T | null {
  if (current === null) return null;
  const index = items.findIndex((item) => item.id === current.id);
  const after = items.slice(index + 1).find((item) => !item.done);
  if (after) return after;
  return items.slice(0, Math.max(index, 0)).find((item) => !item.done) ?? null;
}
