"use client";

/**
 * ClientsSettings — Connections' Linear rows and Clients, wired to
 * `useConnections` and `useClients`, with the client sheet and the
 * workspace sheet they open (USE-86). USE-85's Connections page mounts it
 * below Google Calendar and hands it `workspaces`: the clients-off explainer,
 * ··· › Disconnect and the live Add a workspace row.
 *
 * A capture opens a sheet through the scenario's `view.open`:
 * "client:<id>" or "workspace:<connection id>".
 */
import * as React from "react";
import { CLIENT_COLOR_KEYS } from "@syn/constants";
import { toast } from "@syn/ui";
import {
  clientCoverage,
  coverageLine,
  coverageWords,
  firstFreeColour,
  mappingLine,
  syncedAgo,
  workspaceMappings,
} from "@/lib/data/clients-settings";
import { useDataSource } from "@/lib/data/source";
import { useClients } from "@/lib/data/use-clients";
import { useConnections } from "@/lib/data/use-connections";
import { useLinearIssues } from "@/lib/data/use-linear";
import { ClientSheet } from "./client-sheet";
import {
  ClientsSection,
  WorkspaceRows,
  type WorkspaceRowsLinear,
} from "./clients-section";
import { CLIENTS_COPY as COPY } from "./copy";
import { WorkspaceSheet } from "./workspace-sheet";

type Open =
  | { kind: "client"; id: string | null }
  | { kind: "workspace"; id: string }
  | null;

function seededOpen(open: string | undefined): Open {
  const [kind, id] = open?.split(":") ?? [];
  if (kind === "client" && id) return { kind, id };
  if (kind === "workspace" && id) return { kind, id };
  return null;
}

export interface ClientsSettingsProps {
  /** Connections' parts of the Linear section (USE-85). */
  workspaces?: WorkspaceRowsLinear;
}

export function ClientsSettings({ workspaces }: ClientsSettingsProps = {}) {
  const source = useDataSource();
  const connections = useConnections();
  const clients = useClients();
  const linear = useLinearIssues();
  const [open, setOpen] = React.useState<Open>(() =>
    seededOpen(source.scenario.view?.open),
  );
  const opener = React.useRef<HTMLElement | null>(null);

  const data = connections.connections;
  if (data === undefined) return null;

  const mappings = workspaceMappings(data, linear.data);
  const live = clients.records;
  const coverage = (id: string) => clientCoverage(mappings, id);

  const openClient =
    open?.kind === "client"
      ? open.id === null
        ? null
        : (live.find((c) => c.id === open.id) ?? null)
      : null;
  const openMapping =
    open?.kind === "workspace"
      ? (mappings.find((m) => m.connection.id === open.id) ?? null)
      : null;

  function show(next: Open, from: HTMLElement) {
    opener.current = from;
    setOpen(next);
  }

  async function remove(id: string) {
    const name = live.find((c) => c.id === id)?.name ?? "";
    setOpen(null);
    const undo = await clients.remove(id);
    toast(COPY.removed(name), {
      action: { label: "Undo", onClick: () => void undo() },
    });
  }

  return (
    <>
      <WorkspaceRows
        clientsEnabled={clients.clientsEnabled}
        rows={mappings.map((mapping) => ({
          connection: mapping.connection,
          line: mappingLine(mapping, live),
          client: mapping.connection.perProject
            ? null
            : (live.find((c) => c.id === mapping.connection.clientId) ?? null),
        }))}
        onOpen={(id, from) => show({ kind: "workspace", id }, from)}
        {...(workspaces ? { linear: workspaces } : {})}
      />
      <ClientsSection
        clientsEnabled={clients.clientsEnabled}
        onClientsEnabled={(enabled) =>
          void connections.setClientsEnabled({ enabled })
        }
        rows={live.map((client) => ({
          client,
          covers: coverageWords(coverage(client.id)),
        }))}
        onReorder={(ids) => void clients.setOrder(ids)}
        onOpen={(id, from) => show({ kind: "client", id }, from)}
      />

      <ClientSheet
        open={open?.kind === "client"}
        onOpenChange={(next) => {
          if (!next) setOpen(null);
        }}
        client={openClient}
        covers={openClient ? coverageLine(coverage(openClient.id)) : ""}
        freeColour={firstFreeColour(live, CLIENT_COLOR_KEYS)}
        onSave={(details) =>
          openClient
            ? clients.update(openClient.id, details)
            : clients.add(details)
        }
        onRemove={() => {
          if (openClient) void remove(openClient.id);
        }}
        returnFocusRef={opener}
      />
      <WorkspaceSheet
        open={open?.kind === "workspace"}
        onOpenChange={(next) => {
          if (!next) setOpen(null);
        }}
        mapping={openMapping}
        clients={live}
        synced={syncedAgo(
          openMapping?.connection.lastSyncedAt ?? null,
          source.now(),
        )}
        onPerProject={(perProject) => {
          if (openMapping)
            void connections.setPerProject(
              openMapping.connection.id,
              perProject,
            );
        }}
        onMap={(projectId, clientId) => {
          if (openMapping)
            void connections.setMapping({
              connectionId: openMapping.connection.id,
              ...(projectId === undefined ? {} : { projectId }),
              clientId,
            });
        }}
        onDisconnect={() => {
          if (!openMapping) return;
          setOpen(null);
          if (workspaces) workspaces.onDisconnect(openMapping.connection.id);
          else void connections.disconnect(openMapping.connection.id);
        }}
        disconnectDisabled={workspaces?.disconnectDisabled ?? false}
        returnFocusRef={opener}
      />
    </>
  );
}
