import { and, eq, inArray } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";
import { computeTrim, type TrimItem, type TrimResult } from "@syn/utils";

/**
 * *I have less time today* — official spec §5.8, §0.3 R1.
 *
 * IT WRITES `assignment_state`, AND NOTHING ELSE ABOUT THE ITEM. A trimmed row
 * keeps its title, its priority, and above all its TIMES, so *Bring back*
 * (USE-2) returns it to the slot it came from rather than to the end of the
 * day. It gets no `misses` row, and the resolver never sees it — a trim is a
 * plan being reduced, not a promise being broken.
 *
 * A SECOND TRIM REPLACES THE FIRST. `days.capacity_min` holds one number, and
 * the items that fit under the new one come back in the same transaction that
 * sets aside the ones that no longer fit. Two trims must not compound into a
 * day nobody planned.
 *
 * THE SERVER RECOMPUTES. The sheet previews with the same pure function over
 * its cached day, and this runs it again over the rows as they are — the same
 * discipline USE-6's shift uses, for the same reason.
 */

export type ApplyTrimInput = {
  date: string;
  capacityMin: number;
  /** *Keep instead* — ids the person pulled back out of the trim. */
  keep: string[];
};

function toTrimItem(row: {
  id: string;
  priority: number;
  durationMin: number | null;
  scheduledStart: Date | null;
  scheduling: "hard" | "soft";
  assignmentState: string;
  completionState: string;
}): TrimItem {
  return {
    id: row.id,
    priority: row.priority,
    durationMin: row.durationMin,
    scheduledStart: row.scheduledStart,
    scheduling: row.scheduling,
    assignmentState: row.assignmentState,
    // Done and running minutes are spent — counted, never given back.
    spent: row.completionState === "done" || row.completionState === "active",
  };
}

async function readTrimRows(
  rls: RlsClient,
  userId: string,
  dateKey: string,
): Promise<{ dayId: string; closedAt: Date | null; items: TrimItem[] } | null> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);

    if (!day) return null;

    const rows = await tx
      .select({
        id: dayItems.id,
        priority: dayItems.priority,
        durationMin: dayItems.durationMin,
        scheduledStart: dayItems.scheduledStart,
        scheduling: dayItems.scheduling,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
      })
      .from(dayItems)
      .where(and(eq(dayItems.dayId, day.id), eq(dayItems.userId, userId)));

    return {
      dayId: day.id,
      closedAt: day.closedAt,
      items: rows.map(toTrimItem),
    };
  });
}

/** The same answer the sheet computes locally — for the future mobile client. */
export async function previewTrim(
  rls: RlsClient,
  userId: string,
  input: ApplyTrimInput,
): Promise<TrimResult | null> {
  const context = await readTrimRows(rls, userId, input.date);
  if (context === null) return null;
  return computeTrim(context.items, input.capacityMin, new Set(input.keep));
}

export async function applyTrim(
  rls: RlsClient,
  userId: string,
  input: ApplyTrimInput,
  now: Date = new Date(),
): Promise<TrimResult> {
  const context = await readTrimRows(rls, userId, input.date);
  if (context === null) throw new Error("no such day");
  if (context.closedAt !== null) throw new Error("day is closed");

  const result = computeTrim(
    context.items,
    input.capacityMin,
    new Set(input.keep),
  );

  await rls.execute(async (tx) => {
    await tx
      .update(days)
      .set({ capacityMin: input.capacityMin, updatedAt: now })
      .where(eq(days.id, context.dayId));

    if (result.trimmedIds.length > 0) {
      await tx
        .update(dayItems)
        .set({ assignmentState: "not_assigned", updatedAt: now })
        .where(
          and(
            eq(dayItems.userId, userId),
            inArray(dayItems.id, result.trimmedIds),
          ),
        );
    }

    if (result.comeBackIds.length > 0) {
      await tx
        .update(dayItems)
        .set({ assignmentState: "assigned", updatedAt: now })
        .where(
          and(
            eq(dayItems.userId, userId),
            inArray(dayItems.id, result.comeBackIds),
          ),
        );
    }
  });

  return result;
}
