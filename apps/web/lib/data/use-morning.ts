"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DayRecordRecord,
  MorningLinesInput,
  MorningLinesRecord,
} from "@syn/validators";
import type { MorningDayRecords, ReadingRecords } from "./morning-records";
import { FixtureOfflineError } from "./refusals";
import { useDataSource } from "./source";
import { todayQueryKey } from "./use-today";

/**
 * The morning's data (USE-12): the reading, the lines and last night as two
 * queries, so only the reading waits or fails on its own (D-USE-63); the
 * orient stamp; and the lines' write. Wave 3 swaps the server calls for the
 * tRPC reads of the old tables and nothing Orient sees changes.
 */

export function readingQueryKey(scenario: string, dateKey: string) {
  return ["morning", scenario, dateKey, "reading"] as const;
}

export function morningDayQueryKey(scenario: string, dateKey: string) {
  return ["morning", scenario, dateKey, "day"] as const;
}

/** The person's day key at the open, fixed for the life of the screen. */
export function useTodayKey(): string {
  const source = useDataSource();
  const [dateKey] = useState(() => source.todayKey());
  return dateKey;
}

export function useMorning(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const reading = useQuery<ReadingRecords>({
    queryKey: readingQueryKey(scenario, dateKey),
    queryFn: () => source.server.readReading(dateKey),
    // The region's error stays until Try again.
    retry: false,
  });
  const day = useQuery<MorningDayRecords>({
    queryKey: morningDayQueryKey(scenario, dateKey),
    queryFn: () => source.server.readMorningDay(dateKey),
    retry: false,
  });
  function retryReading() {
    source.server.recoverReading();
    return queryClient.refetchQueries({
      queryKey: readingQueryKey(scenario, dateKey),
    });
  }
  return { reading, day, retryReading };
}

/**
 * The open is the wake. `stamp` writes `orientedAt` at the server's now; the
 * server keeps the first, so a second open never moves it.
 */
export function useStampOrient() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  return useMutation<DayRecordRecord, Error, string>({
    mutationFn: (dateKey) =>
      source.server.stampOrient(dateKey, source.now().toISOString()),
    onSettled: (_record, _error, dateKey) =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name, dateKey),
      }),
  });
}

/** A write that failed for want of a connection: it waits, it is not lost. */
export function isWaitingToSave(error: unknown): boolean {
  return error instanceof FixtureOfflineError;
}

export function useWriteMorningLines() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  return useMutation<MorningLinesRecord, Error, MorningLinesInput>({
    mutationFn: (patch) => source.server.writeMorningLines(patch),
    onSuccess: (record) =>
      queryClient.setQueryData<MorningDayRecords>(
        morningDayQueryKey(source.scenario.name, record.onDate),
        (current) =>
          current === undefined ? current : { ...current, lines: record },
      ),
  });
}
