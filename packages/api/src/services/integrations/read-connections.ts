/**
 * `connections.list` (USE-100): Settings › Connections' read. Every select
 * names the view's columns; a token column is never among them, and the
 * router's output (`connectionsView`, strict) refuses any extra key.
 */
import { asc, eq } from "drizzle-orm";
import {
  clients,
  googleAccounts,
  googleCalendars,
  linearConnections,
  linearProjectClients,
  users,
  type RlsClient,
} from "@syn/db";
import type { ConnectionsView } from "@syn/validators";

const iso = (value: Date) => value.toISOString();

export async function readConnections(
  rls: RlsClient,
  userId: string,
): Promise<ConnectionsView> {
  return rls.execute(async (tx) => {
    const [linear, accounts, calendars, account, clientRows, mappings] =
      await Promise.all([
        tx
          .select({
            id: linearConnections.id,
            organizationName: linearConnections.name,
            urlKey: linearConnections.urlKey,
            logoUrl: linearConnections.logoUrl,
            clientId: linearConnections.clientId,
            perProject: linearConnections.perProject,
            lastSyncedAt: linearConnections.lastSyncedAt,
            lastSyncError: linearConnections.lastSyncError,
          })
          .from(linearConnections)
          .orderBy(asc(linearConnections.createdAt)),
        tx
          .select({
            id: googleAccounts.id,
            email: googleAccounts.email,
            label: googleAccounts.label,
          })
          .from(googleAccounts)
          .orderBy(asc(googleAccounts.createdAt)),
        tx
          .select({
            id: googleCalendars.id,
            accountId: googleCalendars.accountId,
            name: googleCalendars.name,
            color: googleCalendars.color,
            primary: googleCalendars.primary,
            enabled: googleCalendars.enabled,
          })
          .from(googleCalendars)
          .orderBy(asc(googleCalendars.createdAt)),
        tx
          .select({ clientsEnabled: users.clientsEnabled })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1),
        tx
          .select({
            id: clients.id,
            createdAt: clients.createdAt,
            updatedAt: clients.updatedAt,
            name: clients.name,
            colorKey: clients.colorKey,
            logoPath: clients.logoPath,
            sortOrder: clients.sortOrder,
            archivedAt: clients.archivedAt,
          })
          .from(clients)
          .orderBy(asc(clients.sortOrder)),
        tx
          .select({
            connectionId: linearProjectClients.connectionId,
            projectId: linearProjectClients.projectId,
            clientId: linearProjectClients.clientId,
          })
          .from(linearProjectClients),
      ]);

    return {
      linear: linear.map((row) => ({
        ...row,
        lastSyncedAt: row.lastSyncedAt ? iso(row.lastSyncedAt) : null,
      })),
      googleAccounts: accounts,
      googleCalendars: calendars,
      clientsEnabled: account[0]?.clientsEnabled ?? false,
      clients: clientRows.map((row) => ({
        ...row,
        createdAt: iso(row.createdAt),
        updatedAt: iso(row.updatedAt),
        archivedAt: row.archivedAt ? iso(row.archivedAt) : null,
      })),
      projectClients: mappings,
    };
  });
}
