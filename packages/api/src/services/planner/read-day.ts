import type { RlsClient } from "@syn/db";
import type { DayReadOutput } from "@syn/validators";
import { assembleDay } from "./day-assembly";
import { selectPlannerRows } from "./select-rows";

/** `planner.today` (USE-91): the date's rows inside RLS, then the pure assembly. */
export async function readDayRecords(
  rls: RlsClient,
  userId: string,
  dateKey: string,
): Promise<DayReadOutput> {
  const rows = await rls.execute((tx) =>
    selectPlannerRows(tx, userId, [dateKey]),
  );
  return assembleDay(rows, dateKey);
}
