import { and, eq, isNull } from "drizzle-orm";

import { workflowDayPins, workflowGroups, type RlsClient } from "@syn/db";
import type { WorkflowIdInput } from "@syn/validators";

import type { Tx } from "./cells";
import { readWorkflowDay } from "./day-context";
import { found } from "./rule-error";

async function readPins(tx: Tx, userId: string, dayKey: string): Promise<string[]> {
  const [row] = await tx
    .select({ groupIds: workflowDayPins.groupIds })
    .from(workflowDayPins)
    .where(and(eq(workflowDayPins.userId, userId), eq(workflowDayPins.dayKey, dayKey)))
    .limit(1);
  return row?.groupIds ?? [];
}

async function writePins(
  tx: Tx,
  userId: string,
  dayKey: string,
  groupIds: string[],
  now: Date,
): Promise<void> {
  await tx
    .insert(workflowDayPins)
    .values({ userId, dayKey, groupIds })
    .onConflictDoUpdate({
      target: [workflowDayPins.userId, workflowDayPins.dayKey],
      set: { groupIds, updatedAt: now },
    });
}

/**
 * *First today* (W9, UX §3.5, TD-37) — the group goes first for the person's
 * current day: newest pin first, an earlier pin of the same group removed.
 * The row is keyed by today's day key, so at the day close it is simply not
 * read again; nothing runs. Returns today's pins.
 */
export async function pinWorkflowGroupToday(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<string[]> {
  return rls.execute(async (tx) => {
    found(
      (
        await tx
          .select({ id: workflowGroups.id })
          .from(workflowGroups)
          .where(
            and(
              eq(workflowGroups.id, input.id),
              eq(workflowGroups.userId, userId),
              isNull(workflowGroups.archivedAt),
            ),
          )
          .limit(1)
      )[0],
    );
    const { dayKey } = await readWorkflowDay(tx, userId, now);
    const pins = [input.id, ...(await readPins(tx, userId, dayKey)).filter((id) => id !== input.id)];
    await writePins(tx, userId, dayKey, pins, now);
    return pins;
  });
}

/** *Back to usual order* — one pin removed for today. Returns today's pins. */
export async function unpinWorkflowGroupToday(
  rls: RlsClient,
  userId: string,
  input: WorkflowIdInput,
  now: Date = new Date(),
): Promise<string[]> {
  return rls.execute(async (tx) => {
    found(
      (
        await tx
          .select({ id: workflowGroups.id })
          .from(workflowGroups)
          .where(and(eq(workflowGroups.id, input.id), eq(workflowGroups.userId, userId)))
          .limit(1)
      )[0],
    );
    const { dayKey } = await readWorkflowDay(tx, userId, now);
    const before = await readPins(tx, userId, dayKey);
    const pins = before.filter((id) => id !== input.id);
    if (pins.length !== before.length) await writePins(tx, userId, dayKey, pins, now);
    return pins;
  });
}
