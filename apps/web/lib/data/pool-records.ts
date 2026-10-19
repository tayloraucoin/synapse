import type { ClientRecord, SlotRecord, WorkItemRecord } from "@syn/validators";

/**
 * What a pool read returns (USE-55), from the fixture server now and the work
 * router in wave 3: the work items neither done nor archived, their slots,
 * the clients and the Clients switch. Grouping is derived here, never stored.
 */
export interface PoolRecords {
  /** `users.clients_enabled` (D-USE-40: off by default). */
  clientsEnabled: boolean;
  /** Clients not archived, in Taylor's order (D-USE-96). */
  clients: ClientRecord[];
  workItems: WorkItemRecord[];
  /** The items' sessions, skipped ones left out. */
  slots: SlotRecord[];
}

export interface PoolItem {
  item: WorkItemRecord;
  client: ClientRecord | null;
  /** The dates its sessions sit on, earliest first (USE-8's session order). */
  sessionDates: string[];
}

export interface PoolGroup {
  /** Null: no client, or clients off. */
  client: ClientRecord | null;
  items: PoolItem[];
}

export interface Pool {
  clientsEnabled: boolean;
  items: PoolItem[];
  /**
   * With clients on, one group per client in client order (empty ones too), then the items
   * with no client; with clients off, one group of every item.
   */
  groups: PoolGroup[];
}

/**
 * Whose work an item is. Unset, the item's own client; `usePool` passes
 * USE-9's `resolveClient` through Connections' mappings (USE-86), so a
 * project mapped in Settings regroups its work at once.
 */
export type PoolClientOf = (item: WorkItemRecord) => ClientRecord | null;

export function groupPool(records: PoolRecords, clientOf?: PoolClientOf): Pool {
  const clients = new Map(records.clients.map((c) => [c.id, c]));
  const ownClient = (item: WorkItemRecord) =>
    item.clientId === null ? null : (clients.get(item.clientId) ?? null);
  const items = records.workItems.map((item) => ({
    item,
    // Only a client the pool holds: one in the order, not archived.
    client: clientOf
      ? (clients.get(clientOf(item)?.id ?? "") ?? null)
      : ownClient(item),
    sessionDates: records.slots
      .filter((slot) => slot.workItemId === item.id)
      .map((slot) => slot.onDate)
      .sort(),
  }));
  if (!records.clientsEnabled) {
    return {
      clientsEnabled: false,
      items,
      groups: items.length === 0 ? [] : [{ client: null, items }],
    };
  }
  const ordered = [...records.clients].sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );
  const groups: PoolGroup[] = ordered.map((client) => ({
    client,
    items: items.filter((entry) => entry.client?.id === client.id),
  }));
  const loose = items.filter((entry) => entry.client === null);
  if (loose.length > 0) groups.push({ client: null, items: loose });
  // [ASSUMPTION] A client with nothing open keeps its head, so its place in the order can be dragged.
  return { clientsEnabled: true, items, groups };
}
