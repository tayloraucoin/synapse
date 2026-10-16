"use client";

import { useQuery } from "@tanstack/react-query";
import type { GoogleDayEvent } from "./google-bands";
import { useDataSource } from "./source";

/**
 * A dated day's Google events on fixtures (USE-109), from the calendars that
 * are on (D-USE-82). The usual week reads none. USE-103 swaps the read for
 * the Google router; it stays read-only.
 */

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
  });
  return date === null ? [] : (query.data ?? []);
}
