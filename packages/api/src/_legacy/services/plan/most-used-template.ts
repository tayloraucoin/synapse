import { and, countDistinct, desc, eq, gte, lte } from "drizzle-orm";

import { dayBlocks, days, templates, type RlsClient } from "@syn/db";
import { addDays } from "@syn/utils";

/**
 * LS-00's third door — *Apply {name}* on an unplanned day.
 *
 * THE WINDOW IS THE LAST FOUR WEEKS, and it looks BACKWARD only. A template
 * already applied to next Tuesday says nothing about what today usually looks
 * like; counting it would let one act of planning ahead decide what the empty
 * day in front of you offers.
 *
 * IT IS HIDDEN WITHOUT HISTORY. A new account has no usual day, and offering
 * to apply the only template someone has ever made would be the product
 * guessing on one data point.
 *
 * A TIE IS BROKEN BY NOTHING — the first row wins. There is no better answer
 * available, and the offer is a shortcut a person can decline, not a
 * recommendation the product has to defend.
 */
export type MostUsedTemplate = { id: string; name: string; days: number };

const WINDOW_DAYS = 28;

export async function mostUsedTemplate(
  rls: RlsClient,
  userId: string,
  todayKey: string,
): Promise<MostUsedTemplate | null> {
  const from = addDays(todayKey, -WINDOW_DAYS);

  // The morning block is what the v1.0 whole-day template became (TD-1); a
  // day is counted once per template, whatever else is on it.
  const rows = await rls.execute((tx) =>
    tx
      .select({
        id: templates.id,
        name: templates.name,
        used: countDistinct(dayBlocks.dayId),
      })
      .from(dayBlocks)
      .innerJoin(days, eq(days.id, dayBlocks.dayId))
      .innerJoin(templates, eq(templates.id, dayBlocks.templateId))
      .where(
        and(
          eq(dayBlocks.userId, userId),
          eq(dayBlocks.kind, "morning"),
          gte(days.date, from),
          // Strictly before today: an unplanned today has no template to count.
          lte(days.date, addDays(todayKey, -1)),
        ),
      )
      .groupBy(templates.id, templates.name)
      .orderBy(desc(countDistinct(dayBlocks.dayId)))
      .limit(1),
  );

  const row = rows[0];
  if (!row) return null;

  const used = Number(row.used);
  if (used === 0) return null;

  return { id: row.id, name: row.name, days: used };
}
