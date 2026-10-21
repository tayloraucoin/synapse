"use client";

import { useSyncExternalStore } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { defaultWeek } from "@syn/utils";
import { useDataSource } from "./source";
import { deriveSetUpDay, type SetUpDay } from "./use-set-up-day";
import { thisWeekKey, type WeekRecords, type WeekRef } from "./week-records";

/**
 * The set-up area's week (USE-36): seven days of records over TanStack Query
 * on the fixture server, each day derived in `select`. Wave 3 swaps
 * `queryFn` for the planner router and nothing above changes.
 */

/** Every key a set-up read sits under, so a write can invalidate them. */
export function weekQueryKey(scenario: string, week?: WeekRef) {
  return week === undefined
    ? (["planner-week", scenario] as const)
    : (["planner-week", scenario, week] as const);
}

/** The one query under every set-up hook; `select` picks what each reads. */
export function useWeekQuery<T>(
  week: WeekRef,
  select: (records: WeekRecords) => T,
) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = weekQueryKey(source.scenario.name, week);
  const query = useQuery<WeekRecords, Error, T>({
    queryKey,
    queryFn: () => source.server.readWeek(week),
    select,
    // The error state stays up until the person retries.
    retry: false,
  });
  function retry() {
    source.server.recover();
    return queryClient.refetchQueries({ queryKey });
  }
  // The device cache restores in an effect (USE-106), so a screen under a
  // Suspense that hydrates after it would find the week the server never had.
  // Its hydrating render reads as the server's did; the next has the week.
  if (useHydrating()) {
    return {
      ...query,
      data: undefined,
      status: "pending",
      isPending: true,
      isSuccess: false,
      isError: false,
      error: null,
      retry,
    } as typeof query & { retry: typeof retry };
  }
  return { ...query, retry };
}

const subscribeToNothing = () => () => {};

/** True only while React hydrates server markup; false on the server too. */
function useHydrating(): boolean {
  const client = useSyncExternalStore(
    subscribeToNothing,
    () => true,
    () => false,
  );
  return typeof window !== "undefined" && !client;
}

export interface SetUpWeek {
  week: WeekRef;
  days: SetUpDay[];
}

export function deriveWeek(records: WeekRecords): SetUpWeek {
  return {
    week: records.week,
    days: records.days.map((day) => deriveSetUpDay(day, records.timeZone)),
  };
}

/** `"usual"`, or a dated week by its ISO key. */
export function useWeek(week: WeekRef) {
  const query = useWeekQuery(week, deriveWeek);
  return { ...query, week: query.data };
}

/** Which week Set my days opens on, and this week's key (C-USE-set-my-days-1). */
export function useOpeningWeek(): { opens: WeekRef; thisWeek: string } {
  const source = useDataSource();
  const now = source.now();
  const { timeZone } = source.scenario.records;
  const thisWeek = thisWeekKey(now, timeZone);
  return {
    opens: defaultWeek(now, timeZone) === "this" ? thisWeek : "usual",
    thisWeek,
  };
}
