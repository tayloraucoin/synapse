"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { groupPool, type Pool, type PoolRecords } from "./pool-records";
import { useDataSource } from "./source";

/**
 * The pool (USE-55): work neither done nor archived, grouped in client order,
 * over TanStack Query on the fixture server. Wave 3 swaps `queryFn` for the
 * work router and nothing above changes.
 */

export function poolQueryKey(scenario: string) {
  return ["work-pool", scenario] as const;
}

export function usePool() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const queryKey = poolQueryKey(source.scenario.name);
  const query = useQuery<PoolRecords, Error, Pool>({
    queryKey,
    queryFn: () => source.server.readPool(),
    select: groupPool,
    // The error state stays up until the person retries.
    retry: false,
  });
  function retry() {
    source.server.recover();
    return queryClient.refetchQueries({ queryKey });
  }
  return { ...query, pool: query.data, retry };
}
