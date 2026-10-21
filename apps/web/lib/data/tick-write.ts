import type { MutationOptions, QueryClient } from "@tanstack/react-query";
import type { SlotRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import {
  applyTick,
  applyToCache,
  isPendingId,
  onToday,
  onWeek,
  pendingId,
  priorOfTick,
  revertTick,
  type DayRows,
  type Tick,
  type TickChange,
  type TickPrior,
} from "./optimistic-day";
import type { DataSource } from "./source";
import type { TodayRecords } from "./today-records";
import { todayQueryKey } from "./use-today";
import { todosQueryKey } from "./use-todos";
import { weekQueryKey } from "./use-week";
import type { WeekRecords } from "./week-records";

/**
 * A row's box, on Now and in Block view (USE-21, USE-48): the slot's own
 * write, optimistic. The tick shows the moment it is made; the write goes
 * behind it. A set item's slot is placed on first touch, under the stand-in
 * id the cache already shows, so a second tick on the same row waits for
 * that placement instead of placing it twice.
 *
 * Ticks run one at a time, in the order made (their own scope), and the day
 * is read again once the last has landed, so a read never lands between two
 * ticks and drops the second. A failed tick takes back only its own change
 * and reads the day again at once: the box never shows a tick the server
 * does not have. The screen says "Not saved. Try again." under the row.
 */

/** A to-do's own done is only a row on Now's; Block view's are set items. */
export type TickServer = Pick<FixtureServer, "writeSlots"> &
  Partial<Pick<FixtureServer, "writeTodoDone">>;

/** The row a tick is made on, as Now and Block view both hold it. */
export interface TickRow {
  slotId: string | null;
  blockItemId: string | null;
  todoId: string | null;
  sortOrder: number;
}

/** The tick for a row; a row with no slot gets a stand-in. */
export function tickOf(
  place: { dateKey: string; blockId: string },
  row: TickRow,
  change: TickChange,
): Tick {
  return {
    ...place,
    slotId: row.slotId ?? pendingId(),
    blockItemId: row.blockItemId,
    todoId: row.todoId,
    sortOrder: row.sortOrder,
    change,
  };
}

/** A stand-in's placement, once asked for: the real slot's id. */
const placements = new Map<string, Promise<string>>();

function slotIdFor(server: TickServer, tick: Tick): Promise<string> {
  if (!isPendingId(tick.slotId)) return Promise.resolve(tick.slotId);
  const waiting = placements.get(tick.slotId);
  if (waiting) return waiting;
  if (tick.blockItemId === null) {
    return Promise.reject(
      new Error("A set item needs its block to be placed."),
    );
  }
  const placed = server
    .writeSlots({
      blockId: tick.blockId,
      onDate: tick.dateKey,
      sortOrder: tick.sortOrder,
      blockItemId: tick.blockItemId,
    })
    .then((slot) => slot.id);
  placements.set(tick.slotId, placed);
  // A failed placement may be asked for again.
  placed.catch(() => placements.delete(tick.slotId));
  return placed;
}

/** The real slot behind a stand-in, when a tick has asked for it. */
export function placementOf(id: string): Promise<string> | undefined {
  return placements.get(id);
}

/** The tick's writes: the slot, then a to-do's own done. */
export async function sendTick(
  server: TickServer,
  tick: Tick,
): Promise<SlotRecord> {
  const slot = await server.writeSlots({
    id: await slotIdFor(server, tick),
    ...tick.change,
  });
  if (tick.todoId !== null && tick.change.doneAt !== undefined) {
    if (!server.writeTodoDone)
      throw new Error("A to-do's done needs its write.");
    await server.writeTodoDone({ id: tick.todoId, doneAt: tick.change.doneAt });
  }
  return slot;
}

export function tickKey(scenario: string) {
  return ["ticks", scenario] as const;
}

/** What `onMutate` saw: the tick's prior on each read it changed. */
export interface TickContext {
  prior: TickPrior | null;
}

/** Pure options, so a test drives what the screen does. */
export function tickOptions(
  source: Pick<DataSource, "scenario" | "server">,
  queryClient: QueryClient,
): MutationOptions<SlotRecord, Error, Tick, TickContext> {
  const scenario = source.scenario.name;
  /** The tick's change, or its rollback, on today's read and the week's day. */
  async function write(
    tick: Tick,
    change: (rows: DayRows) => DayRows | null,
  ): Promise<void> {
    await applyToCache<TodayRecords>(
      queryClient,
      todayQueryKey(scenario, tick.dateKey),
      (records) => onToday(records, change),
    );
    await applyToCache<WeekRecords>(
      queryClient,
      weekQueryKey(scenario),
      (week) => onWeek(week, change),
    );
  }
  function priorIn(tick: Tick): TickPrior | null {
    const records = queryClient.getQueryData<TodayRecords>(
      todayQueryKey(scenario, tick.dateKey),
    );
    if (records) {
      return onTodayPrior(tick, records);
    }
    for (const [, week] of queryClient.getQueriesData<WeekRecords>({
      queryKey: weekQueryKey(scenario),
    })) {
      const day = week?.days.find((row) => row.date === tick.dateKey);
      if (day) {
        return priorOfTick(tick, {
          date: tick.dateKey,
          items: day.items,
          slots: day.slots,
          todos: day.todos,
        });
      }
    }
    return null;
  }
  return {
    mutationKey: tickKey(scenario),
    scope: { id: `ticks:${scenario}` },
    mutationFn: (tick) => sendTick(source.server, tick),
    onMutate: async (tick) => {
      const prior = priorIn(tick);
      await write(tick, (rows) => applyTick(tick, rows));
      return { prior };
    },
    onError: async (_error, tick, context) => {
      const prior = context?.prior;
      if (prior) await write(tick, (rows) => revertTick(tick, prior, rows));
    },
    onSettled: async (_slot, error, tick) => {
      // The last tick in flight, or a failed one, reads the day again.
      const others = queryClient.isMutating({ mutationKey: tickKey(scenario) });
      if (error === null && others > 1) return;
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: todayQueryKey(scenario) }),
        queryClient.invalidateQueries({ queryKey: weekQueryKey(scenario) }),
        // A to-do checked in its block leaves the tray (USE-21).
        tick.todoId === null
          ? null
          : queryClient.invalidateQueries({
              queryKey: todosQueryKey(scenario),
            }),
      ]);
    },
  };
}

function onTodayPrior(tick: Tick, records: TodayRecords): TickPrior | null {
  return priorOfTick(tick, {
    date: records.date,
    items: records.blockItems,
    slots: records.slots,
    todos: records.todos,
  });
}
