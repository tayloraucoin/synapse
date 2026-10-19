import {
  placeSlotInput,
  slotRecord,
  workItemInput,
  workItemRecord,
  type CreateTaskInput,
  type EditWorkItemInput,
  type SlotRecord,
  type WorkItemIdInput,
  type WorkItemRecord,
} from "@syn/validators";
import { refuse } from "../../errors";
import { blockOn, parseOrRefuse, patch } from "../planner/write-plan";
import type { WorkJournal } from "./work-rows";

/**
 * The work items' writes (USE-98), each a pure plan over the caller's rows
 * made through the journal, ported from the fixture server's
 * (`lib/fixtures/work/index.ts`, `create-task.ts`) with the same refusal
 * reasons and words. `runWorkWrite` applies them in one transaction with
 * their Undo. Nothing here writes to Linear: a linked item's Linear side is
 * the outbox's (USE-102), and `done_source` is only ever `synapse` here.
 *
 * D-USE-57 and D-USE-65: the task is done when Taylor marks it so, and every
 * open session closes with it, on the one stamp; a session's own Done is
 * the slot's `done_at` and never marks the task.
 */

export const NO_WORK_BLOCK = "That day has no Work block.";
export const ONE_SESSION_A_DAY = "Pick each day once.";

/** An archived item has left Synapse: no write reaches it. */
export function findWorkItem(journal: WorkJournal, id: string): WorkItemRecord {
  const item = journal.rows.workItems.find(
    (row) => row.id === id && row.archivedAt === null,
  );
  if (!item) throw refuse("unknown", "No work item with that id.");
  return item;
}

function requireClient(
  journal: WorkJournal,
  clientId: string | null | undefined,
) {
  if (
    clientId != null &&
    !journal.rows.clients.some((client) => client.id === clientId)
  ) {
    throw refuse("unknown", "No client with that id.");
  }
}

function openSessions(journal: WorkJournal, workItemId: string): SlotRecord[] {
  return journal.rows.slots.filter(
    (slot) => slot.workItemId === workItemId && slot.doneAt === null,
  );
}

/**
 * New task (USE-51): the item, then one slot a picked day in that day's Work
 * block, after its last slot on the date. Two days are sessions of one item;
 * no days leaves it in the pool. Nothing links it to Linear.
 */
export function planCreateTask(
  journal: WorkJournal,
  input: CreateTaskInput,
): { id: string } {
  const item = parseOrRefuse(workItemInput, input.item);
  const dates = input.days.map((day) => day.dateKey);
  if (new Set(dates).size !== dates.length) {
    throw refuse("invalid", ONE_SESSION_A_DAY);
  }
  requireClient(journal, item.clientId);

  const row = journal.put(
    "workItems",
    workItemRecord.parse({
      ...journal.stamps(),
      title: item.title,
      notes: item.notes ?? null,
      icon: item.icon ?? null,
      size: item.size ?? null,
      lengthMinMin: item.lengthMinMin ?? null,
      lengthMaxMin: item.lengthMaxMin ?? null,
      dueOn: item.dueOn ?? null,
      clientId: item.clientId ?? null,
      parentWorkItemId: item.parentWorkItemId ?? null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
    }),
  );

  for (const { dateKey, blockId } of input.days) {
    const block = journal.rows.blocks.find((b) => b.id === blockId);
    if (!block) throw refuse("unknown", "No block with that id.");
    if (block.kind !== "work" || !blockOn(block, dateKey)) {
      throw refuse("not-on-date", NO_WORK_BLOCK);
    }
    const last = journal.rows.slots
      .filter((s) => s.blockId === blockId && s.onDate === dateKey)
      .reduce((top, s) => Math.max(top, s.sortOrder), -1);
    const slot = parseOrRefuse(placeSlotInput, {
      blockId,
      onDate: dateKey,
      sortOrder: last + 1,
      workItemId: row.id,
      tier: input.tier,
    });
    journal.put(
      "slots",
      slotRecord.parse({
        ...journal.stamps(),
        blockId: slot.blockId,
        onDate: slot.onDate,
        skipped: false,
        sortOrder: slot.sortOrder,
        blockItemId: null,
        todoId: null,
        workItemId: row.id,
        tier: slot.tier ?? null,
        lengthMin: null,
        tookMin: null,
        doneAt: null,
      }),
    );
  }
  return { id: row.id };
}

/** The Item sheet's edit (USE-32): only the fields sent; a lone end checked against the other. */
export function planEditWorkItem(
  journal: WorkJournal,
  { id, ...change }: EditWorkItemInput,
): { id: string } {
  const item = findWorkItem(journal, id);
  requireClient(journal, change.clientId);
  if (change.parentWorkItemId != null) {
    if (change.parentWorkItemId === id) {
      throw refuse("invalid", "A task is not its own parent.");
    }
    findWorkItem(journal, change.parentWorkItemId);
  }
  const next = patch(item, { ...change, updatedAt: journal.stamp() });
  parseOrRefuse(workItemInput, next);
  journal.put("workItems", workItemRecord.parse(next));
  return { id };
}

/**
 * Mark the task done: the item, and every open session on the same stamp.
 * A sub-issue is its own item; the parent's Done leaves it, as the fixture.
 */
export function planMarkTaskDone(
  journal: WorkJournal,
  { workItemId }: WorkItemIdInput,
): { id: string } {
  const item = findWorkItem(journal, workItemId);
  if (item.doneAt !== null) {
    throw refuse("invalid", "That task is already done.");
  }
  const at = journal.stamp();
  journal.put(
    "workItems",
    workItemRecord.parse({
      ...item,
      doneAt: at,
      doneSource: "synapse",
      updatedAt: at,
    }),
  );
  for (const session of openSessions(journal, workItemId)) {
    journal.put(
      "slots",
      slotRecord.parse({ ...session, doneAt: at, updatedAt: at }),
    );
  }
  return { id: workItemId };
}

/**
 * Reopen (USE-63, D-USE-97): the task open again, and exactly the sessions
 * its Done closed, known by the one stamp Done wrote on them; a session done
 * on its own day before keeps its Done.
 */
export function planReopenTask(
  journal: WorkJournal,
  { workItemId }: WorkItemIdInput,
): { id: string } {
  const item = findWorkItem(journal, workItemId);
  if (item.doneAt === null) throw refuse("invalid", "That task is open.");
  const closedAt = item.doneAt;
  const at = journal.stamp();
  journal.put(
    "workItems",
    workItemRecord.parse({
      ...item,
      doneAt: null,
      doneSource: null,
      updatedAt: at,
    }),
  );
  for (const session of journal.rows.slots) {
    if (session.workItemId !== workItemId || session.doneAt !== closedAt) {
      continue;
    }
    journal.put(
      "slots",
      slotRecord.parse({ ...session, doneAt: null, updatedAt: at }),
    );
  }
  return { id: workItemId };
}

/** Back to the pool: off every day it was open on; a done session stays. */
export function planBackToPool(
  journal: WorkJournal,
  { workItemId }: WorkItemIdInput,
): { id: string } {
  findWorkItem(journal, workItemId);
  for (const session of openSessions(journal, workItemId)) {
    journal.remove("slots", session.id);
  }
  return { id: workItemId };
}

/** Remove from Synapse: archived, never deleted; its open sessions go. */
export function planRemoveFromSynapse(
  journal: WorkJournal,
  { workItemId }: WorkItemIdInput,
): { id: string } {
  const item = findWorkItem(journal, workItemId);
  const at = journal.stamp();
  journal.put(
    "workItems",
    workItemRecord.parse({ ...item, archivedAt: at, updatedAt: at }),
  );
  for (const session of openSessions(journal, workItemId)) {
    journal.remove("slots", session.id);
  }
  return { id: workItemId };
}
