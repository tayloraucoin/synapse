"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IntegrationServer } from "@/lib/fixtures/integrations";
import type { ConnectionsRecords } from "./integration-records";
import { useDataSource } from "./source";
import { googleEventsQueryKey } from "./use-google-events";
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
  | "writeClientArchived"
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
        // A calendar turned off or on takes its events off or puts them back.
        googleEventsQueryKey(scenario),
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
    archiveClient: write("writeClientArchived"),
    /**
     * A project's client in a per-project workspace, or with no `projectId`
     * the workspace's one client (USE-86). Saves as made; never to Linear.
     */
    setMapping: ({
      connectionId,
      projectId,
      clientId,
    }: {
      connectionId: string;
      projectId?: string;
      clientId: string | null;
    }) =>
      projectId === undefined
        ? write("writeWorkspaceClient")({
            connectionId,
            clientId,
            perProject: false,
          })
        : write("writeProjectClient")({ connectionId, projectId, clientId }),
    /**
     * One client or Set per project (USE-86). The projects' rows are kept
     * either way, so a switch back to per project finds them as they were.
     */
    setPerProject: (connectionId: string, perProject: boolean) =>
      write("writeWorkspaceClient")({
        connectionId,
        perProject,
        clientId: perProject
          ? null
          : (query.data?.linear.find((c) => c.id === connectionId)?.clientId ??
            null),
      }),
    disconnect: write("disconnect"),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
