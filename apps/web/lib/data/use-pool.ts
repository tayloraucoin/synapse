"use client";

import * as React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { clientOf } from "./integration-records";
import { groupPool, type PoolRecords } from "./pool-records";
import { useDataSource } from "./source";
import { useConnectionsQuery } from "./use-connections";
import { useLinearIssues } from "./use-linear";

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
  const query = useQuery<PoolRecords, Error>({
    queryKey,
    queryFn: () => source.server.readPool(),
    // The error state stays up until the person retries.
    retry: false,
  });
  // Whose work through Connections' mappings (USE-86), once they have read.
  const connections = useConnectionsQuery().data;
  const linear = useLinearIssues().data;
  const records = query.data;
  const pool = React.useMemo(
    () =>
      records === undefined
        ? undefined
        : groupPool(
            records,
            connections === undefined
              ? undefined
              : (item) => clientOf(connections, linear, item),
          ),
    [records, connections, linear],
  );
  function retry() {
    source.server.recover();
    return queryClient.refetchQueries({ queryKey });
  }
  return { ...query, data: pool, pool, retry };
}
