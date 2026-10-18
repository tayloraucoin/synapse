import type { RlsClient } from "@syn/db";
import type { PlannerWriteOutput } from "@syn/validators";
import {
  RowJournal,
  systemClock,
  type WriteClock,
} from "../planner/write-journal";
import { applyChanges } from "../planner/write-rows";
import { rowStore } from "../undo/row-store";
import { recordUndo, undoChangesOf } from "../undo/undo";
import { selectWorkRows, type WorkJournal, type WorkScope } from "./work-rows";

/**
 * One work item write (USE-98), plan then apply, as the planner's writes run
 * (`runPlannerWrite`): the caller's rows read, the pure plan made through the
 * journal, its changes written and the token that undoes exactly them
 * signed, all in one `rls.execute` transaction. A refusal anywhere rolls the
 * whole write back. It hands back `{ undo, id? }`, the fixture's
 * `PlannerWrite`; `planner.undo` takes the token back.
 */

export interface WorkWritePlan {
  scope: WorkScope;
  plan: (journal: WorkJournal) => { id?: string };
}

export function runWorkWrite(
  rls: RlsClient,
  userId: string,
  { scope, plan }: WorkWritePlan,
  clock: WriteClock = systemClock,
): Promise<PlannerWriteOutput> {
  return rls.execute(async (tx) => {
    const rows = await selectWorkRows(tx, userId, scope);
    const journal: WorkJournal = new RowJournal(rows, clock);
    const out = plan(journal);
    const changes = journal.changes();
    await applyChanges(rowStore(tx, userId), changes);
    const result: PlannerWriteOutput = {
      undo: recordUndo(undoChangesOf(changes), userId),
    };
    if (out.id !== undefined) result.id = out.id;
    return result;
  });
}
