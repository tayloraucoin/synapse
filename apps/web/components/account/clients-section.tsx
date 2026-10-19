"use client";

/**
 * ClientsSection — Settings › Connections' Clients, and the Linear workspace
 * rows they change (USE-86; account/settings/states/clients-on.md).
 *
 * ONE ORDER. The grip writes `useClients().setOrder`, USE-55's
 * `setClientOrder`, the same write the pool's client heads make (D-USE-96):
 * there is no second order and no priority field. The list holds the
 * dropped order while the write lands, so a drop never jumps back.
 *
 * THE SWITCH. On, the list, the order line, Add a client and the Personal
 * line show, and each workspace row is its mapping line with a chevron
 * (D-USE-91); off, the list hides and the rows read "Connected" with ···
 * and its Disconnect (USE-85). Turning it off keeps
 * every client and mapping for when it is turned on again.
 *
 * Nothing here is written to Linear (C-USE-settings-clients-on-3).
 */
import * as React from "react";
import {
  AddIcon,
  cn,
  DisclosureIcon,
  EllipsesMenu,
  SortableHandle,
  SortableList,
  Switch,
  Text,
} from "@syn/ui";
import type { ClientRecord, LinearConnectionView } from "@syn/validators";
import { ClientTile } from "@/components/work/client-tile";
import { CLIENTS_COPY as COPY, CONNECTIONS_COPY as LINES } from "./copy";

export interface ClientRowView {
  client: ClientRecord;
  /** "2 projects", "a workspace". */
  covers: string;
}

export interface WorkspaceRowView {
  connection: LinearConnectionView;
  /** With clients on, its mapping line (D-USE-91). */
  line: string;
  /** The client its tile takes the colour of: one client's, else none. */
  client: ClientRecord | null;
}

const ROW =
  "flex min-h-(--row-min) w-full items-center gap-(--space-3) border-b border-border text-start";
const PRESS =
  "rounded-(--radius-sm) hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none";

/** A workspace's letter tile: its client's colour, or the plain surface. */
function WorkspaceTile({
  name,
  client,
}: {
  name: string;
  client: ClientRecord | null;
}) {
  const letter = name.charAt(0).toUpperCase();
  return client ? (
    <span className="inline-flex size-6 shrink-0 items-center justify-center">
      <ClientTile letter={letter} hue={client.colorKey} size="md" />
    </span>
  ) : (
    <span
      aria-hidden="true"
      className="bg-muted text-foreground inline-flex size-6 shrink-0 items-center justify-center rounded-(--radius-sm) text-(length:--fs-caption) leading-none font-semibold"
    >
      {letter}
    </span>
  );
}

export interface WorkspaceRowsLinear {
  /** The explainer, drawn on the clients-off frame only; null until the name is read. */
  explainer: string | null;
  /** ··· › Disconnect, clients off (D-USE-91). */
  onDisconnect: (connectionId: string) => void;
  /** Offline: Disconnect needs Linear (offline.md). */
  disconnectDisabled: boolean;
  /** "+ Add a workspace" and its connect state, from Connections. */
  addRow: React.ReactNode;
  /** Skeleton rows while the workspaces are read. */
  loading?: React.ReactNode;
}

export function WorkspaceRows({
  rows,
  clientsEnabled,
  onOpen,
  linear,
}: {
  rows: readonly WorkspaceRowView[];
  clientsEnabled: boolean;
  onOpen: (connectionId: string, opener: HTMLElement) => void;
  /** USE-85's page: the explainer, ···, the live Add row. */
  linear?: WorkspaceRowsLinear;
}) {
  return (
    <section aria-labelledby="connections-linear" className="flex flex-col">
      <Text
        as="h2"
        id="connections-linear"
        variant="row-title"
        weight={600}
        className="pb-(--space-1)"
      >
        {COPY.linear}
      </Text>
      {linear?.explainer && !clientsEnabled ? (
        <Text
          as="p"
          variant="secondary"
          tone="muted"
          className="pb-(--space-2)"
        >
          {linear.explainer}
        </Text>
      ) : null}
      {linear?.loading}
      <ul className="m-0 flex list-none flex-col p-0">
        {rows.map(({ connection, line, client }) => {
          const name = connection.organizationName;
          const body = (
            <>
              <WorkspaceTile
                name={name}
                client={clientsEnabled ? client : null}
              />
              {clientsEnabled ? (
                <span className="flex min-w-0 flex-1 flex-col">
                  <Text as="span" variant="body" className="truncate">
                    {name}
                  </Text>
                  <Text as="span" variant="secondary" tone="muted">
                    {line}
                  </Text>
                </span>
              ) : (
                // Clients off, as drawn: the name, then "Connected" at the end.
                <>
                  <Text
                    as="span"
                    variant="body"
                    className="min-w-0 flex-1 truncate"
                  >
                    {name}
                  </Text>
                  <Text
                    as="span"
                    variant="secondary"
                    tone="muted"
                    className="shrink-0"
                  >
                    {COPY.connected}
                  </Text>
                </>
              )}
            </>
          );
          return (
            <li key={connection.id}>
              {clientsEnabled ? (
                <button
                  type="button"
                  aria-label={COPY.workspaceRow(name, line)}
                  onClick={(event) =>
                    onOpen(connection.id, event.currentTarget)
                  }
                  className={cn(ROW, PRESS)}
                >
                  {body}
                  <DisclosureIcon
                    aria-hidden="true"
                    className="text-foreground size-4 shrink-0"
                  />
                </button>
              ) : (
                <div className={ROW}>
                  {body}
                  {linear ? (
                    <EllipsesMenu
                      label={LINES.more(name)}
                      items={[
                        {
                          label: LINES.disconnect,
                          disabled: linear.disconnectDisabled,
                          onClick: () => linear.onDisconnect(connection.id),
                        },
                      ]}
                      className="shrink-0"
                    />
                  ) : null}
                </div>
              )}
            </li>
          );
        })}
      </ul>
      {linear ? (
        linear.addRow
      ) : (
        <div className={cn(ROW, "border-b-0 text-foreground")}>
          <AddIcon aria-hidden="true" className="size-4" />
          <Text as="span" variant="body">
            {COPY.addWorkspace}
          </Text>
        </div>
      )}
    </section>
  );
}

export interface ClientsSectionProps {
  clientsEnabled: boolean;
  onClientsEnabled: (enabled: boolean) => void;
  /** Not archived, in Taylor's order. */
  rows: readonly ClientRowView[];
  onReorder: (ids: string[]) => void;
  /** A client row, or Add a client with null. */
  onOpen: (clientId: string | null, opener: HTMLElement) => void;
}

export function ClientsSection({
  clientsEnabled,
  onClientsEnabled,
  rows,
  onReorder,
  onOpen,
}: ClientsSectionProps) {
  // The dropped order, held until the read catches up with it.
  const [held, setHeld] = React.useState<string[] | null>(null);
  const ids = rows.map((row) => row.client.id).join();
  React.useEffect(() => setHeld(null), [ids]);
  const ordered = held
    ? held
        .map((id) => rows.find((row) => row.client.id === id))
        .filter((row): row is ClientRowView => row !== undefined)
    : rows;
  const items = ordered.map((row) => ({
    id: row.client.id,
    title: row.client.name,
    row,
  }));

  return (
    <section aria-labelledby="connections-clients" className="flex flex-col">
      <div className="flex items-start gap-(--space-3)">
        <div className="flex min-w-0 flex-1 flex-col gap-(--space-1)">
          <Text
            as="h2"
            id="connections-clients"
            variant="row-title"
            weight={600}
          >
            {COPY.title}
          </Text>
          <Text as="p" variant="secondary" tone="muted">
            {COPY.explainer}
          </Text>
        </div>
        <Switch
          checked={clientsEnabled}
          onCheckedChange={onClientsEnabled}
          aria-label={COPY.title}
        />
      </div>

      {clientsEnabled ? (
        <>
          <Text
            as="p"
            variant="caption"
            tone="muted"
            className="pt-(--space-3) pb-(--space-1)"
          >
            {COPY.orderLine}
          </Text>
          <SortableList
            items={items}
            label={COPY.listLabel}
            className="gap-0"
            onReorder={(next) => {
              setHeld(next);
              onReorder(next);
            }}
            renderItem={({ row }, { handleProps }) => (
              <div className="border-border flex min-h-(--row-min) w-full items-center border-b">
                <SortableHandle
                  {...handleProps}
                  className={cn(handleProps.className, "-ms-(--space-3)")}
                />
                <button
                  type="button"
                  aria-label={COPY.clientRow(row.client.name, row.covers)}
                  onClick={(event) =>
                    onOpen(row.client.id, event.currentTarget)
                  }
                  className={cn(
                    "flex min-h-(--row-min) min-w-0 flex-1 items-center gap-(--space-3) text-start",
                    PRESS,
                  )}
                >
                  <ClientTile
                    letter={row.client.name.charAt(0).toUpperCase()}
                    hue={row.client.colorKey}
                    size="md"
                  />
                  <Text as="span" variant="body" className="flex-1 truncate">
                    {row.client.name}
                  </Text>
                  <Text
                    as="span"
                    variant="caption"
                    tone="muted"
                    className="shrink-0"
                  >
                    {row.covers}
                  </Text>
                </button>
              </div>
            )}
          />
          <button
            type="button"
            onClick={(event) => onOpen(null, event.currentTarget)}
            className={cn(ROW, PRESS)}
          >
            <AddIcon aria-hidden="true" className="size-4" />
            <Text as="span" variant="body">
              {COPY.addClient}
            </Text>
          </button>
          <Text
            as="p"
            variant="caption"
            tone="muted"
            className="pt-(--space-4)"
          >
            {COPY.personalLine}
          </Text>
        </>
      ) : null}
    </section>
  );
}
