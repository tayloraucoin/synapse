import { eq } from "drizzle-orm";

import { users } from "@syn/db";
import { dayWindow, resolveDayKey } from "@syn/utils";

import { found } from "./rule-error";
import type { Tx } from "./cells";

/**
 * The person's current day for Workflow — TD-37, UX §3.5, §3.8.
 *
 * *First today* and *closed today* both mean the person's day, which opens at
 * their `day_close_time` in their zone, as every other "today" in the product
 * does (§13 #W14). `now` is passed in, never read twice, so one request agrees
 * with itself across the day close.
 */
export type WorkflowDay = { dayKey: string; start: Date; end: Date };

export async function readWorkflowDay(tx: Tx, userId: string, now: Date): Promise<WorkflowDay> {
  const row = found(
    (
      await tx
        .select({ timezone: users.timezone, dayCloseTime: users.dayCloseTime })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
    )[0],
  );
  const dayKey = resolveDayKey(now, row.timezone, row.dayCloseTime);
  const { start, end } = dayWindow(dayKey, row.timezone, row.dayCloseTime);
  return { dayKey, start, end };
}
