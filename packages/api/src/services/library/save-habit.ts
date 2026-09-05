import { and, eq, isNull, notExists, sql } from "drizzle-orm";

import {
  dayItems,
  days,
  habits,
  timerSessions,
  users,
  type RlsClient,
} from "@syn/db";
import { toDateKey } from "@syn/utils";
import type { HabitFormInput } from "@syn/validators";

/**
 * Create and update one habit, plus the two things a save can move: the wake
 * anchor, and the snapshots on tomorrow's already-materialised items.
 */

export type SavedHabit = { id: string };

export async function createHabit(
  rls: RlsClient,
  userId: string,
  input: HabitFormInput,
): Promise<SavedHabit> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .insert(habits)
      .values({
        userId,
        title: input.title,
        type: input.type,
        icon: input.icon,
        categoryId: input.categoryId,
        durationMinMin: input.durationMinMin,
        durationMaxMin: input.durationMaxMin,
        lifePriority: input.lifePriority,
        quantityUnit: input.quantityUnit,
        reflectionAxes: input.reflectionAxes,
        defaultNotesPreflight: input.defaultNotesPreflight,
      })
      .returning({ id: habits.id });

    if (!row) throw new Error("habit insert returned no row");

    if (input.isWakeAnchor) {
      await setWakeAnchorIn(tx, userId, row.id);
    }

    return { id: row.id };
  });
}

export async function updateHabit(
  rls: RlsClient,
  userId: string,
  id: string,
  input: HabitFormInput,
  timeZone: string,
): Promise<SavedHabit | null> {
  return rls.execute(async (tx) => {
    const [existing] = await tx
      .select({ id: habits.id, title: habits.title, icon: habits.icon })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (!existing) return null;

    const [row] = await tx
      .update(habits)
      .set({
        title: input.title,
        type: input.type,
        icon: input.icon,
        categoryId: input.categoryId,
        durationMinMin: input.durationMinMin,
        durationMaxMin: input.durationMaxMin,
        lifePriority: input.lifePriority,
        quantityUnit: input.quantityUnit,
        reflectionAxes: input.reflectionAxes,
        defaultNotesPreflight: input.defaultNotesPreflight,
        updatedAt: new Date(),
      })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });

    if (!row) return null;

    const identityChanged =
      existing.title !== input.title ||
      JSON.stringify(existing.icon) !== JSON.stringify(input.icon);

    if (identityChanged) {
      await resnapshotUntouchedFutureItems(tx, userId, id, input, timeZone);
    }

    const [account] = await tx
      .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    const isCurrentAnchor = account?.wakeAnchorHabitId === id;
    if (input.isWakeAnchor && !isCurrentAnchor) {
      await setWakeAnchorIn(tx, userId, id);
    } else if (!input.isWakeAnchor && isCurrentAnchor) {
      await setWakeAnchorIn(tx, userId, null);
    }

    return { id: row.id };
  });
}

/**
 * Rewrite `title` and `icon` on items that have not been lived yet.
 *
 * WHY THIS EXISTS. Cross-cutting §8.1 says past items keep their snapshot and
 * says nothing about tomorrow's, which are already materialised — so a person
 * who renames *Run* to *Morning run* would see *Run* on tomorrow's list and
 * file a bug. This is SET-4's `[PROVISIONAL — Vesper]` ruling.
 *
 * "UNTOUCHED" IS EXACTLY THIS PREDICATE, and every clause earns its place:
 * still assigned, still upcoming, never deferred, no timer ever started on it,
 * on a day that is not closed and is not in the past. Anything that fails one
 * of those is a record, and a record is annotated, never rewritten.
 *
 * RANGE AND IMPORTANCE ARE NOT PROPAGATED: a slot owns its duration and its
 * priority (official spec §3.5), so changing the habit's range must not reach
 * back through a plan someone made deliberately.
 */
async function resnapshotUntouchedFutureItems(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  habitId: string,
  input: HabitFormInput,
  timeZone: string,
): Promise<void> {
  /*
   * [REVISIT: USE-1] `$today` is the CALENDAR date in the person's zone, not
   * `resolveDayKey`'s day key, because a day that has not closed yet is the
   * only thing this predicate cares about and `closed_at IS NULL` already
   * carries that. When USE-1 lands, switch to `resolveDayKey` so a day whose
   * close time has passed but whose row is not yet closed is excluded too.
   * SET-4's advisory note permits the simpler form and requires this marker.
   */
  const today = toDateKey(new Date(), timeZone);

  await tx
    .update(dayItems)
    .set({
      title: input.title,
      icon: input.icon,
      quantityUnit: input.quantityUnit,
      reflectionAxes: input.reflectionAxes,
      notesPreflight: input.defaultNotesPreflight,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(dayItems.userId, userId),
        eq(dayItems.habitId, habitId),
        eq(dayItems.assignmentState, "assigned"),
        eq(dayItems.completionState, "upcoming"),
        isNull(dayItems.deferredAt),
        notExists(
          tx
            .select({ one: sql`1` })
            .from(timerSessions)
            .where(eq(timerSessions.dayItemId, dayItems.id)),
        ),
        sql`${dayItems.dayId} IN (
          SELECT ${days.id} FROM ${days}
          WHERE ${days.userId} = ${userId}
            AND ${days.closedAt} IS NULL
            AND ${days.date} >= ${today}
        )`,
      ),
    );
}

/**
 * The anchor has one home, so moving it is one write and the old holder loses
 * it by definition rather than by a second update that could fail on its own.
 */
async function setWakeAnchorIn(
  tx: Parameters<Parameters<RlsClient["execute"]>[0]>[0],
  userId: string,
  habitId: string | null,
): Promise<void> {
  await tx
    .update(users)
    .set({ wakeAnchorHabitId: habitId, updatedAt: new Date() })
    .where(eq(users.id, userId));
}

/** Exported for the archive path, which clears the anchor in its own txn. */
export { setWakeAnchorIn };
