/**
 * Whose work an item is (USE-9; D-USE-91).
 *
 * The item's own client, then its project's in a per-project workspace, then
 * the workspace's one client. A project set to No client (or never mapped)
 * in a per-project workspace stays with none: it is Personal, never the
 * workspace's. Clients off means no client, whatever is mapped; so does a
 * resolved client that is archived.
 */

export interface ClientItem {
  clientId: string | null;
  linearConnectionId: string | null;
  linearProjectId: string | null;
}

export interface ClientConnection {
  /** The workspace's one client; unused when `perProject`. */
  clientId: string | null;
  perProject: boolean;
}

export function resolveClient(input: {
  clientsEnabled: boolean;
  item: ClientItem;
  connections: ReadonlyMap<string, ClientConnection>;
  /** Keyed `${connectionId}:${projectId}`; null is No client. */
  projectClients: ReadonlyMap<string, string | null>;
  archived: ReadonlySet<string>;
}): string | null {
  if (!input.clientsEnabled) return null;
  const resolved = clientOf(input);
  return resolved !== null && input.archived.has(resolved) ? null : resolved;
}

function clientOf(input: {
  item: ClientItem;
  connections: ReadonlyMap<string, ClientConnection>;
  projectClients: ReadonlyMap<string, string | null>;
}): string | null {
  const { item } = input;
  if (item.clientId !== null) return item.clientId;
  if (item.linearConnectionId === null) return null;
  const connection = input.connections.get(item.linearConnectionId);
  if (connection === undefined) return null;
  if (!connection.perProject) return connection.clientId;
  if (item.linearProjectId === null) return null;
  return (
    input.projectClients.get(
      `${item.linearConnectionId}:${item.linearProjectId}`,
    ) ?? null
  );
}
