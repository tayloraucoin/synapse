import { and, eq, isNotNull } from "drizzle-orm";

import { habits, templateSlots, users, type RlsClient } from "@syn/db";

/**
 * Archive, restore, and duplicate.
 *
 * ARCHIVE NEVER DELETES. There is no `DELETE FROM habits` anywhere in this
 * codebase and there is not meant to be: a habit is referenced by every day it
 * ever appeared on, and official spec §3.3 says library entries are "never
 * hard-deleted while any day references them". `archived_at` is the only exit.
 *
 * What archiving DOES remove is the habit's slots, from every template — which
 * is what LB-01's dialog promises ("It leaves your templates and the library")
 * and what restoring deliberately does not undo ("Templates it was removed
 * from are not restored"). Putting slots back would guess at an order and a
 * duration the person may have since changed.
 */

export async function archiveHabit(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<boolean> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .update(habits)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .returning({ id: habits.id });

    if (!row) return false;

    // The dialog says both of these happen, so both happen in one transaction
    // with the archive itself: a half-archived habit is worse than neither.
    await tx
      .delete(templateSlots)
      .where(
        and(eq(templateSlots.habitId, id), eq(templateSlots.userId, userId)),
      );

    await tx
      .update(users)
      .set({ wakeAnchorHabitId: null, updatedAt: new Date() })
      .where(and(eq(users.id, userId), eq(users.wakeAnchorHabitId, id)));

    return true;
  });
}

export async function restoreHabit(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<boolean> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .update(habits)
      .set({ archivedAt: null, updatedAt: new Date() })
      .where(
        and(
          eq(habits.id, id),
          eq(habits.userId, userId),
          isNotNull(habits.archivedAt),
        ),
      )
      .returning({ id: habits.id });

    return row !== undefined;
  });
}

/**
 * "{title} copy", opened in edit (Epic 1 LB-01).
 *
 * The copy is never the wake anchor: the flag is "at most one per user", and
 * silently moving it because someone duplicated a row would be the app making
 * a decision about their morning.
 */
export async function duplicateHabit(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<{ id: string } | null> {
  return rls.execute(async (tx) => {
    const [source] = await tx
      .select()
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (!source) return null;

    const [row] = await tx
      .insert(habits)
      .values({
        userId,
        title: `${source.title} copy`,
        type: source.type,
        icon: source.icon,
        categoryId: source.categoryId,
        durationMinMin: source.durationMinMin,
        durationMaxMin: source.durationMaxMin,
        lifePriority: source.lifePriority,
        quantityUnit: source.quantityUnit,
        reflectionAxes: source.reflectionAxes,
        defaultNotesPreflight: source.defaultNotesPreflight,
      })
      .returning({ id: habits.id });

    return row ?? null;
  });
}
