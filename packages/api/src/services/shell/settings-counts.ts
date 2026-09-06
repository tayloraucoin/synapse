import { and, count, eq, inArray, isNotNull, isNull } from "drizzle-orm";

import {
  categories,
  days,
  habits,
  templates,
  type RlsClient,
} from "@syn/db";
import { weekDates, weekKeyOf } from "@syn/utils";

/**
 * ST-00's four numbers, in one round trip.
 *
 * THE INDEX IS THE ONLY CALLER, which is why this is one procedure rather than
 * four. A settings list that fires four requests shows four rows filling in at
 * four different moments, and the screen never looks finished.
 *
 * ARCHIVED ROWS ARE NOT COUNTED. The row says *12 habits* next to a link to
 * the library, and the library's default view shows the unarchived ones —
 * a count that disagreed with the list it links to would be worse than no
 * count.
 */
export type SettingsCounts = {
  habits: number;
  templates: number;
  categories: number;
  /** Days in the current week with a template applied. */
  plannedDays: number;
};

export async function readSettingsCounts(
  rls: RlsClient,
  userId: string,
  todayKey: string,
): Promise<SettingsCounts> {
  const dates = weekDates(weekKeyOf(todayKey));

  return rls.execute(async (tx) => {
    // `archived_at IS NULL` is the unarchived test — archive is a timestamp,
    // never a boolean, so the record says WHEN as well as whether.
    const [habitRow] = await tx
      .select({ value: count() })
      .from(habits)
      .where(and(eq(habits.userId, userId), isNull(habits.archivedAt)));

    const [templateRow] = await tx
      .select({ value: count() })
      .from(templates)
      .where(and(eq(templates.userId, userId), isNull(templates.archivedAt)));

    const [categoryRow] = await tx
      .select({ value: count() })
      .from(categories)
      .where(eq(categories.userId, userId));

    const [plannedRow] = await tx
      .select({ value: count() })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          inArray(days.date, dates),
          isNotNull(days.templateId),
        ),
      );

    return {
      habits: Number(habitRow?.value ?? 0),
      templates: Number(templateRow?.value ?? 0),
      categories: Number(categoryRow?.value ?? 0),
      plannedDays: Number(plannedRow?.value ?? 0),
    };
  });
}
