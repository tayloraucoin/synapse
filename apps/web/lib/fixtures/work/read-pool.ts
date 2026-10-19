import type { PoolRecords } from "@/lib/data/pool-records";
import type { FixtureRecords } from "../records";

/**
 * The pool read (USE-55): what the work router will return. The pool is the
 * work neither done nor archived (D-USE-31), each with its sessions.
 */
export function readPool(records: FixtureRecords): PoolRecords {
  const workItems = records.workItems.filter(
    (item) => item.doneAt === null && item.archivedAt === null,
  );
  const ids = new Set(workItems.map((item) => item.id));
  // A copy, so a caller holding a read never sees a later write change it.
  return structuredClone({
    clientsEnabled: records.clientsEnabled,
    clients: records.clients
      .filter((client) => client.archivedAt === null)
      .sort((a, b) => a.sortOrder - b.sortOrder),
    workItems,
    slots: records.slots.filter(
      (slot) =>
        slot.workItemId !== null && ids.has(slot.workItemId) && !slot.skipped,
    ),
  });
}
