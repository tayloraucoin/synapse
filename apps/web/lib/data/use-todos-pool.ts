"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useDataSource } from "./source";
import { todosQueryKey, type TodosRecords } from "./use-todos";

/**
 * The to-dos' records as read, for the From To-dos picker (USE-50): the same
 * query the tray reads (one cache, one read), without the tray's select, so
 * the picker can take USE-9's `todoPool` over every to-do and to-do slot.
 * `settle` reads them again after a write to a to-do slot.
 */
export function useTodosRecords(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const query = useQuery<TodosRecords, Error>({
    queryKey: todosQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readTodos(dateKey),
    retry: false,
  });
  return {
    ...query,
    now: () => source.now(),
    settle: () =>
      void queryClient.invalidateQueries({
        queryKey: todosQueryKey(source.scenario.name),
      }),
  };
}
