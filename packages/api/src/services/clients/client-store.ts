import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  clients,
  linearConnections,
  linearProjectClients,
  users,
  type RlsClient,
} from "@syn/db";
import type { ClientRecord } from "@syn/validators";
import type { ClientStore } from "./clients";

/**
 * The `ClientStore` over `clients`, `users.clients_enabled`,
 * `linear_connections` and `linear_project_clients`, inside the caller's RLS
 * transaction. Every statement also names the caller, beside the policies.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

const COLUMNS = {
  id: clients.id,
  createdAt: clients.createdAt,
  updatedAt: clients.updatedAt,
  name: clients.name,
  colorKey: clients.colorKey,
  logoPath: clients.logoPath,
  sortOrder: clients.sortOrder,
  archivedAt: clients.archivedAt,
} as const;

type Row = Omit<ClientRecord, "createdAt" | "updatedAt" | "archivedAt"> & {
  createdAt: Date;
  updatedAt: Date;
  archivedAt: Date | null;
};

function toRecord(row: Row): ClientRecord {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    archivedAt: row.archivedAt ? row.archivedAt.toISOString() : null,
  };
}

export function clientStore(tx: Tx, userId: string): ClientStore {
  const mine = eq(clients.userId, userId);
  const myConnection = (id: string) =>
    and(eq(linearConnections.userId, userId), eq(linearConnections.id, id));

  return {
    async list() {
      const rows = await tx
        .select(COLUMNS)
        .from(clients)
        .where(mine)
        .orderBy(asc(clients.sortOrder), asc(clients.createdAt));
      return rows.map(toRecord);
    },

    async insert(values) {
      const [row] = await tx
        .insert(clients)
        .values({ ...values, userId })
        .returning(COLUMNS);
      return toRecord(row!);
    },

    async update(id, values) {
      const [row] = await tx
        .update(clients)
        .set({ ...values, updatedAt: new Date() })
        .where(and(mine, eq(clients.id, id)))
        .returning(COLUMNS);
      return row ? toRecord(row) : null;
    },

    async setArchivedAt(id, at) {
      const rows = await tx
        .update(clients)
        .set({ archivedAt: at, updatedAt: new Date() })
        .where(and(mine, eq(clients.id, id)))
        .returning({ id: clients.id });
      return rows.length > 0;
    },

    async setSortOrders(orders) {
      const order = sql.join(
        orders.map(
          ({ id, sortOrder }) =>
            sql`when ${id}::uuid then ${sortOrder}::smallint`,
        ),
        sql` `,
      );
      await tx
        .update(clients)
        .set({
          sortOrder: sql`case ${clients.id} ${order} end`,
          updatedAt: new Date(),
        })
        .where(
          and(
            mine,
            inArray(
              clients.id,
              orders.map((o) => o.id),
            ),
          ),
        );
    },

    async setClientsEnabled(enabled) {
      await tx
        .update(users)
        .set({ clientsEnabled: enabled })
        .where(eq(users.id, userId));
    },

    async connection(id) {
      const [row] = await tx
        .select({
          id: linearConnections.id,
          clientId: linearConnections.clientId,
          perProject: linearConnections.perProject,
        })
        .from(linearConnections)
        .where(myConnection(id))
        .limit(1);
      return row ?? null;
    },

    async setConnectionClient(id, values) {
      await tx
        .update(linearConnections)
        .set({ ...values, updatedAt: new Date() })
        .where(myConnection(id));
    },

    async upsertProjectClient({ connectionId, projectId, clientId }) {
      await tx
        .insert(linearProjectClients)
        .values({ connectionId, projectId, clientId, userId })
        .onConflictDoUpdate({
          target: [
            linearProjectClients.connectionId,
            linearProjectClients.projectId,
          ],
          set: { clientId, updatedAt: new Date() },
        });
    },
  };
}
