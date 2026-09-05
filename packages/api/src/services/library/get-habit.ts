import { and, eq } from "drizzle-orm";

import { habits, users, type RlsClient } from "@syn/db";
import type { IconValue } from "@syn/types";

/**
 * One habit, in the shape LB-02 edits.
 *
 * Not a `HabitSummaryView`: the sheet needs the optional fields a row carries
 * and a summary deliberately drops (the quantity unit, the axes, the preflight
 * note). A view is what a component renders; this is what a form loads.
 */

export type EditableHabit = {
  id: string;
  title: string;
  type: "habit" | "task_appointment" | "deep_work";
  icon: IconValue;
  categoryId: string | null;
  durationMinMin: number | null;
  durationMaxMin: number | null;
  lifePriority: number;
  quantityUnit: string | null;
  reflectionAxes: string[];
  defaultNotesPreflight: string | null;
  isWakeAnchor: boolean;
  archived: boolean;
};

export async function getHabit(
  rls: RlsClient,
  userId: string,
  id: string,
): Promise<EditableHabit | null> {
  return rls.execute(async (tx) => {
    const [row] = await tx
      .select({
        id: habits.id,
        title: habits.title,
        type: habits.type,
        icon: habits.icon,
        categoryId: habits.categoryId,
        durationMinMin: habits.durationMinMin,
        durationMaxMin: habits.durationMaxMin,
        lifePriority: habits.lifePriority,
        quantityUnit: habits.quantityUnit,
        reflectionAxes: habits.reflectionAxes,
        defaultNotesPreflight: habits.defaultNotesPreflight,
        archivedAt: habits.archivedAt,
      })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (!row) return null;

    const [account] = await tx
      .select({ wakeAnchorHabitId: users.wakeAnchorHabitId })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      id: row.id,
      title: row.title,
      type: row.type,
      icon: row.icon,
      categoryId: row.categoryId,
      durationMinMin: row.durationMinMin,
      durationMaxMin: row.durationMaxMin,
      lifePriority: row.lifePriority,
      quantityUnit: row.quantityUnit,
      reflectionAxes: row.reflectionAxes,
      defaultNotesPreflight: row.defaultNotesPreflight,
      isWakeAnchor: account?.wakeAnchorHabitId === row.id,
      archived: row.archivedAt !== null,
    };
  });
}
