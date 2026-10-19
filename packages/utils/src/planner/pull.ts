/**
 * The pull: a From to-dos block filled at go (USE-9; D-USE-74).
 *
 * Blocks fill in start order. Each walks the pool as given (oldest first,
 * any type; reminders due and chores due never reorder it) and takes a to-do
 * only when its length fits the minutes left, walking on past one that does
 * not. The slots already in a block count against its minutes. A to-do with a
 * reminder time stays out, one already slotted is never taken, and none is
 * taken twice. A to-do with no length counts as 15 minutes.
 *
 * Only what this returns is written, at go.
 */

export const PULL_DEFAULT_LENGTH_MIN = 15;

export interface PullSlot {
  todoId: string | null;
  lengthMin: number | null;
  sortOrder: number;
}

export interface PullBlock {
  id: string;
  fill: string;
  start: Date;
  end: Date;
  slots: readonly PullSlot[];
}

export interface PullTodo {
  todoId: string;
  lengthMin: number | null;
  /** `HH:MM`; a to-do with a reminder time is never pulled. */
  remindAt: string | null;
}

export interface PulledSlot {
  blockId: string;
  todoId: string;
  sortOrder: number;
}

const lengthOf = (lengthMin: number | null): number =>
  lengthMin ?? PULL_DEFAULT_LENGTH_MIN;

export function pullTodos(input: {
  blocks: readonly PullBlock[];
  pool: readonly PullTodo[];
}): PulledSlot[] {
  const taken = new Set<string>();
  for (const block of input.blocks)
    for (const slot of block.slots)
      if (slot.todoId !== null) taken.add(slot.todoId);

  const blocks = input.blocks
    .filter((block) => block.fill === "from_todos")
    .sort(
      (a, b) =>
        a.start.getTime() - b.start.getTime() ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    );

  const pulled: PulledSlot[] = [];
  for (const block of blocks) {
    const minutes = (block.end.getTime() - block.start.getTime()) / 60_000;
    let left =
      minutes -
      block.slots.reduce((sum, slot) => sum + lengthOf(slot.lengthMin), 0);
    let sortOrder = block.slots.reduce(
      (max, slot) => Math.max(max, slot.sortOrder),
      -1,
    );

    for (const todo of input.pool) {
      if (left <= 0) break;
      if (todo.remindAt !== null || taken.has(todo.todoId)) continue;
      const length = lengthOf(todo.lengthMin);
      if (length > left) continue;
      taken.add(todo.todoId);
      left -= length;
      sortOrder += 1;
      pulled.push({ blockId: block.id, todoId: todo.todoId, sortOrder });
    }
  }
  return pulled;
}
