import { and, eq, isNull, ne } from "drizzle-orm";

import {
  dayItems,
  days,
  timerSessions,
  type RlsClient,
} from "@syn/db";
import { deriveItemState, dayModeFor } from "@syn/utils";

/**
 * The timer engine — official spec §5.4, §5.3, §5.5.
 *
 * THE SESSION ROW IS THE TRUTH. The client store publishes a ticking number
 * and is re-seeded from these rows on every refetch; it is a display, not a
 * record. Everything that decides whether a timer exists happens here.
 *
 * ONE RUNNING TIMER PER PERSON, OUTSIDE A MULTITASK GROUP. Two timers running
 * at once would make "time spent today" a number that could exceed the day,
 * and the product's whole claim is that its record is true. Inside a multitask
 * group the two things genuinely are happening at once, which is what the
 * group means, so the rule is scoped to `multitask_id` rather than dropped.
 *
 * STARTING IS IDEMPOTENT. Two devices starting the same item must produce one
 * session, not two — cross-cutting §6.4. The open session is found and
 * returned rather than a second being opened, so the elapsed time agrees on
 * both screens.
 *
 * STOP NEVER MARKS DONE, and done ends a running session. They are different
 * facts: stopping is "I am not doing this right now", finishing is "this
 * happened". Conflating them is how a person loses a record of a thing they
 * paused.
 */
export type StartTimerResult = {
  itemId: string;
  startedAt: Date;
  /** The timer this one displaced, for the swap toast. */
  stopped: { itemId: string; title: string } | null;
  /** Set when the late-start rule moved the item. */
  movedTo: Date | null;
};

export async function startTimer(
  rls: RlsClient,
  userId: string,
  itemId: string,
  context: { todayKey: string; now: Date },
): Promise<StartTimerResult> {
  return rls.execute((tx) => startTimerInTx(tx, userId, itemId, context));
}

/**
 * The same start, inside a caller's transaction — *Do now* (DYN-6) moves the
 * item, starts it, and re-lays its block in one commit.
 */
export async function startTimerInTx(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  itemId: string,
  context: { todayKey: string; now: Date },
): Promise<StartTimerResult> {
  {
    const [item] = await tx
      .select({
        id: dayItems.id,
        dayId: dayItems.dayId,
        multitaskId: dayItems.multitaskId,
        timeMode: dayItems.timeMode,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        originalScheduledStart: dayItems.originalScheduledStart,
        durationMin: dayItems.durationMin,
        doneAt: dayItems.doneAt,
        deferredAt: dayItems.deferredAt,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
      })
      .from(dayItems)
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (!item) throw new Error("no such item");

    // Already running: return the session that exists rather than opening a
    // second one. This is the two-device case, and the whole reason start is
    // idempotent.
    const [open] = await tx
      .select({ startedAt: timerSessions.startedAt })
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.dayItemId, item.id),
          eq(timerSessions.userId, userId),
          isNull(timerSessions.endedAt),
        ),
      )
      .limit(1);

    if (open) {
      return {
        itemId: item.id,
        startedAt: open.startedAt,
        stopped: null,
        movedTo: null,
      };
    }

    const stopped = await stopOthers(
      tx,
      userId,
      item.id,
      item.multitaskId,
      context.now,
    );

    const [day] = await tx
      .select({ date: days.date, closedAt: days.closedAt })
      .from(days)
      .where(eq(days.id, item.dayId))
      .limit(1);

    const dayKey = String(day?.date ?? context.todayKey);

    /*
     * THE LATE-START RULE (official spec §5.3): starting something whose time
     * has gone moves it to now and leaves a ghost behind.
     *
     * `original_scheduled_start` is NEVER touched — the database trigger
     * enforces that, and this relies on it rather than duplicating it. The
     * ghost the Schedule draws (USE-5) is exactly the gap between that column
     * and the new `scheduled_start`, and `isOffSchedule` reading true is what
     * makes the row say *moved* once it is done.
     */
    const state = deriveItemState(
      {
        assignmentState: item.assignmentState,
        completionState: item.completionState,
        timeMode: item.timeMode,
        scheduledStart: item.scheduledStart,
        scheduledEnd: item.scheduledEnd,
        originalScheduledStart: item.originalScheduledStart,
        doneAt: item.doneAt,
        deferredAt: item.deferredAt,
        hasRunningSession: false,
      },
      { closedAt: day?.closedAt ?? null, mode: dayModeFor(dayKey, context.todayKey) },
      context.now,
    );

    let movedTo: Date | null = null;

    if (state === "passed" && item.timeMode !== "unscheduled") {
      const duration = item.durationMin ?? 0;
      movedTo = context.now;
      await tx
        .update(dayItems)
        .set({
          scheduledStart: context.now,
          // A passed window becomes a block of its own duration at now, not
          // the remainder of a window that has already closed.
          scheduledEnd: new Date(context.now.getTime() + duration * 60_000),
          updatedAt: new Date(),
        })
        .where(eq(dayItems.id, item.id));
    }

    await tx.insert(timerSessions).values({
      userId,
      dayItemId: item.id,
      startedAt: context.now,
      source: "timer",
    });

    await tx
      .update(dayItems)
      .set({ completionState: "active", updatedAt: new Date() })
      .where(eq(dayItems.id, item.id));

    return { itemId: item.id, startedAt: context.now, stopped, movedTo };
  }
}

/**
 * End every other running session, unless it shares this item's multitask
 * group. Returns the one that was displaced, for the swap toast.
 */
async function stopOthers(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  itemId: string,
  multitaskId: string | null,
  now: Date,
): Promise<{ itemId: string; title: string } | null> {
  const running = await tx
    .select({
      sessionId: timerSessions.id,
      itemId: dayItems.id,
      title: dayItems.title,
      multitaskId: dayItems.multitaskId,
    })
    .from(timerSessions)
    .innerJoin(dayItems, eq(dayItems.id, timerSessions.dayItemId))
    .where(
      and(
        eq(timerSessions.userId, userId),
        isNull(timerSessions.endedAt),
        ne(timerSessions.dayItemId, itemId),
      ),
    );

  // Same non-null group means both things are genuinely happening at once.
  const toStop = running.filter(
    (row) =>
      multitaskId === null ||
      row.multitaskId === null ||
      row.multitaskId !== multitaskId,
  );

  let displaced: { itemId: string; title: string } | null = null;

  for (const row of toStop) {
    await tx
      .update(timerSessions)
      .set({ endedAt: now })
      .where(eq(timerSessions.id, row.sessionId));

    await tx
      .update(dayItems)
      .set({ completionState: "upcoming", updatedAt: new Date() })
      .where(and(eq(dayItems.id, row.itemId), isNull(dayItems.doneAt)));

    displaced = { itemId: row.itemId, title: row.title };
  }

  return displaced;
}

/**
 * End the open session.
 *
 * A DONE ITEM STAYS DONE. `completion_state` returns to `upcoming` only when
 * `done_at` is null — stopping a timer on something already finished must not
 * un-finish it.
 */
export async function stopTimer(
  rls: RlsClient,
  userId: string,
  itemId: string,
  now: Date,
): Promise<{ itemId: string; endedAt: Date | null }> {
  return rls.execute(async (tx) => {
    const ended = await tx
      .update(timerSessions)
      .set({ endedAt: now })
      .where(
        and(
          eq(timerSessions.dayItemId, itemId),
          eq(timerSessions.userId, userId),
          isNull(timerSessions.endedAt),
        ),
      )
      .returning({ id: timerSessions.id });

    await tx
      .update(dayItems)
      .set({ completionState: "upcoming", updatedAt: new Date() })
      .where(
        and(
          eq(dayItems.id, itemId),
          eq(dayItems.userId, userId),
          isNull(dayItems.doneAt),
        ),
      );

    return { itemId, endedAt: ended.length > 0 ? now : null };
  });
}
