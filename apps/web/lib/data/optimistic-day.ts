import type { QueryClient, QueryKey } from "@tanstack/react-query";
import type {
  BlockItemRecord,
  SetUpDayRead,
  SlotRecord,
  TodoRecord,
} from "@syn/validators";
import type { TodayRecords } from "./today-records";
import type { PlannerCall } from "./use-planner-writes";
import type { WeekRecords } from "./week-records";

/**
 * A write as a date reads once it lands: the day-level half of the
 * optimistic rule USE-148 began for the week. Mutations are optimistic:
 * `onMutate` applies the change to every cached read it shows in, an error
 * rolls it back (and the screen says so quietly), and the server's answer
 * settles the cache. Today's read and a dated week's day hold the same rows
 * under two names, so each change is written once over `DayRows`.
 *
 * Two kinds of write. A tick (a box checked or unchecked, the time taken)
 * is a slot's own change; its rollback undoes only its own fields, so a
 * second tick still in flight keeps its change. A checklist's item writes
 * (add, edit, remove, reorder) are planner calls; theirs is the snapshot.
 */

/** The cached reads a query key names, as they were before a change. */
export type CacheSnapshot = [QueryKey, unknown][];

/**
 * Cancel the reads under `queryKey`, then write `change` into each one that
 * is loaded. Null leaves a read as it is. Hands back what was there.
 */
export async function applyToCache<T>(
  queryClient: QueryClient,
  queryKey: QueryKey,
  change: (data: T) => T | null,
): Promise<CacheSnapshot> {
  await queryClient.cancelQueries({ queryKey });
  const before = queryClient.getQueriesData<T>({ queryKey });
  for (const [key, data] of before) {
    if (data === undefined) continue;
    const next = change(data);
    if (next !== null) queryClient.setQueryData(key, next);
  }
  return before;
}

/** Every read put back as the snapshot saw it. */
export function restoreCache(
  queryClient: QueryClient,
  snapshot: CacheSnapshot | undefined,
): void {
  for (const [key, data] of snapshot ?? []) {
    if (data !== undefined) queryClient.setQueryData(key, data);
  }
}

const pendingIds = new Set<string>();

/** A stand-in id for a row the server has not made yet. */
export function pendingId(): string {
  const id = globalThis.crypto.randomUUID();
  pendingIds.add(id);
  return id;
}

/** Whether an id is a stand-in, so no write may name it. */
export function isPendingId(id: string | null): boolean {
  return id !== null && pendingIds.has(id);
}

/** One date's rows, as today's read and a week's day both carry them. */
export interface DayRows {
  date: string;
  items: BlockItemRecord[];
  slots: SlotRecord[];
  todos: TodoRecord[];
}

/** A change to one date's rows, written into today's read. */
export function onToday(
  records: TodayRecords,
  change: (rows: DayRows) => DayRows | null,
): TodayRecords | null {
  const next = change({
    date: records.date,
    items: records.blockItems,
    slots: records.slots,
    todos: records.todos,
  });
  return next === null
    ? null
    : {
        ...records,
        blockItems: next.items,
        slots: next.slots,
        todos: next.todos,
      };
}

/** The same change, written into each dated day of a cached week. */
export function onWeek(
  week: WeekRecords,
  change: (rows: DayRows) => DayRows | null,
): WeekRecords | null {
  let changed = false;
  const days = week.days.map((day): SetUpDayRead => {
    if (day.date === null) return day;
    const next = change({
      date: day.date,
      items: day.items,
      slots: day.slots,
      todos: day.todos,
    });
    if (next === null) return day;
    changed = true;
    return { ...day, items: next.items, slots: next.slots, todos: next.todos };
  });
  return changed ? { ...week, days } : null;
}

/*
 * ---- Ticks ----
 */

/** A slot's own change: the box, and the time taken beside it. */
export interface TickChange {
  doneAt?: string | null;
  tookMin?: number | null;
}

/**
 * A tick on a date. `slotId` is the row's slot, or a stand-in when the set
 * item has none yet (it is placed on first touch).
 */
export interface Tick {
  dateKey: string;
  blockId: string;
  slotId: string;
  blockItemId: string | null;
  todoId: string | null;
  sortOrder: number;
  change: TickChange;
}

/** What a tick replaced, so its rollback puts back only that. */
export interface TickPrior {
  /** The slot's own fields before, or null when the tick made the slot. */
  slot: TickChange | null;
  /** The to-do's done before, when the tick reached a to-do. */
  todoDoneAt?: string | null;
}

function changed<T extends object>(row: T, change: Partial<T>): T {
  const next = { ...row };
  for (const [key, value] of Object.entries(change)) {
    if (value !== undefined) (next as Record<string, unknown>)[key] = value;
  }
  return next;
}

function standInSlot(tick: Tick): SlotRecord {
  const at = tick.change.doneAt ?? new Date(0).toISOString();
  return {
    id: tick.slotId,
    createdAt: at,
    updatedAt: at,
    blockId: tick.blockId,
    onDate: tick.dateKey,
    skipped: false,
    sortOrder: tick.sortOrder,
    blockItemId: tick.blockItemId,
    todoId: tick.todoId,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: tick.change.tookMin ?? null,
    doneAt: tick.change.doneAt ?? null,
    notes: null,
    atTime: null,
    icon: null,
  };
}

/** The fields a tick names, as a slot holds them now. */
function fieldsOf(slot: SlotRecord, change: TickChange): TickChange {
  return {
    ...(change.doneAt === undefined ? {} : { doneAt: slot.doneAt }),
    ...(change.tookMin === undefined ? {} : { tookMin: slot.tookMin }),
  };
}

/** What a tick will replace on these rows; null when its date is not here. */
export function priorOfTick(tick: Tick, rows: DayRows): TickPrior | null {
  if (rows.date !== tick.dateKey) return null;
  const slot = rows.slots.find((row) => row.id === tick.slotId);
  const todo =
    tick.todoId === null || tick.change.doneAt === undefined
      ? undefined
      : rows.todos.find((row) => row.id === tick.todoId);
  return {
    slot: slot ? fieldsOf(slot, tick.change) : null,
    ...(todo ? { todoDoneAt: todo.doneAt } : {}),
  };
}

/** The tick as the date reads once it lands. */
export function applyTick(tick: Tick, rows: DayRows): DayRows | null {
  if (rows.date !== tick.dateKey) return null;
  const has = rows.slots.some((slot) => slot.id === tick.slotId);
  if (!has && tick.blockItemId === null) return null;
  const slots = has
    ? rows.slots.map((slot) =>
        slot.id === tick.slotId ? changed(slot, tick.change) : slot,
      )
    : [...rows.slots, standInSlot(tick)];
  const { doneAt } = tick.change;
  const todos =
    tick.todoId === null || doneAt === undefined
      ? rows.todos
      : rows.todos.map((todo) =>
          todo.id === tick.todoId ? { ...todo, doneAt } : todo,
        );
  return { ...rows, slots, todos };
}

/**
 * The tick taken back: its own fields as they were, a slot it made gone.
 * Anything else written since (another tick) stays.
 */
export function revertTick(
  tick: Tick,
  prior: TickPrior,
  rows: DayRows,
): DayRows | null {
  if (rows.date !== tick.dateKey) return null;
  const slots =
    prior.slot === null
      ? rows.slots.filter((slot) => slot.id !== tick.slotId)
      : rows.slots.map((slot) =>
          slot.id === tick.slotId ? { ...slot, ...prior.slot } : slot,
        );
  const todos =
    prior.todoDoneAt === undefined
      ? rows.todos
      : rows.todos.map((todo) =>
          todo.id === tick.todoId
            ? { ...todo, doneAt: prior.todoDoneAt ?? null }
            : todo,
        );
  return { ...rows, slots, todos };
}

/**
 * A block's rows in a new order on their date (Now's drop or Move): a row
 * with a slot takes its place on the slot, a set item with none on the
 * item, as the day reads `slot ?? item`.
 */
export function applyRowOrder(
  rows: DayRows,
  order: readonly { slotId: string | null; blockItemId: string | null }[],
): DayRows {
  const bySlot = new Map<string, number>();
  const byItem = new Map<string, number>();
  order.forEach((row, index) => {
    if (row.slotId !== null) bySlot.set(row.slotId, index);
    else if (row.blockItemId !== null) byItem.set(row.blockItemId, index);
  });
  return {
    ...rows,
    slots: rows.slots.map((slot) => {
      const at = bySlot.get(slot.id);
      return at === undefined ? slot : { ...slot, sortOrder: at };
    }),
    items: rows.items.map((item) => {
      const at = byItem.get(item.id);
      return at === undefined ? item : { ...item, sortOrder: at };
    }),
  };
}

/*
 * ---- A checklist's item writes ----
 */

function stamps(now: Date) {
  const at = now.toISOString();
  return { id: pendingId(), createdAt: at, updatedAt: at };
}

/** Whether a dated call is this date's; an undated one is every date's. */
function onDate(date: string | undefined | null, rows: DayRows): boolean {
  return date == null || date === rows.date;
}

/**
 * A planner item write as a date reads it once it lands: added, edited,
 * removed (a usual item left out of the date), reordered (the date's slot
 * order where a slot is placed, else the item's). Null for any other call,
 * or a date it does not reach.
 */
export function applyItemWrite(
  call: PlannerCall,
  rows: DayRows,
  now: Date,
): DayRows | null {
  switch (call.method) {
    case "writeBlockItem": {
      const [input] = call.args;
      if (!onDate(input.onDate, rows)) return null;
      const item: BlockItemRecord = {
        ...stamps(now),
        blockId: input.blockId,
        title: input.title,
        icon: input.icon ?? null,
        isTransition: input.isTransition ?? false,
        atTime: input.atTime ?? null,
        lengthMin: input.lengthMin ?? null,
        meal: input.meal ?? false,
        onDate: input.onDate ?? null,
        sortOrder: input.sortOrder,
      };
      return { ...rows, items: [...rows.items, item] };
    }

    case "editBlockItem": {
      const [{ id, ...patch }] = call.args;
      if (!rows.items.some((item) => item.id === id)) return null;
      return {
        ...rows,
        items: rows.items.map((item) =>
          item.id === id
            ? changed(item, patch as Partial<BlockItemRecord>)
            : item,
        ),
      };
    }

    case "removeBlockItem": {
      const [input] = call.args;
      if (!onDate(input.date, rows)) return null;
      if (!rows.items.some((item) => item.id === input.id)) return null;
      return {
        ...rows,
        items: rows.items.filter((item) => item.id !== input.id),
      };
    }

    case "reorderItems": {
      const [input] = call.args;
      if (!onDate(input.date, rows)) return null;
      const order = new Map(input.ids.map((id, index) => [id, index]));
      // A dated order is the slots' where placed; the usual one the items'.
      const slotted = new Set<string>();
      const slots =
        input.date === undefined
          ? rows.slots
          : rows.slots.map((slot) => {
              const at =
                slot.blockItemId === null
                  ? undefined
                  : order.get(slot.blockItemId);
              if (at === undefined || slot.blockId !== input.blockId) {
                return slot;
              }
              slotted.add(slot.blockItemId!);
              return { ...slot, sortOrder: at };
            });
      const items = rows.items.map((item) => {
        const at = order.get(item.id);
        return at === undefined || slotted.has(item.id)
          ? item
          : { ...item, sortOrder: at };
      });
      return { ...rows, items, slots };
    }

    default:
      return null;
  }
}
