"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { JournalEntryRecord, JournalSaveInput } from "@syn/validators";
import type { JournalRecords } from "./journal-records";
import { journalWritten } from "./journal-row";
import { useDataSource } from "./source";

/**
 * Close the day's data (USE-44): the date's entry, prompts and quote as one
 * query, and the save of one answer. Wave 3 swaps the server calls for the
 * journal router's `get` and `save` and nothing the screen sees changes.
 *
 * ONE KEY PER SAVE. `save(key, value)` sends that one answer; the server
 * merges it into the date's entry, so a write never overwrites another
 * field's answer. The cache takes the same one key.
 */

export function journalQueryKey(scenario: string, dateKey: string) {
  return ["journal", scenario, dateKey] as const;
}

export function useJournal(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = journalQueryKey(source.scenario.name, dateKey);
  const query = useQuery<JournalRecords>({
    queryKey,
    queryFn: () => source.server.readJournal(dateKey),
    retry: false,
  });
  const mutation = useMutation<
    JournalEntryRecord,
    Error,
    Omit<JournalSaveInput, "date">
  >({
    mutationFn: ({ key, value }) =>
      source.server.writeJournalAnswer({ date: dateKey, key, value }),
    onSuccess: (_entry, { key, value }) =>
      queryClient.setQueryData<JournalRecords>(queryKey, (current) =>
        current === undefined
          ? current
          : {
              ...current,
              entry: {
                onDate: dateKey,
                answers: { ...current.entry?.answers, [key]: value },
              },
            },
      ),
  });
  function save(key: string, value: string): Promise<JournalEntryRecord> {
    return mutation.mutateAsync({ key, value });
  }
  return { query, save };
}

/**
 * Whether the date's journal holds any answer (USE-110): the Journal row's
 * tick on Now and in Block view. The same query as Close the day's, so a
 * save there ticks the row here; false while it reads or fails.
 */
export function useJournalWritten(dateKey: string): boolean {
  const source = useDataSource();
  const query = useQuery<JournalRecords, Error, boolean>({
    queryKey: journalQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readJournal(dateKey),
    select: (records) => journalWritten(records.entry),
    retry: false,
  });
  return query.data ?? false;
}
