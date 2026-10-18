import type { RlsClient } from "@syn/db";
import type { PoolReadOutput } from "@syn/validators";
import { selectPoolRows, type PoolRows } from "./work-rows";

/**
 * The pool read (USE-98), what the fixture server's `readPool` returns
 * (`lib/fixtures/work/read-pool.ts`), field for field: the work neither done
 * nor archived (D-USE-31), their sessions with skipped ones left out, the
 * clients not archived in Taylor's order (D-USE-96) and the Clients switch.
 * Without the Linear snapshot; USE-101 adds it.
 */
export function assemblePool(rows: PoolRows): PoolReadOutput {
  const workItems = rows.workItems.filter(
    (item) => item.doneAt === null && item.archivedAt === null,
  );
  const ids = new Set(workItems.map((item) => item.id));
  return {
    clientsEnabled: rows.clientsEnabled,
    clients: rows.clients
      .filter((client) => client.archivedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    workItems,
    slots: rows.slots.filter(
      (slot) =>
        slot.workItemId !== null && ids.has(slot.workItemId) && !slot.skipped,
    ),
  };
}

export function readPool(
  rls: RlsClient,
  userId: string,
): Promise<PoolReadOutput> {
  return rls.execute(async (tx) =>
    assemblePool(await selectPoolRows(tx, userId)),
  );
}
