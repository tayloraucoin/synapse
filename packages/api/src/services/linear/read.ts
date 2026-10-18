/**
 * `linear.read` (USE-101): what the fixture server's `readLinear` returns,
 * field for field: each connection as a view, its latest snapshot, the
 * outbox (USE-102 fills it) and the assigned open issues no work item holds
 * yet (the pool's From Linear). One `rls.execute`; every select names its
 * columns, and no token column is among them.
 */
import { asc, desc, isNotNull } from "drizzle-orm";
import {
  linearConnections,
  linearSnapshots,
  linearWrites,
  workItems,
  type RlsClient,
} from "@syn/db";
import {
  linearSnapshotPayload,
  type LinearReadOutput,
  type LinearSnapshotPayload,
} from "@syn/validators";
import { CLOSED_STATE_TYPES } from "./documents";

const iso = (value: Date) => value.toISOString();

export async function readLinearSnapshots(
  rls: RlsClient,
): Promise<Map<string, LinearSnapshotPayload>> {
  return rls.execute(async (tx) =>
    latestOf(
      await tx
        .select({
          connectionId: linearSnapshots.connectionId,
          payload: linearSnapshots.payload,
        })
        .from(linearSnapshots)
        .orderBy(desc(linearSnapshots.fetchedAt)),
    ),
  );
}

/** The newest snapshot per connection; one that no longer parses is skipped. */
function latestOf(
  rows: readonly { connectionId: string; payload: unknown }[],
): Map<string, LinearSnapshotPayload> {
  const latest = new Map<string, LinearSnapshotPayload>();
  for (const row of rows) {
    if (latest.has(row.connectionId)) continue;
    const parsed = linearSnapshotPayload.safeParse(row.payload);
    if (parsed.success) latest.set(row.connectionId, parsed.data);
  }
  return latest;
}

export async function readLinear(rls: RlsClient): Promise<LinearReadOutput> {
  const { connections, snapshots, outbox, linked } = await rls.execute(
    async (tx) => {
      const [connections, snapshots, outbox, linked] = await Promise.all([
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
            connectionId: linearSnapshots.connectionId,
            payload: linearSnapshots.payload,
          })
          .from(linearSnapshots)
          .orderBy(desc(linearSnapshots.fetchedAt)),
        tx
          .select({
            id: linearWrites.id,
            workItemId: linearWrites.workItemId,
            kind: linearWrites.kind,
            state: linearWrites.state,
            createdAt: linearWrites.createdAt,
          })
          .from(linearWrites)
          .orderBy(asc(linearWrites.createdAt), asc(linearWrites.id)),
        tx
          .select({
            connectionId: workItems.linearConnectionId,
            issueId: workItems.linearIssueId,
          })
          .from(workItems)
          .where(isNotNull(workItems.linearIssueId)),
      ]);
      return { connections, snapshots, outbox, linked };
    },
  );

  const latest = latestOf(snapshots);
  // Any item holding the issue, done or archived too, as the fixture reads it.
  const placed = new Set(
    linked.map((row) => `${row.connectionId}:${row.issueId}`),
  );
  const workspaces = connections.flatMap((c) => {
    const payload = latest.get(c.id);
    return payload ? [{ connectionId: c.id, payload }] : [];
  });

  return {
    connections: connections.map((c) => ({
      ...c,
      lastSyncedAt: c.lastSyncedAt === null ? null : iso(c.lastSyncedAt),
    })),
    workspaces,
    outbox: outbox.map((row) => ({ ...row, createdAt: iso(row.createdAt) })),
    notInPool: workspaces.flatMap(({ connectionId, payload }) => {
      const open = new Set(
        payload.states
          .filter((s) => !CLOSED_STATE_TYPES.includes(s.type))
          .map((s) => s.id),
      );
      return [...payload.issues, ...payload.subIssues]
        .filter(
          (issue) =>
            issue.assignedToMe &&
            open.has(issue.stateId) &&
            !placed.has(`${connectionId}:${issue.id}`),
        )
        .map((issue) => ({ ...issue, connectionId }));
    }),
  };
}
