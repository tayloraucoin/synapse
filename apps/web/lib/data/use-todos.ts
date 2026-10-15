"use client";

import * as React from "react";
import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import type { IconValue } from "@syn/types";
import { readDay, trayTodos } from "@syn/utils";
import {
  todoInput,
  type BlockChangeRecord,
  type BlockRecord,
  type SlotRecord,
  type TodoRecord,
} from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import { useDataSource } from "./source";
import { todayQueryKey } from "./use-today";

/**
 * The To-dos tray's data (USE-19): its own query, apart from the day's, so
 * its loading or failure never blanks the block and the block's never
 * blanks it. Which to-dos show, and in what order, is `trayTodos`
 * (`@syn/utils`); this file reads, writes and maps rows for the tray.
 */

/** What the to-dos' read returns, from the fixture server now and the routers in wave 3. */
export interface TodosRecords {
  date: string;
  timeZone: string;
  /** `[start, end)` of the date's day: a to-do checked since `start` stays. */
  dayWindow: { start: Date; end: Date };
  todos: TodoRecord[];
  /** The to-do slots on any date: an undone one returns at its block's end. */
  slots: SlotRecord[];
  blocks: BlockRecord[];
  blockChanges: BlockChangeRecord[];
}

/** One row of the tray, as it draws it. */
export interface TrayRowView {
  id: string;
  title: string;
  icon: IconValue | null;
  checked: boolean;
  /** "From Sunday", "From 3 Oct"; null when the to-do belongs to the date. */
  carriedLabel: string | null;
  /** `HH:MM` when it reminds on the date. */
  reminderAt: string | null;
}

/** Each to-do slot's block end, read as the day reads its date. */
function slotEnds(records: TodosRecords): Map<string, Date> {
  const ends = new Map<string, Date>();
  const dates = new Set(records.slots.map((slot) => slot.onDate));
  for (const dateKey of dates) {
    const read = readDay({
      dateKey,
      timeZone: records.timeZone,
      blocks: records.blocks,
      changes: records.blockChanges,
      slots: records.slots,
    });
    for (const occurrence of read.blocks) {
      for (const slot of occurrence.slots) ends.set(slot.id, occurrence.end);
    }
  }
  return ends;
}

/** The tray's rows for a date at `now`: pure, so a test reads what the tray reads. */
export function deriveTray(records: TodosRecords, now: Date): TrayRowView[] {
  const ends = slotEnds(records);
  const rows = trayTodos({
    todos: records.todos,
    slots: records.slots.map((slot) => ({
      todoId: slot.todoId,
      onDate: slot.onDate,
      doneAt: slot.doneAt,
      // A slot no block holds on its date (the block skipped) is already back.
      blockEnd: ends.get(slot.id) ?? new Date(0),
    })),
    dateKey: records.date,
    now,
    dayStart: new Date(records.dayWindow.start),
  });
  return rows.map(({ todo, carriedLabel, reminderAt }) => ({
    id: todo.id,
    title: todo.title,
    icon: todo.icon,
    checked: todo.doneAt !== null,
    carriedLabel,
    reminderAt,
  }));
}

/** Every key the to-dos sit under, so a write or a retry touches only them. */
export function todosQueryKey(scenario: string, dateKey?: string) {
  return dateKey === undefined
    ? (["todos", scenario] as const)
    : (["todos", scenario, dateKey] as const);
}

/** The new to-do Add makes: no day, no reminder, no repeat, type Other (D-USE-69). */
export function newTodo(title: string) {
  return todoInput.parse({ title, type: "other" });
}

export function useTodos(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = todosQueryKey(source.scenario.name, dateKey);
  // A box whose write failed: the state it was asked for, for Try again.
  const [failed, setFailed] = React.useState<ReadonlyMap<string, boolean>>(
    () => new Map(),
  );

  const query = useQuery<TodosRecords, Error, TrayRowView[]>({
    queryKey,
    queryFn: () => source.server.readTodos(dateKey),
    select: (records) => deriveTray(records, source.now()),
    // The failure stays up until the person retries.
    retry: false,
  });

  function settle() {
    void queryClient.invalidateQueries({
      queryKey: todosQueryKey(source.scenario.name),
    });
    // Now's closed line reads the day's to-dos too.
    void queryClient.invalidateQueries({
      queryKey: todayQueryKey(source.scenario.name),
    });
  }

  const addMutation = useMutation<TodoRecord, Error, string>({
    mutationFn: (title) => source.server.writeTodo(newTodo(title)),
    onSettled: settle,
  });

  async function box(id: string, checked: boolean) {
    setFailed((map) => without(map, id));
    const saved = await writeBox({
      queryClient,
      server: source.server,
      queryKey,
      id,
      checked,
      at: source.now(),
    });
    if (saved) settle();
    // The box has reverted; the row says it did not save.
    else setFailed((map) => new Map(map).set(id, checked));
  }

  return {
    ...query,
    rows: query.data,
    /** Rows whose box did not save, for "Not saved. Try again." */
    failed,
    add: (title: string) => addMutation.mutateAsync(title),
    check: (id: string) => box(id, true),
    uncheck: (id: string) => box(id, false),
    /** A failed box's Try again: the same write once more. */
    retryWrite: async (id: string) => {
      const checked = failed.get(id);
      if (checked !== undefined) await box(id, checked);
    },
    /** The list's Try again: the to-dos alone are read again. */
    retry: () => {
      source.server.recoverTodos();
      return queryClient.refetchQueries({ queryKey });
    },
  };
}

/**
 * A box's write: the cache shows the change at once, the write follows, and
 * a failure puts the box back as it was. True when it saved.
 */
export async function writeBox(input: {
  queryClient: QueryClient;
  server: Pick<FixtureServer, "writeTodoDone">;
  queryKey: readonly unknown[];
  id: string;
  checked: boolean;
  at: Date;
}): Promise<boolean> {
  const { queryClient, server, queryKey, id, checked, at } = input;
  await queryClient.cancelQueries({ queryKey });
  const before = queryClient.getQueryData<TodosRecords>(queryKey);
  const doneAt = checked ? at.toISOString() : null;
  queryClient.setQueryData<TodosRecords>(queryKey, (records) =>
    records
      ? {
          ...records,
          todos: records.todos.map((todo) =>
            todo.id === id ? { ...todo, doneAt } : todo,
          ),
        }
      : records,
  );
  try {
    await server.writeTodoDone({ id, doneAt });
    return true;
  } catch {
    if (before) queryClient.setQueryData(queryKey, before);
    return false;
  }
}

function without<V>(map: ReadonlyMap<string, V>, id: string) {
  if (!map.has(id)) return map;
  const next = new Map(map);
  next.delete(id);
  return next;
}
