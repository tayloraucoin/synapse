import type { RlsClient } from "@syn/db";
import type { PlannerWriteOutput, SlotRecord } from "@syn/validators";
import { rowStore } from "../undo/row-store";
import { recordUndo, undoChangesOf } from "../undo/undo";
import { systemClock, WriteJournal, type WriteClock } from "./write-journal";
import { reachOf, type PlanOut } from "./write-plan";
import {
  applyChanges,
  selectBaseRows,
  selectBlockRows,
  selectSlotRows,
  type BaseRows,
} from "./write-rows";
import type { SlotKeys } from "./write-slots";

/**
 * One planner write (USE-92), plan then apply, in one `rls.execute`: one
 * transaction, so a write that touches several rows lands whole or not at
 * all. The caller's rows are read, the pure plan makes its changes through
 * the journal, they are written, and the token that undoes exactly them is
 * signed. A refusal anywhere rolls the whole write back.
 *
 * Every write hands back `{ undo, id?, reach? }`, the fixture server's
 * `PlannerWrite`, so the hooks keep their shape.
 */

export interface PlannerWritePlan {
  /** The blocks whose changes and slots the plan reads. */
  blocks: (rows: BaseRows) => readonly string[];
  /** Slots beyond the blocks': a slot write's own and its target's (USE-94). */
  slots?: SlotKeys;
  plan: (journal: WriteJournal) => PlanOut;
}

/** A write's result; a slot write's carries the slot as stored. */
export type PlannerWriteResult = PlannerWriteOutput & { slot?: SlotRecord };

export function runPlannerWrite(
  rls: RlsClient,
  userId: string,
  { blocks, slots, plan }: PlannerWritePlan,
  clock: WriteClock = systemClock,
): Promise<PlannerWriteResult> {
  return rls.execute(async (tx) => {
    const base = await selectBaseRows(tx, userId);
    const rows = await selectBlockRows(tx, base, blocks(base));
    if (slots) rows.slots = await selectSlotRows(tx, rows.slots, slots);
    const journal = new WriteJournal(rows, clock);
    const out = plan(journal);
    const changes = journal.changes();
    await applyChanges(rowStore(tx, userId), changes);

    const result: PlannerWriteResult = {
      undo: recordUndo(undoChangesOf(changes), userId),
    };
    if (out.id !== undefined) result.id = out.id;
    if (out.slot) result.slot = out.slot;
    if (out.reach) {
      result.reach = reachOf(journal, out.reach.weekday, out.reach.changedOn);
    }
    return result;
  });
}

/** The block an item belongs to, when the caller holds the item. */
export function blockOfItem(rows: BaseRows, itemId: string): string[] {
  const item = rows.blockItems.find((i) => i.id === itemId);
  return item ? [item.blockId] : [];
}
