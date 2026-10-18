import { and, asc, eq, inArray, isNotNull, or } from "drizzle-orm";
import {
  blocks,
  clients,
  slots,
  users,
  workItems,
  type RlsClient,
} from "@syn/db";
import {
  blockRecord,
  clientRecord,
  slotRecord,
  workItemRecord,
  type BlockRecord,
  type ClientRecord,
  type SlotRecord,
  type WorkItemRecord,
} from "@syn/validators";
import { recordsOf } from "../planner/row-records";
import { RowJournal } from "../planner/write-journal";

/**
 * The work pool's rows (USE-98), as records: what the pool read assembles
 * from and what an item write plans over. Runs only inside `rls.execute`
 * (its `tx`), so every row is the caller's; each select names the caller
 * beside the policies too.
 *
 * WHAT IS READ. Work items, clients and blocks whole (one person's few
 * hundred rows). Slots, which grow with every date: for the pool, the work
 * sessions; for a write, the named items' sessions and the named blocks'
 * slots, since a plan reads nothing else of them.
 */

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export interface WorkRows {
  blocks: BlockRecord[];
  clients: ClientRecord[];
  workItems: WorkItemRecord[];
  slots: SlotRecord[];
}

/** The two tables an item write changes. */
export type WorkTable = "workItems" | "slots";

export type WorkJournal = RowJournal<WorkRows, WorkTable>;

export interface PoolRows extends Omit<WorkRows, "blocks"> {
  clientsEnabled: boolean;
}

export async function selectPoolRows(
  tx: Tx,
  userId: string,
): Promise<PoolRows> {
  const [account] = await tx
    .select({ clientsEnabled: users.clientsEnabled })
    .from(users)
    .where(eq(users.id, userId));
  if (!account) throw new Error("No account row.");
  return {
    clientsEnabled: account.clientsEnabled,
    clients: recordsOf(
      clientRecord,
      await tx
        .select()
        .from(clients)
        .where(eq(clients.userId, userId))
        .orderBy(asc(clients.sortOrder), asc(clients.id)),
    ),
    workItems: recordsOf(
      workItemRecord,
      await tx
        .select()
        .from(workItems)
        .where(eq(workItems.userId, userId))
        .orderBy(asc(workItems.createdAt), asc(workItems.id)),
    ),
    slots: recordsOf(
      slotRecord,
      await tx
        .select()
        .from(slots)
        .where(and(eq(slots.userId, userId), isNotNull(slots.workItemId)))
        .orderBy(asc(slots.onDate), asc(slots.sortOrder), asc(slots.id)),
    ),
  };
}

/** What a write names: the items whose sessions, the blocks whose slots. */
export interface WorkScope {
  workItemIds: readonly string[];
  blockIds?: readonly string[];
}

export async function selectWorkRows(
  tx: Tx,
  userId: string,
  { workItemIds, blockIds = [] }: WorkScope,
): Promise<WorkRows> {
  const items = [...new Set(workItemIds)];
  const blockList = [...new Set(blockIds)];
  const reach = [
    ...(items.length === 0 ? [] : [inArray(slots.workItemId, items)]),
    ...(blockList.length === 0 ? [] : [inArray(slots.blockId, blockList)]),
  ];
  return {
    blocks: recordsOf(
      blockRecord,
      await tx.select().from(blocks).where(eq(blocks.userId, userId)),
    ),
    clients: recordsOf(
      clientRecord,
      await tx.select().from(clients).where(eq(clients.userId, userId)),
    ),
    workItems: recordsOf(
      workItemRecord,
      await tx
        .select()
        .from(workItems)
        .where(eq(workItems.userId, userId))
        .orderBy(asc(workItems.createdAt), asc(workItems.id)),
    ),
    slots:
      reach.length === 0
        ? []
        : recordsOf(
            slotRecord,
            await tx
              .select()
              .from(slots)
              .where(and(eq(slots.userId, userId), or(...reach)))
              .orderBy(asc(slots.onDate), asc(slots.sortOrder), asc(slots.id)),
          ),
  };
}
