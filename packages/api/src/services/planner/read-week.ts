import type { RlsClient } from "@syn/db";
import type { WeekReadOutput } from "@syn/validators";
import { selectPlannerRows } from "./select-rows";
import { assembleWeek, datesOf } from "./week-assembly";

/**
 * `planner.week` (USE-91): the seven dates' rows (none for the usual week)
 * inside RLS, then the pure assembly. One read, never one per day.
 */
export async function readWeekRecords(
  rls: RlsClient,
  userId: string,
  week: string,
): Promise<WeekReadOutput> {
  const rows = await rls.execute((tx) =>
    selectPlannerRows(tx, userId, datesOf(week)),
  );
  return assembleWeek(rows, week);
}
