import { and, eq, isNull, ne, sql } from "drizzle-orm";

import {
  dayItems,
  days,
  timerSessions,
  type RlsClient,
} from "@syn/db";
import { dayWindow } from "@syn/utils";

/**
 * IT-02 — time added by hand, and the sessions already recorded.
 *
 * MANUAL ENTRY IS ALWAYS AVAILABLE (official spec §5.4). A person who forgot
 * to start the timer did the thing anyway, and a record that can only be
 * written by remembering to press a button in advance is a record that
 * systematically undercounts the days somebody was busy.
 *
 * SESSIONS ON ONE ITEM NEVER OVERLAP. Two overlapping sessions would make
 * "time spent" double-count a single stretch, and the number would exceed the
 * day it came from. Sessions on DIFFERENT items may overlap freely — that is
 * what multitasking is, and the document says so.
 *
 * THE `source` SURVIVES AN EDIT. A timed session corrected by five minutes is
 * still a timed session; overwriting it to `manual` would erase the
 * distinction on the one row where it mattered.
 *
 * NOTHING IS RECORDED IN THE FUTURE. An `ended_at` after now would be time
 * spent on something that has not happened, which is the one shape a record of
 * the past cannot take.
 */
export class SessionOverlapError extends Error {
  constructor() {
    super("session_overlap");
    this.name = "SessionOverlapError";
  }
}

export class SessionRangeError extends Error {
  readonly reason: "order" | "future" | "outside_day";
  constructor(reason: "order" | "future" | "outside_day") {
    super(reason);
    this.name = "SessionRangeError";
    this.reason = reason;
  }
}

type SessionInput = {
  startedAt: Date;
  endedAt: Date;
};

/**
 * Every rule a range must satisfy, in one place so the add and the edit paths
 * cannot diverge.
 */
async function validateRange(
  rls: RlsClient,
  userId: string,
  itemId: string,
  input: SessionInput,
  excludeSessionId: string | null,
  now: Date,
): Promise<void> {
  if (input.endedAt.getTime() <= input.startedAt.getTime()) {
    throw new SessionRangeError("order");
  }
  if (input.endedAt.getTime() > now.getTime()) {
    throw new SessionRangeError("future");
  }

  const bounds = await rls.execute(async (tx) => {
    const rows = await tx
      .select({
        date: days.date,
        timezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  });

  if (!bounds) throw new Error("no such item");

  // The day's own window, in the day's own zone — a session belongs to the day
  // it is filed under, not to the calendar date the server is having.
  const window = dayWindow(
    String(bounds.date),
    bounds.timezone,
    bounds.dayCloseTime,
  );

  if (
    input.startedAt.getTime() < window.start.getTime() ||
    input.endedAt.getTime() > window.end.getTime()
  ) {
    throw new SessionRangeError("outside_day");
  }

  /*
   * The overlap test, as one query.
   *
   * `COALESCE(ended_at, now())` is what makes a RUNNING session count: a
   * manual entry that reaches into the stretch a timer is currently recording
   * would double-count the moment it stops.
   */
  const clash = await rls.execute((tx) =>
    tx
      .select({ id: timerSessions.id })
      .from(timerSessions)
      .where(
        and(
          eq(timerSessions.dayItemId, itemId),
          eq(timerSessions.userId, userId),
          excludeSessionId === null
            ? sql`true`
            : ne(timerSessions.id, excludeSessionId),
          sql`tstzrange(${timerSessions.startedAt}, COALESCE(${timerSessions.endedAt}, now())) && tstzrange(${input.startedAt}, ${input.endedAt})`,
        ),
      )
      .limit(1),
  );

  if (clash.length > 0) throw new SessionOverlapError();
}

export async function addManualSession(
  rls: RlsClient,
  userId: string,
  input: { itemId: string } & SessionInput,
  now: Date = new Date(),
): Promise<{ id: string }> {
  await validateRange(rls, userId, input.itemId, input, null, now);

  const rows = await rls.execute((tx) =>
    tx
      .insert(timerSessions)
      .values({
        userId,
        dayItemId: input.itemId,
        startedAt: input.startedAt,
        endedAt: input.endedAt,
        source: "manual",
      })
      .returning({ id: timerSessions.id }),
  );

  const row = rows[0];
  if (!row) throw new Error("session insert returned no row");

  await stampIfReviewed(rls, userId, input.itemId, now);
  return row;
}

export async function updateSession(
  rls: RlsClient,
  userId: string,
  input: { id: string } & SessionInput,
  now: Date = new Date(),
): Promise<{ id: string }> {
  const [existing] = await rls.execute((tx) =>
    tx
      .select({ dayItemId: timerSessions.dayItemId })
      .from(timerSessions)
      .where(
        and(eq(timerSessions.id, input.id), eq(timerSessions.userId, userId)),
      )
      .limit(1),
  );

  if (!existing) throw new Error("no such session");

  await validateRange(
    rls,
    userId,
    existing.dayItemId,
    input,
    input.id,
    now,
  );

  await rls.execute((tx) =>
    tx
      .update(timerSessions)
      // `source` is deliberately absent: an edited timer session is still one.
      .set({ startedAt: input.startedAt, endedAt: input.endedAt })
      .where(eq(timerSessions.id, input.id)),
  );

  await stampIfReviewed(rls, userId, existing.dayItemId, now);
  return { id: input.id };
}

/** Returns the row so the five-second undo can put it back verbatim. */
export async function removeSession(
  rls: RlsClient,
  userId: string,
  sessionId: string,
): Promise<typeof timerSessions.$inferSelect | null> {
  return rls.execute(async (tx) => {
    const rows = await tx
      .delete(timerSessions)
      .where(
        and(eq(timerSessions.id, sessionId), eq(timerSessions.userId, userId)),
      )
      .returning();
    return rows[0] ?? null;
  });
}

/**
 * Put a removed session back, with its original id.
 *
 * THE SAME ID MATTERS. Anything holding a reference to it — an open sheet, a
 * pending edit — still resolves after an undo, so a person who removes and
 * restores within five seconds ends where they started rather than somewhere
 * that merely looks the same.
 */
export async function restoreSession(
  rls: RlsClient,
  userId: string,
  payload: typeof timerSessions.$inferSelect,
): Promise<{ id: string } | null> {
  const rows = await rls.execute((tx) =>
    tx
      .insert(timerSessions)
      // `userId` re-asserted rather than trusted from a payload that has been
      // through a browser.
      .values({ ...payload, userId })
      .onConflictDoNothing()
      .returning({ id: timerSessions.id }),
  );
  return rows[0] ?? null;
}

/* ------------------------------------------------------ pause and resume -- */

/**
 * Pause ends the open session; resume opens a new one — official spec §5.4,
 * "each segment a `timer_session`".
 *
 * `completion_state` STAYS `active` THROUGH A PAUSE. A paused item is still
 * the thing being worked on; returning it to `upcoming` would make the row
 * forget, and the difference between paused and stopped is exactly whether the
 * person is coming back.
 */
export async function pauseTimer(
  rls: RlsClient,
  userId: string,
  itemId: string,
  now: Date = new Date(),
): Promise<{ paused: boolean }> {
  const ended = await rls.execute((tx) =>
    tx
      .update(timerSessions)
      .set({ endedAt: now })
      .where(
        and(
          eq(timerSessions.dayItemId, itemId),
          eq(timerSessions.userId, userId),
          isNull(timerSessions.endedAt),
        ),
      )
      .returning({ id: timerSessions.id }),
  );

  // The state is untouched on purpose — see above.
  return { paused: ended.length > 0 };
}

export async function resumeTimer(
  rls: RlsClient,
  userId: string,
  itemId: string,
  now: Date = new Date(),
): Promise<{ startedAt: Date }> {
  await rls.execute((tx) =>
    tx.insert(timerSessions).values({
      userId,
      dayItemId: itemId,
      startedAt: now,
      source: "timer",
    }),
  );

  await rls.execute((tx) =>
    tx
      .update(dayItems)
      .set({ completionState: "active", updatedAt: now })
      .where(
        and(
          eq(dayItems.id, itemId),
          eq(dayItems.userId, userId),
          isNull(dayItems.doneAt),
        ),
      ),
  );

  return { startedAt: now };
}

/** An edit to a REVIEWED day is a record edit and says so (§8.2). */
async function stampIfReviewed(
  rls: RlsClient,
  userId: string,
  itemId: string,
  at: Date,
): Promise<void> {
  await rls.execute(async (tx) => {
    const [row] = await tx
      .select({ dayId: days.id, reviewedAt: days.reviewedAt })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(and(eq(dayItems.id, itemId), eq(dayItems.userId, userId)))
      .limit(1);

    if (row?.reviewedAt == null) return;

    await tx
      .update(days)
      .set({ reviewEditedAt: at, updatedAt: at })
      .where(eq(days.id, row.dayId));
  });
}
