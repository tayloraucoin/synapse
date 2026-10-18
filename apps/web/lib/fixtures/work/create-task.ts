import { occursOn, parseRule } from "@syn/utils";
import {
  createTaskInput,
  placeSlotInput,
  slotRecord,
  workItemInput,
  workItemRecord,
  type BlockRecord,
  type CreateTaskInput,
} from "@syn/validators";
import { parse, PlannerRefusal } from "../planner";
import type { Journal } from "../planner/journal";
import type { FixtureRecords } from "../records";

/**
 * New task's write (USE-51; add/states/new-task.md, D-USE-54, D-USE-57): the
 * work item through `workItemInput`, then one slot a picked day through
 * `placeSlotInput`, each in that day's Work block with the tier, all in one
 * journal so one Undo takes back the item and every session. Two days are
 * sessions of ONE item, never copies. No days leaves it in the pool, and no
 * Linear field is set: a Synapse-only task never reaches Linear.
 */

// The input's schema is `@syn/validators`' (USE-98), the work router's too.
export { createTaskInput, type CreateTaskInput };

export const NO_WORK_BLOCK = "That day has no Work block.";
export const ONE_SESSION_A_DAY = "Pick each day once.";

export function runsOn(block: BlockRecord, dateKey: string): boolean {
  if (block.rrule === null) return block.onDate === dateKey;
  const parsed = parseRule(block.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

export function writeTask(
  journal: Journal,
  records: FixtureRecords,
  raw: CreateTaskInput,
  at: string,
): { id: string } {
  const input = parse(createTaskInput, raw);
  const item = parse(workItemInput, input.item);
  const dates = input.days.map((day) => day.dateKey);
  if (new Set(dates).size !== dates.length) {
    throw new PlannerRefusal("invalid", ONE_SESSION_A_DAY);
  }
  if (
    item.clientId != null &&
    !records.clients.some((c) => c.id === item.clientId)
  ) {
    throw new PlannerRefusal("unknown", "No client with that id.");
  }
  const stamps = () => ({
    id: crypto.randomUUID(),
    createdAt: at,
    updatedAt: at,
  });

  const row = journal.put(
    "workItems",
    workItemRecord.parse({
      ...stamps(),
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
      // Synapse-only (D-USE-57): nothing links it to Linear.
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
    }),
  );

  for (const { dateKey, blockId } of input.days) {
    const block = records.blocks.find((b) => b.id === blockId);
    if (!block) throw new PlannerRefusal("unknown", "No block with that id.");
    if (block.kind !== "work" || !runsOn(block, dateKey)) {
      throw new PlannerRefusal("not-on-date", NO_WORK_BLOCK);
    }
    // After the block's last slot on the date.
    const last = records.slots
      .filter((s) => s.blockId === blockId && s.onDate === dateKey)
      .reduce((top, s) => Math.max(top, s.sortOrder), -1);
    const slot = parse(placeSlotInput, {
      blockId,
      onDate: dateKey,
      sortOrder: last + 1,
      workItemId: row.id,
      tier: input.tier,
    });
    journal.put(
      "slots",
      slotRecord.parse({
        ...stamps(),
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
