"use client";

import {
  useQuery,
  useQueryClient,
  type QueryClient,
} from "@tanstack/react-query";
import { deriveToday, type Today } from "./derive-today";
import { useDataSource, type DataSource } from "./source";
import type { TodayRecords } from "./today-records";

/**
 * A date's day (USE-7): the records, the blocks that run, and the clock. The
 * query holds records only; `select` derives the rest on every read. Wave 3
 * swaps `queryFn` for the tRPC read and nothing a surface sees changes.
 */

/** Every key a day's data sits under, so a write can invalidate them. */
export function todayQueryKey(scenario: string, dateKey?: string) {
  return dateKey === undefined
    ? (["today", scenario] as const)
    : (["today", scenario, dateKey] as const);
}

/**
 * The day's Try again (USE-34): the day alone is read again, so a region
 * that loaded (the to-dos) is never refetched by the day's failure.
 */
export function retryToday(
  queryClient: QueryClient,
  source: Pick<DataSource, "scenario" | "server">,
  dateKey: string,
) {
  source.server.recover();
  return queryClient.refetchQueries({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
  });
}

export function useToday(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = todayQueryKey(source.scenario.name, dateKey);
  const query = useQuery<TodayRecords, Error, Today>({
    queryKey,
    queryFn: () => source.server.readToday(dateKey),
    select: deriveToday,
    // The error state stays up until the person retries.
    retry: false,
  });
  return {
    ...query,
    today: query.data,
    retry: () => retryToday(queryClient, source, dateKey),
  };
}
