"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { ClientInput, WorkItemRecord } from "@syn/validators";
import { clientOf } from "./integration-records";
import { useDataSource } from "./source";
import {
  connectionsQueryKey,
  useConnections,
  useConnectionsQuery,
} from "./use-connections";
import { useLinearIssues } from "./use-linear";
import { useWorkWrites } from "./use-work-writes";

/**
 * The clients (USE-56): the records not archived, the one order (D-USE-96)
 * and whose work an item is, through USE-9's `resolveClient` only.
 *
 * Settings' writes (USE-86): `add` puts a client last, `update` its name and
 * colour, `remove` archives it (its work resolves to no client, Personal;
 * the returned undo brings it back) and `setOrder` is USE-55's
 * `setClientOrder`, the same write the pool's client heads make, so there is
 * one order. None of them reaches Linear.
 */

type Item = Pick<
  WorkItemRecord,
  "id" | "clientId" | "linearConnectionId" | "linearIssueId"
>;

type Details = Pick<ClientInput, "name" | "colorKey">;

export function useClients() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const query = useConnectionsQuery();
  const connections = useConnections();
  const work = useWorkWrites();
  const linear = useLinearIssues();
  const data = query.data;
  const records = (data?.clients ?? []).filter((c) => c.archivedAt === null);

  // `setClientOrder` refreshes the day, the week and the pool; Settings reads connections.
  const refresh = () =>
    queryClient.invalidateQueries({
      queryKey: connectionsQueryKey(source.scenario.name),
    });

  return {
    isPending: query.isPending,
    error: query.error,
    clientsEnabled: data?.clientsEnabled ?? false,
    records,
    order: records.map((client) => client.id),
    clientFor: (item: Item) =>
      data ? clientOf(data, linear.data, item) : null,
    add: (details: Details) =>
      connections.saveClient({
        ...details,
        sortOrder:
          Math.max(-1, ...(data?.clients ?? []).map((c) => c.sortOrder)) + 1,
      }),
    update: (id: string, details: Details) => {
      const row = records.find((c) => c.id === id);
      if (!row) return Promise.reject(new Error("No client with that id."));
      return connections.saveClient({
        id,
        ...details,
        logoPath: row.logoPath,
        sortOrder: row.sortOrder,
      });
    },
    /** Resolves to its Undo. */
    remove: async (id: string) => {
      await connections.archiveClient({ id, archived: true });
      return () => connections.archiveClient({ id, archived: false });
    },
    setOrder: (ids: string[]) =>
      work.setClientOrder({ ids }).finally(() => void refresh()),
  };
}
