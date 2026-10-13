import { and, eq, inArray, isNull } from "drizzle-orm";

import { dayItems, days, timerSessions, type RlsClient } from "@syn/db";
import { dayWindow } from "@syn/utils";

/**
 * Closing a day — automatically at its boundary, or when a person finishes
 * their review.
 *
 * AUTO-CLOSE NEVER MARKS ANYTHING MISSED (official spec §7.2). Undone items
 * become `pending_review`, which means "nobody has said what happened to this
 * yet" — and the Day Review is where a person says. A clock is not a verdict,
 * and a product that decided one for you overnight would be exactly the kind
 * of scold this one refuses to be.
 *
 * A RUNNING TIMER IS ENDED AT THE BOUNDARY, not at "now": the session belongs
 * to the day it started in, and a timer left running overnight should record
 * the day's worth of work rather than sixteen hours of it.
 */

export type CloseDayResult = {
  closed: boolean;
  pendingCount: number;
};

export async function closeDay(
  rls: RlsClient,
  userId: string,
  input: {
    dateKey: string;
    reason: "auto" | "manual";
    timeZone: string;
    dayCloseTime: string;
    /** Defaults to the day's own window end, which is what auto-close wants. */
    closedAt?: Date;
  },
): Promise<CloseDayResult> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, input.dateKey)))
      .limit(1);

    if (!day || day.closedAt !== null) {
      return { closed: false, pendingCount: 0 };
    }

    const window = dayWindow(input.dateKey, input.timeZone, input.dayCloseTime);
    const closedAt = input.closedAt ?? window.end;

    await tx
      .update(days)
      .set({ closedAt, closeReason: input.reason, updatedAt: new Date() })
      .where(eq(days.id, day.id));

    // Undone and still assigned → pending review. Trimmed and cut items are
    // untouched: they were already resolved, and neither is a failure.
    const pending = await tx
      .update(dayItems)
      .set({ completionState: "pending_review", updatedAt: new Date() })
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(dayItems.userId, userId),
          eq(dayItems.assignmentState, "assigned"),
          inArray(dayItems.completionState, ["upcoming", "active"]),
        ),
      )
      .returning({ id: dayItems.id });

    // Any session still running is closed at the boundary.
    const running = await tx
      .select({ id: timerSessions.id })
      .from(timerSessions)
      .innerJoin(dayItems, eq(dayItems.id, timerSessions.dayItemId))
      .where(
        and(
          eq(dayItems.dayId, day.id),
          eq(timerSessions.userId, userId),
          isNull(timerSessions.endedAt),
        ),
      );

    if (running.length > 0) {
      await tx
        .update(timerSessions)
        .set({ endedAt: closedAt, updatedAt: new Date() })
        .where(
          inArray(
            timerSessions.id,
            running.map((row) => row.id),
          ),
        );
    }

    return { closed: true, pendingCount: pending.length };
  });
}
