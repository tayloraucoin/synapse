import { and, eq, inArray, isNotNull } from "drizzle-orm";

import { days, type RlsClient } from "@syn/db";
import { addDays, weekDates, weekKeyOf } from "@syn/utils";

import { materializeDay } from "./materialize-day";

/**
 * *Copy last week* — templates and anchors, never one-offs.
 *
 * A one-off is a thing that happened once, on purpose, on a particular day.
 * Copying them forward would fill next week with last week's exceptions, which
 * is the opposite of what "the same kind of week" means. Templates and their
 * start times are the shape; the exceptions are not.
 *
 * ALREADY-PLANNED DAYS ARE ONLY OVERWRITTEN AFTER THE EXTRA CONFIRMATION —
 * `overwrite` is that answer, and without it a planned day is skipped rather
 * than replaced.
 */
export async function copyLastWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  overwrite: boolean,
): Promise<{ copied: number; skipped: number }> {
  const targetDates = weekDates(weekKey);
  const firstDate = targetDates[0];
  if (firstDate === undefined) return { copied: 0, skipped: 0 };

  const sourceDates = weekDates(weekKeyOf(addDays(firstDate, -7)));

  const source = await rls.execute((tx) =>
    tx
      .select({
        date: days.date,
        templateId: days.templateId,
        anchorTime: days.anchorTime,
      })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          inArray(days.date, sourceDates),
          isNotNull(days.templateId),
        ),
      ),
  );

  const existing = await rls.execute((tx) =>
    tx
      .select({ date: days.date })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          inArray(days.date, targetDates),
          isNotNull(days.templateId),
        ),
      ),
  );

  const alreadyPlanned = new Set(existing.map((row) => String(row.date)));

  let copied = 0;
  let skipped = 0;

  for (const row of source) {
    const index = sourceDates.indexOf(String(row.date));
    const target = index === -1 ? undefined : targetDates[index];
    if (target === undefined || row.templateId === null) continue;

    if (alreadyPlanned.has(target) && !overwrite) {
      skipped += 1;
      continue;
    }

    // The same materialiser as every other write path, so a copied day gets
    // the same keep rules as an applied one.
    await materializeDay(rls, userId, {
      date: target,
      templateId: row.templateId,
      anchorTime: row.anchorTime,
    });
    copied += 1;
  }

  return { copied, skipped };
}
