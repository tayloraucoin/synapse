/**
 * The outbox's reads and writes through `ctx.rls` (USE-102), every one
 * inside `rls.execute`, so each row is the caller's. `commit` is the one
 * transaction the write needs: Synapse's value on the latest snapshot's
 * issue, the check's kept state on the work item, and the pending row.
 */
import { and, asc, desc, eq, isNull, lt, sql } from "drizzle-orm";
import {
  linearSnapshots,
  linearWrites,
  workItems,
  type RlsClient,
} from "@syn/db";
import { linearSnapshotPayload } from "@syn/validators";
import { refuse } from "../../errors";
import {
  applyLinearWrite,
  type LinearOutboxStore,
  type LinearWritePayload,
  type LinearWriteRow,
} from "./outbox";

const ROW = {
  id: linearWrites.id,
  workItemId: linearWrites.workItemId,
  connectionId: linearWrites.connectionId,
  issueId: linearWrites.issueId,
  kind: linearWrites.kind,
  state: linearWrites.state,
  payload: linearWrites.payload,
  attempts: linearWrites.attempts,
  lastError: linearWrites.lastError,
  createdAt: linearWrites.createdAt,
};

type Selected = Omit<LinearWriteRow, "payload"> & { payload: unknown };

const rowOf = (row: Selected): LinearWriteRow => ({
  ...row,
  payload: row.payload as LinearWritePayload,
});

export function createLinearOutboxStore(
  rls: RlsClient,
  userId: string,
): LinearOutboxStore {
  const mine = (id: string) =>
    and(eq(linearWrites.id, id), eq(linearWrites.userId, userId));

  return {
    linked(workItemId) {
      return rls.execute(async (tx) => {
        const [item] = await tx
          .select({
            connectionId: workItems.linearConnectionId,
            issueId: workItems.linearIssueId,
            prevStateId: workItems.linearPrevStateId,
          })
          .from(workItems)
          .where(
            and(
              eq(workItems.id, workItemId),
              eq(workItems.userId, userId),
              isNull(workItems.archivedAt),
            ),
          );
        if (!item) throw refuse("unknown", "No work item with that id.");
        if (item.connectionId === null || item.issueId === null) {
          // D-USE-57: Synapse-only work is never written to Linear.
          throw refuse("invalid", "That task is not in Linear.");
        }
        const [latest] = await tx
          .select({ payload: linearSnapshots.payload })
          .from(linearSnapshots)
          .where(eq(linearSnapshots.connectionId, item.connectionId))
          .orderBy(desc(linearSnapshots.fetchedAt))
          .limit(1);
        const parsed = linearSnapshotPayload.safeParse(latest?.payload);
        if (!parsed.success) throw refuse("unknown", "No issue with that id.");
        return {
          workItemId,
          connectionId: item.connectionId,
          issueId: item.issueId,
          prevStateId: item.prevStateId,
          snapshot: parsed.data,
        };
      });
    },

    async lastDonePrevState(workItemId, issueId) {
      const [row] = await rls.execute((tx) =>
        tx
          .select({ payload: linearWrites.payload })
          .from(linearWrites)
          .where(
            and(
              eq(linearWrites.userId, userId),
              eq(linearWrites.workItemId, workItemId),
              eq(linearWrites.issueId, issueId),
              eq(linearWrites.kind, "done"),
            ),
          )
          .orderBy(desc(linearWrites.createdAt))
          .limit(1),
      );
      const payload = row?.payload as { prevStateId?: string | null } | null;
      return payload?.prevStateId ?? null;
    },

    commit(plan, at) {
      return rls.execute(async (tx) => {
        // The newest snapshot, read again inside the transaction: a sync
        // that replaced it since the plan was made still gets the value.
        const [latest] = await tx
          .select({ id: linearSnapshots.id, payload: linearSnapshots.payload })
          .from(linearSnapshots)
          .where(eq(linearSnapshots.connectionId, plan.connectionId))
          .orderBy(desc(linearSnapshots.fetchedAt))
          .limit(1)
          .for("update");
        const parsed = linearSnapshotPayload.safeParse(latest?.payload);
        if (latest && parsed.success) {
          await tx
            .update(linearSnapshots)
            .set({ payload: applyLinearWrite(parsed.data, plan) })
            .where(eq(linearSnapshots.id, latest.id));
        }
        if (plan.prevStateId !== undefined) {
          await tx
            .update(workItems)
            .set({ linearPrevStateId: plan.prevStateId, updatedAt: at })
            .where(eq(workItems.id, plan.workItemId));
        }
        const [row] = await tx
          .insert(linearWrites)
          .values({
            userId,
            workItemId: plan.workItemId,
            connectionId: plan.connectionId,
            issueId: plan.issueId,
            kind: plan.kind,
            payload: plan.payload,
            createdAt: at,
            updatedAt: at,
          })
          .returning(ROW);
        return rowOf(row!);
      });
    },

    async claim(id, at, before) {
      const [row] = await rls.execute((tx) =>
        tx
          .update(linearWrites)
          .set({ attempts: sql`${linearWrites.attempts} + 1`, updatedAt: at })
          .where(
            and(
              mine(id),
              eq(linearWrites.state, "pending"),
              before === undefined
                ? undefined
                : lt(linearWrites.updatedAt, before),
            ),
          )
          .returning(ROW),
      );
      return row ? rowOf(row) : null;
    },

    async settle(id, outcome, at) {
      const [row] = await rls.execute((tx) =>
        tx
          .update(linearWrites)
          .set({
            state: outcome.state,
            lastError: outcome.lastError,
            sentAt: outcome.state === "sent" ? at : null,
            updatedAt: at,
          })
          .where(mine(id))
          .returning(ROW),
      );
      return rowOf(row!);
    },

    requeue(id, at) {
      return rls.execute(async (tx) => {
        const [requeued] = await tx
          .update(linearWrites)
          .set({ state: "pending", updatedAt: at })
          .where(and(mine(id), eq(linearWrites.state, "failed")))
          .returning(ROW);
        if (requeued) return { row: rowOf(requeued), requeued: true };
        const [row] = await tx.select(ROW).from(linearWrites).where(mine(id));
        return row ? { row: rowOf(row), requeued: false } : null;
      });
    },

    async due(before) {
      const rows = await rls.execute((tx) =>
        tx
          .select({ id: linearWrites.id })
          .from(linearWrites)
          .where(
            and(
              eq(linearWrites.userId, userId),
              eq(linearWrites.state, "pending"),
              lt(linearWrites.updatedAt, before),
            ),
          )
          .orderBy(asc(linearWrites.createdAt), asc(linearWrites.id)),
      );
      return rows.map((row) => row.id);
    },
  };
}
