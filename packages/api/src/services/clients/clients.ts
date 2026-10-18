import type {
  ClientArchivedInput,
  ClientRecord,
  ClientsEnabledInput,
  ClientWriteInput,
  LinearProjectClientInput,
  WorkspaceClientInput,
} from "@syn/validators";
import { refuse } from "../../errors";

/**
 * Clients (USE-104; D-USE-42, D-USE-96): Settings › Connections' client
 * rows, their one order and their mappings to Linear workspaces and
 * projects, written as the fixture server writes them.
 *
 * Each write is a plan over what the store reads, then one apply. The rules
 * sit over a `ClientStore`, so they are proved over rows in memory and run
 * over the tables through `clientStore(tx, userId)`, inside the one RLS
 * transaction the router opens: a refusal thrown anywhere rolls it all back.
 *
 * The server stores and never resolves: an item's client stays the pure
 * `resolveClient` (item, then project, then workspace). Archiving sets
 * `archived_at`; a client is never deleted. Nothing here reaches Linear.
 */

/** A Linear connection as the mapping reads it; another person's is null. */
export interface ClientConnection {
  id: string;
  clientId: string | null;
  perProject: boolean;
}

export interface ClientStore {
  /** Every client, archived too. */
  list(): Promise<ClientRecord[]>;
  insert(values: ClientValues): Promise<ClientRecord>;
  /** The changed row, or null when there is none with that id. */
  update(id: string, values: ClientValues): Promise<ClientRecord | null>;
  /** True when a row changed. */
  setArchivedAt(id: string, at: Date | null): Promise<boolean>;
  /** Every pair in one statement, so an order is never half written. */
  setSortOrders(orders: ClientSortOrder[]): Promise<void>;
  setClientsEnabled(enabled: boolean): Promise<void>;
  connection(id: string): Promise<ClientConnection | null>;
  setConnectionClient(
    id: string,
    values: { clientId: string | null; perProject: boolean },
  ): Promise<void>;
  /** One row per (connection, project): the unique key. */
  upsertProjectClient(input: LinearProjectClientInput): Promise<void>;
}

export interface ClientValues {
  name: string;
  colorKey: ClientRecord["colorKey"];
  logoPath: string | null;
  sortOrder: number;
}

export interface ClientSortOrder {
  id: string;
  sortOrder: number;
}

/* ---------------------------------------------------------------- plans -- */

/**
 * D-USE-96's one order, top first: every client not archived, once, and
 * only the ones whose place moved. An archived client keeps its place for
 * its Undo.
 */
export function planClientOrder(
  clients: readonly ClientRecord[],
  ids: readonly string[],
): ClientSortOrder[] {
  const active = clients.filter((c) => c.archivedAt === null);
  if (
    ids.length !== active.length ||
    !active.every((client) => ids.includes(client.id))
  ) {
    throw refuse("invalid", "Each client once.");
  }
  return ids.flatMap((id, sortOrder) =>
    active.find((c) => c.id === id)!.sortOrder === sortOrder
      ? []
      : [{ id, sortOrder }],
  );
}

/** Set per project clears the workspace's one client (D-USE-91). */
export function planWorkspaceClient(input: WorkspaceClientInput): {
  clientId: string | null;
  perProject: boolean;
} {
  return {
    clientId: input.perProject ? null : input.clientId,
    perProject: input.perProject,
  };
}

/* --------------------------------------------------------------- writes -- */

/** A new client, or with `id` a change to one. */
export async function writeClient(
  store: ClientStore,
  { id, ...input }: ClientWriteInput,
): Promise<ClientRecord> {
  const values: ClientValues = {
    name: input.name,
    colorKey: input.colorKey,
    logoPath: input.logoPath ?? null,
    sortOrder: input.sortOrder,
  };
  if (id === undefined) return store.insert(values);
  const row = await store.update(id, values);
  if (!row) throw refuse("unknown", "No client with that id.");
  return row;
}

/** Remove client, or its Undo: the row stays, with every mapping. */
export async function writeClientArchived(
  store: ClientStore,
  { id, archived }: ClientArchivedInput,
): Promise<void> {
  if (!(await store.setArchivedAt(id, archived ? new Date() : null))) {
    throw refuse("unknown", "No client with that id.");
  }
}

export function writeClientsEnabled(
  store: ClientStore,
  { enabled }: ClientsEnabledInput,
): Promise<void> {
  return store.setClientsEnabled(enabled);
}

export async function setClientOrder(
  store: ClientStore,
  ids: readonly string[],
): Promise<void> {
  const orders = planClientOrder(await store.list(), ids);
  if (orders.length > 0) await store.setSortOrders(orders);
}

export async function writeWorkspaceClient(
  store: ClientStore,
  input: WorkspaceClientInput,
): Promise<void> {
  await requireConnection(store, input.connectionId);
  await requireClient(store, input.clientId);
  await store.setConnectionClient(
    input.connectionId,
    planWorkspaceClient(input),
  );
}

export async function writeProjectClient(
  store: ClientStore,
  input: LinearProjectClientInput,
): Promise<void> {
  await requireConnection(store, input.connectionId);
  await requireClient(store, input.clientId);
  await store.upsertProjectClient(input);
}

/** Read through RLS first: another person's connection is not there. */
async function requireConnection(store: ClientStore, id: string) {
  if (!(await store.connection(id))) {
    throw refuse("unknown", "No workspace with that id.");
  }
}

/** None, or a client of the caller's not archived. */
async function requireClient(store: ClientStore, id: string | null) {
  if (id === null) return;
  const clients = await store.list();
  if (!clients.some((c) => c.id === id && c.archivedAt === null)) {
    throw refuse("unknown", "No client with that id.");
  }
}
