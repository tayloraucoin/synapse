/**
 * Now's two questions (USE-16; day/now): which block is the active one, and
 * which of its items is current. Pure, so the screen never derives either in
 * a component: Now shows the active block only and lifts its current item.
 */

/** A block on the date, at its instants for that date. */
export interface NowBlockSpan {
  start: Date;
  end: Date;
}

/** An item in a block's order, done or not. */
export interface NowItem {
  id: string;
  done: boolean;
}

/**
 * The block under way at `now`, else the next one today, else none. Blocks
 * come in start order (`readDay`'s); of two under way the earlier wins.
 */
export function activeBlock<B extends NowBlockSpan>(
  blocks: readonly B[],
  now: Date,
): B | null {
  const at = now.getTime();
  const underWay = blocks.find(
    (block) => block.start.getTime() <= at && at < block.end.getTime(),
  );
  if (underWay) return underWay;
  return blocks.find((block) => block.start.getTime() > at) ?? null;
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
