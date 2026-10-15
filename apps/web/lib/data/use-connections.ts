"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IntegrationServer } from "@/lib/fixtures/integrations";
import type { ConnectionsRecords } from "./integration-records";
import { useDataSource } from "./source";
import { linearQueryKey } from "./use-linear";
import { poolQueryKey } from "./use-pool";

/**
 * Settings › Connections on fixtures (USE-56): the Google calendars, the
 * Linear workspaces, the Clients switch and the client mappings. Every
 * change saves as made; none is written to Google or Linear
 * (C-USE-settings-4). Wave 3 swaps these for the connections router.
 */

export function connectionsQueryKey(scenario: string) {
  return ["connections", scenario] as const;
}

type ConnectionsMethod =
  | "writeCalendar"
  | "writeProjectClient"
  | "writeWorkspaceClient"
  | "writeClientsEnabled"
  | "writeClient"
  | "disconnect";

type ConnectionsCall = {
  [M in ConnectionsMethod]: {
    method: M;
    args: Parameters<IntegrationServer[M]>;
  };
}[ConnectionsMethod];

export function useConnectionsQuery() {
  const source = useDataSource();
  return useQuery<ConnectionsRecords>({
    queryKey: connectionsQueryKey(source.scenario.name),
    queryFn: () => source.server.readConnections(),
  });
}

export function useConnections() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const scenario = source.scenario.name;
  const query = useConnectionsQuery();

  const mutation = useMutation<unknown, Error, ConnectionsCall>({
    mutationFn: ({ method, args }) =>
      (source.server[method] as (...a: unknown[]) => Promise<unknown>)(...args),
    // A mapping or the switch regroups the pool; a disconnect empties Linear.
    onSettled: () => {
      for (const queryKey of [
        connectionsQueryKey(scenario),
        linearQueryKey(scenario),
        poolQueryKey(scenario),
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  const write =
    <M extends ConnectionsMethod>(method: M) =>
    (...args: Parameters<IntegrationServer[M]>) =>
      mutation.mutateAsync({ method, args } as ConnectionsCall) as ReturnType<
        IntegrationServer[M]
      >;

  return {
    ...query,
    connections: query.data,
    setCalendar: write("writeCalendar"),
    setProjectClient: write("writeProjectClient"),
    setWorkspaceClient: write("writeWorkspaceClient"),
    setClientsEnabled: write("writeClientsEnabled"),
    saveClient: write("writeClient"),
    disconnect: write("disconnect"),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
