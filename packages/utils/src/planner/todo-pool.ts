/**
 * The to-dos with no day, read from their slots (USE-9; D-USE-74).
 *
 * A to-do slot joins a to-do to a block for a date. Not done by the block's
 * end, it reads as returned: the to-do is back in the pool with no job run
 * and nothing written. A slot is live while undone and its block has not
 * ended; a to-do in a live slot is not in the pool. A done slot's to-do is
 * done itself, so it drops out by its own `doneAt`.
 *
 * The pool is oldest first (`createdAt`, then id); a returned to-do names the
 * date it came back from, for "From Sunday" (D-USE-26).
 */

type Stamp = Date | string;

export interface TodoPoolTodo {
  id: string;
  /** `YYYY-MM-DD`; a dated to-do is not in the pool. */
  onDate: string | null;
  doneAt: Stamp | null;
  archivedAt: Stamp | null;
  createdAt: Stamp;
}

export interface TodoPoolSlot {
  /** Null on a work or set-item slot. */
  todoId: string | null;
  /** `YYYY-MM-DD`, the date the slot is for. */
  onDate: string;
  doneAt: Stamp | null;
  /** The block occurrence's end, from `readDay`. */
  blockEnd: Date;
}

export interface TodoPoolEntry {
  todoId: string;
  /** The date of the latest slot it returned from; null when never slotted. */
  returnedFrom: string | null;
}

const ms = (value: Stamp): number => {
  const n = new Date(value).getTime();
  return Number.isFinite(n) ? n : Infinity;
};

/** An undone to-do slot reads as returned once `now` reaches its block's end. */
export function isReturned(
  slot: { todoId: string | null; doneAt: Stamp | null },
  blockEnd: Date,
  now: Date,
): boolean {
  return (
    slot.todoId !== null &&
    slot.doneAt === null &&
    now.getTime() >= blockEnd.getTime()
  );
}

export function todoPool(input: {
  todos: readonly TodoPoolTodo[];
  slots: readonly TodoPoolSlot[];
  now: Date;
}): TodoPoolEntry[] {
  const live = new Set<string>();
  const returnedFrom = new Map<string, string>();
  for (const slot of input.slots) {
    if (slot.todoId === null || slot.doneAt !== null) continue;
    if (isReturned(slot, slot.blockEnd, input.now)) {
      const seen = returnedFrom.get(slot.todoId);
      if (seen === undefined || slot.onDate > seen)
        returnedFrom.set(slot.todoId, slot.onDate);
    } else {
      live.add(slot.todoId);
    }
  }

  return input.todos
    .filter(
      (todo) =>
        todo.onDate === null &&
        todo.doneAt === null &&
        todo.archivedAt === null &&
        !live.has(todo.id),
    )
    .sort(
      (a, b) =>
        ms(a.createdAt) - ms(b.createdAt) ||
        (a.id < b.id ? -1 : a.id > b.id ? 1 : 0),
    )
    .map((todo) => ({
      todoId: todo.id,
      returnedFrom: returnedFrom.get(todo.id) ?? null,
    }));
}
