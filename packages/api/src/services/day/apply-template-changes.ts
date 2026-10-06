import { and, eq, gte, type SQL } from "drizzle-orm";

import { dayBlocks, days, type RlsClient } from "@syn/db";
import { addDays } from "@syn/utils";

import { materializeDay } from "./materialize-day";

/**
 * TP-04 — re-applying an edited template to the days already using it.
 *
 * THREE SCOPES, AND THE THIRD IS DOING NOTHING. "Don't apply" is a real
 * answer: the template is saved either way, and a person editing a template
 * for next month should not have this week rewritten underneath them. That is
 * why the dialog asks rather than assuming.
 *
 * The keep rules are not re-implemented here — `materializeDay` owns them, so
 * a done item on a re-applied day survives for exactly the same reason it
 * survives everywhere else.
 *
 * UNDER v1.1 A TEMPLATE IS ON A DAY THROUGH ITS BLOCK (`day_blocks.template_id`,
 * TD-1); the v1.0 `days.template_id` went in `0006` after its backfill. */

export type ApplyScope = "all" | "from_tomorrow" | "none";

export async function appliedDaysFor(
  rls: RlsClient,
  userId: string,
  templateId: string,
  todayKey: string,
): Promise<{ count: number; dates: string[] }> {
  const rows = await rls.execute((tx) =>
    tx
      .selectDistinct({ date: days.date })
      .from(days)
      .leftJoin(dayBlocks, eq(dayBlocks.dayId, days.id))
      .where(
        and(
          eq(days.userId, userId),
          eq(dayBlocks.templateId, templateId),
          // Today and forward: a past day's record is not re-applied to.
          gte(days.date, todayKey) as SQL,
        ),
      )
      .orderBy(days.date),
  );

  const dates = rows.map((row) => String(row.date));
  return { count: dates.length, dates };
}

export async function applyTemplateChanges(
  rls: RlsClient,
  userId: string,
  templateId: string,
  scope: ApplyScope,
  todayKey: string,
): Promise<{ applied: number }> {
  if (scope === "none") return { applied: 0 };

  const from = scope === "from_tomorrow" ? addDays(todayKey, 1) : todayKey;
  const { dates } = await appliedDaysFor(rls, userId, templateId, from);

  for (const date of dates) {
    // "Keep": the day's blocks stay what they are; their untouched items
    // follow the template's new shape.
    await materializeDay(rls, userId, { date, blocks: "keep" });
  }

  return { applied: dates.length };
}
