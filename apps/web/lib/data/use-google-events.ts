"use client";

import { useQuery } from "@tanstack/react-query";
import type { GoogleDayEvent } from "./google-bands";
import { useDataSource } from "./source";

/**
 * A dated day's Google events (USE-109), from the calendars that are on
 * (D-USE-82). The usual week reads none. Live, `google.events` syncs the
 * week first when its snapshot is two minutes old (USE-103), so the cadence
 * is this query's: on focus after two minutes, every five while visible, as
 * Linear's. Read-only.
 */

const STALE_MS = 2 * 60_000;
const VISIBLE_EVERY_MS = 5 * 60_000;

export function googleEventsQueryKey(scenario: string, date?: string) {
  return date === undefined
    ? (["google-events", scenario] as const)
    : (["google-events", scenario, date] as const);
}

export function useGoogleEvents(date: string | null) {
  const source = useDataSource();
  const query = useQuery<GoogleDayEvent[]>({
    queryKey: googleEventsQueryKey(source.scenario.name, date ?? ""),
    queryFn: () => source.server.readGoogleEvents(date!),
    enabled: date !== null,
    staleTime: STALE_MS,
    refetchOnWindowFocus: true,
    refetchInterval: VISIBLE_EVERY_MS,
    refetchIntervalInBackground: false,
  });
  return date === null ? [] : (query.data ?? []);
}
