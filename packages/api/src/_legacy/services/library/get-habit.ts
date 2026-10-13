import { and, eq } from "drizzle-orm";

import { habits, type RlsClient } from "@syn/db";
import type {
  BlockKind,
  HabitVersion,
  IconValue,
  ItemType,
  WorkoutLocation,
} from "@syn/types";

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
  type: ItemType;
  icon: IconValue;
  categoryId: string | null;
  durationMinMin: number | null;
  durationMaxMin: number | null;
  lifePriority: number;
  quantityUnit: string | null;
  reflectionAxes: string[];
  defaultNotesPreflight: string | null;
  archived: boolean;
  /** UX v1.1 §11.3. */
  blockKind: BlockKind | null;
  weeklyTarget: number | null;
  typicalDays: number[] | null;
  /** UX v1.2 §3.5, §3.7 (0007). */
  versions: HabitVersion[] | null;
  workoutType: string | null;
  location: WorkoutLocation | null;
  travelThereMin: number;
  travelBackMin: number;
  planTravel: boolean;
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
        blockKind: habits.blockKind,
        weeklyTarget: habits.weeklyTarget,
        typicalDays: habits.typicalDays,
        versions: habits.versions,
        workoutType: habits.workoutType,
        location: habits.location,
        travelThereMin: habits.travelThereMin,
        travelBackMin: habits.travelBackMin,
        planTravel: habits.planTravel,
      })
      .from(habits)
      .where(and(eq(habits.id, id), eq(habits.userId, userId)))
      .limit(1);

    if (!row) return null;

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
      archived: row.archivedAt !== null,
      blockKind: row.blockKind,
      weeklyTarget: row.weeklyTarget,
      typicalDays: row.typicalDays,
      versions: row.versions && row.versions.length > 0 ? row.versions : null,
      workoutType: row.workoutType,
      location: row.location,
      travelThereMin: row.travelThereMin,
      travelBackMin: row.travelBackMin,
      planTravel: row.planTravel,
    };
  });
}
