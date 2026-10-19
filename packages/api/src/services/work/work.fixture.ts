import { id } from "../planner/planner-rows.fixture";
import { RowJournal } from "../planner/write-journal";
import { NOW } from "../planner/write-plan.fixture";
import type { WorkJournal, WorkRows } from "./work-rows";

/** The work write tests' journal (USE-98): rows in memory, the planner tests' clock. */
export function workJournal(over: Partial<WorkRows> = {}): WorkJournal {
  return new RowJournal(
    { blocks: [], clients: [], workItems: [], slots: [], ...over },
    { now: () => NOW, newId: id },
  );
}
