"use client";

import type { WorkItemRecord } from "@syn/validators";
import { clientOf } from "./integration-records";
import { useConnectionsQuery } from "./use-connections";
import { useLinearIssues } from "./use-linear";

/**
 * The clients (USE-56): the records not archived, the one order (D-USE-96)
 * and whose work an item is, through USE-9's `resolveClient` only.
 */

type Item = Pick<
  WorkItemRecord,
  "id" | "clientId" | "linearConnectionId" | "linearIssueId"
>;

export function useClients() {
  const connections = useConnectionsQuery();
  const linear = useLinearIssues();
  const data = connections.data;
  const records = (data?.clients ?? []).filter((c) => c.archivedAt === null);
  return {
    isPending: connections.isPending,
    error: connections.error,
    clientsEnabled: data?.clientsEnabled ?? false,
    records,
    order: records.map((client) => client.id),
    clientFor: (item: Item) =>
      data ? clientOf(data, linear.data, item) : null,
  };
}
