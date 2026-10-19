"use client";

import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addDays,
  clockFromMinutes,
  instantToWallClockMinutes,
  weekDates,
  weekKeyOf,
} from "@syn/utils";
import { deriveToday, type Today } from "./derive-today";
import {
  dayTarget,
  deriveMoveTo,
  undoMove,
  writeMove,
  type MoveServer,
  type MoveTarget,
  type MoveWrite,
} from "./move-to";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import { linearQueryKey } from "./use-linear";
import { poolQueryKey } from "./use-pool";
import { todayQueryKey } from "./use-today";
import { weekQueryKey } from "./use-week";
import type { WeekRecords } from "./week-records";

/**
 * Move to's data (USE-69): the item on today's records, today's later
 * blocks, tomorrow's and a picked day's target, each read through
 * `readToday` for its date and derived by `deriveMoveTo` / `dayTarget`. The
 * move and its Undo go through `writeMove` / `undoMove`; the day, the week
 * and the pool read again after each.
 */

function useDay(dateKey: string | null) {
  const source = useDataSource();
  return useQuery<TodayRecords, Error, Today>({
    queryKey: todayQueryKey(source.scenario.name, dateKey ?? ""),
    queryFn: () => source.server.readToday(dateKey!),
    select: deriveToday,
    enabled: dateKey !== null,
    retry: false,
  });
}

/** The Mondays of every week the month touches. */
function weeksOf(month: string): string[] {
  const [year = 0, monthNumber = 1] = month.split("-").map(Number);
  const length = new Date(Date.UTC(year, monthNumber, 0)).getUTCDate();
  const keys = new Set<string>();
  for (let day = 1; day <= length; day += 1) {
    keys.add(weekKeyOf(`${month}-${String(day).padStart(2, "0")}`));
  }
  return [...keys];
}

/**
 * "Already set for that day" (D-USE-37): a date with its own Up at and
 * Lights out, its own block changes or its own slots [ASSUMPTION: what Set
 * my days and the day's own edits write; the usual alone is not "set"].
 */
function setDatesOf(records: WeekRecords): string[] {
  return records.days.flatMap((day) =>
    day.date !== null &&
    (day.bounds?.onDate === day.date ||
      day.changes.length > 0 ||
      day.slots.length > 0)
      ? [day.date]
      : [],
  );
}

export function useMoveTo(id: string | null, picked: string | null = null) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const todayKey = source.todayKey();
  const tomorrowKey = addDays(todayKey, 1);
  const today = useDay(id === null ? null : todayKey);
  const tomorrow = useDay(id === null ? null : tomorrowKey);
  const pickedDay = useDay(id === null ? null : picked);

  const timeZone = source.scenario.records.timeZone;
  const nowClock = clockFromMinutes(
    instantToWallClockMinutes(source.now(), timeZone),
  );
  const view =
    id === null || today.data === undefined
      ? null
      : deriveMoveTo({
          today: today.data,
          tomorrow: tomorrow.data ?? null,
          id,
          nowClock,
        });
  const pickedTarget: MoveTarget | null =
    view === null || picked === null || pickedDay.data === undefined
      ? null
      : dayTarget(pickedDay.data, view.subject, "picked");

  const server: MoveServer = source.server;

  function invalidate() {
    for (const queryKey of [
      todayQueryKey(scenario),
      weekQueryKey(scenario),
      poolQueryKey(scenario),
      linearQueryKey(scenario),
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }

  return {
    view,
    isPending: today.isPending,
    todayKey,
    tomorrowKey,
    picked: pickedTarget,
    /** One tap: the move, resolving to its Undo; null when nothing is there. */
    move: async (target: MoveTarget): Promise<MoveWrite | null> => {
      if (view === null) return null;
      try {
        return await writeMove(server, view.subject, target, todayKey);
      } finally {
        invalidate();
      }
    },
    undo: (write: MoveWrite) => undoMove(server, write).finally(invalidate),
  };
}

/** The month's days already set, dotted in Pick a day. */
export function useSetDates(month: string): string[] {
  const source = useDataSource();
  const weeks = weeksOf(month);
  const reads = useQueries({
    queries: weeks.map((week) => ({
      queryKey: weekQueryKey(source.scenario.name, week),
      queryFn: () => source.server.readWeek(week),
      retry: false,
    })),
  });
  const inMonth = new Set(weeks.flatMap(weekDates));
  return reads.flatMap((read) =>
    read.data === undefined
      ? []
      : setDatesOf(read.data).filter(
          (date) => inMonth.has(date) && date.startsWith(month),
        ),
  );
}
