"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { IntegrationServer } from "@/lib/fixtures/integrations";
import type {
  ConnectKind,
  GoogleCalendarsRecords,
} from "@/lib/fixtures/integrations/connect";
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
 *
 * USE-85: the Google calendar list is its own query, so it waits or fails
 * apart from Linear and Clients (error.md); `connect` stands for a
 * provider's sign-in coming back, and `retry` rereads what failed.
 */

export type { ConnectKind, GoogleCalendarsRecords };

export function connectionsQueryKey(scenario: string) {
  return ["connections", scenario] as const;
}

export function googleCalendarsQueryKey(scenario: string) {
  return ["google-calendars", scenario] as const;
}

type ConnectionsMethod =
  | "writeCalendar"
  | "writeProjectClient"
  | "writeWorkspaceClient"
  | "writeClientsEnabled"
  | "writeClient"
  | "writeClientArchived"
  | "disconnect"
  | "connect";

type ConnectionsServer = IntegrationServer & {
  connect(kind: ConnectKind): Promise<void>;
};

type ConnectionsCall = {
  [M in ConnectionsMethod]: {
    method: M;
    args: Parameters<ConnectionsServer[M]>;
  };
}[ConnectionsMethod];

export function useConnectionsQuery() {
  const source = useDataSource();
  return useQuery<ConnectionsRecords>({
    queryKey: connectionsQueryKey(source.scenario.name),
    queryFn: () => source.server.readConnections(),
    retry: false,
  });
}

/** The Google section's calendars and accounts, read on their own. */
export function useGoogleCalendarsQuery() {
  const source = useDataSource();
  return useQuery<GoogleCalendarsRecords>({
    queryKey: googleCalendarsQueryKey(source.scenario.name),
    queryFn: () => source.server.readGoogleCalendars(),
    // A failed list says so at once; Try again is the retry (error.md).
    retry: false,
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
        // Settings' own calendar list (USE-85): a switch or a connect.
        googleCalendarsQueryKey(scenario),
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
    (...args: Parameters<ConnectionsServer[M]>) =>
      mutation.mutateAsync({ method, args } as ConnectionsCall) as ReturnType<
        ConnectionsServer[M]
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
    /** Add a Google account or a workspace (USE-85): never writes to either. */
    connect: write("connect"),
    /** Try again on a failed read: Connections, or the calendar list alone. */
    retry: (what: "connections" | "calendars") => {
      if (what === "connections") source.server.recoverConnections();
      source.server.recoverCalendars();
      for (const queryKey of [
        connectionsQueryKey(scenario),
        googleCalendarsQueryKey(scenario),
      ]) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
