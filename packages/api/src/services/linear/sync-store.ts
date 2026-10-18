/**
 * The sync's reads and writes through `ctx.rls` (USE-101), every one inside
 * `rls.execute`, so each row is the caller's. `writeSync` is one
 * transaction: the snapshot, the closed-issue pass (`planLinearCloses`,
 * applied as the work writes apply theirs), and `last_synced_at`. Only the
 * latest snapshot per connection is kept [ASSUMPTION: the read needs no
 * other, and one every five minutes would grow the table without end].
 */
import { and, eq, isNotNull, isNull, lt } from "drizzle-orm";
import {
  linearConnections,
  linearSnapshots,
  workItems,
  type RlsClient,
} from "@syn/db";
import { RowJournal, systemClock } from "../planner/write-journal";
import { applyChanges } from "../planner/write-rows";
import { rowStore } from "../undo/row-store";
import { planLinearCloses } from "../work/linear-items";
import { selectWorkRows, type WorkJournal } from "../work/work-rows";
import type { LinearSyncStore } from "./sync";

export function createLinearSyncStore(
  rls: RlsClient,
  userId: string,
): LinearSyncStore {
  return {
    connections(connectionId) {
      return rls.execute((tx) =>
        tx
          .select({
            id: linearConnections.id,
            lastSyncedAt: linearConnections.lastSyncedAt,
            lastSyncError: linearConnections.lastSyncError,
          })
          .from(linearConnections)
          .where(
            and(
              eq(linearConnections.userId, userId),
              connectionId === undefined
                ? undefined
                : eq(linearConnections.id, connectionId),
            ),
          ),
      );
    },

    async placedIssueIds(connectionId) {
      const rows = await rls.execute((tx) =>
        tx
          .select({ issueId: workItems.linearIssueId })
          .from(workItems)
          .where(
            and(
              eq(workItems.userId, userId),
              eq(workItems.linearConnectionId, connectionId),
              isNotNull(workItems.linearIssueId),
              isNull(workItems.doneAt),
              isNull(workItems.archivedAt),
            ),
          ),
      );
      return rows.flatMap((row) => (row.issueId === null ? [] : [row.issueId]));
    },

    writeSync(connectionId, payload, at) {
      return rls.execute(async (tx) => {
        await tx.insert(linearSnapshots).values({
          userId,
          connectionId,
          payload,
          fetchedAt: at,
        });
        await tx
          .delete(linearSnapshots)
          .where(
            and(
              eq(linearSnapshots.userId, userId),
              eq(linearSnapshots.connectionId, connectionId),
              lt(linearSnapshots.fetchedAt, at),
            ),
          );

        const linked = await tx
          .select({ id: workItems.id })
          .from(workItems)
          .where(
            and(
              eq(workItems.userId, userId),
              eq(workItems.linearConnectionId, connectionId),
              isNull(workItems.doneAt),
              isNull(workItems.archivedAt),
            ),
          );
        let closed: string[] = [];
        if (linked.length > 0) {
          const rows = await selectWorkRows(tx, userId, {
            workItemIds: linked.map((row) => row.id),
          });
          const journal: WorkJournal = new RowJournal(rows, {
            now: () => at,
            newId: systemClock.newId,
          });
          closed = planLinearCloses(journal, connectionId, payload);
          await applyChanges(rowStore(tx, userId), journal.changes());
        }

        await tx
          .update(linearConnections)
          .set({ lastSyncedAt: at, lastSyncError: null, updatedAt: at })
          .where(eq(linearConnections.id, connectionId));
        return { closed };
      });
    },

    async markSyncError(connectionId, message) {
      await rls.execute((tx) =>
        tx
          .update(linearConnections)
          .set({ lastSyncError: message, updatedAt: new Date() })
          .where(eq(linearConnections.id, connectionId)),
      );
    },
  };
}
