/**
 * Now's two questions (USE-16, USE-17; day/now): which block is the active
 * one, and which of its items is current; and the block's two quiet facts,
 * what comes next and whether it has run past its end. Pure, so the screen never derives either in
 * a component: Now shows the active block only and lifts its current item.
 */

/** A block on the date, at its instants for that date. */
export interface NowBlockSpan {
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
 */
export function activeBlock<B extends NowBlockSpan>(
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
