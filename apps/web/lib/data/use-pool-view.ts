"use client";

import {
  poolView,
  type PoolGroupBy,
  type PoolSort,
  type PoolTab,
} from "./pool-view";
import { useDataSource } from "./source";
import { useAccount } from "./use-account";
import { useClients } from "./use-clients";
import { useLinear } from "./use-linear";
import { usePool } from "./use-pool";

/**
 * The desk's pool panel (USE-74): `poolView` over `usePool`, `useLinear` and
 * `useClients`, with the panel's own choices (tab, Group, Sort, Search) kept
 * here and run on the device (D-USE-57). Reordering a client is the same
 * write Settings › Clients makes, so there is one order (D-USE-96).
 */
export function usePoolView({
  group,
  sort,
  query,
  tab,
}: {
  group: PoolGroupBy;
  sort: PoolSort;
  query: string;
  tab: PoolTab;
}) {
  const source = useDataSource();
  const pool = usePool();
  const linear = useLinear();
  const clients = useClients();
  const personName = (useAccount().data?.name ?? "").split(" ")[0] ?? "";
  const todayKey = source.todayKey();

  // Cheap to work out: every render reads the queries as they stand.
  const view =
    pool.pool && !clients.isPending
      ? poolView({
          pool: pool.pool,
          linear: linear.data ?? null,
          clients: clients.records,
          clientsEnabled: clients.clientsEnabled,
          clientFor: clients.clientFor,
          personName,
          todayKey,
          now: source.now(),
          group,
          sort,
          query,
          tab,
        })
      : null;

  return {
    view,
    isError: pool.isError,
    retry: pool.retry,
    todayKey,
    /** useClients' setOrder, USE-55's setClientOrder: the one order Settings › Clients writes (C-USE-week-6). */
    reorderClients: clients.setOrder,
    syncNow: () => linear.syncNow(),
    isSyncing: linear.isSyncing,
  };
}
