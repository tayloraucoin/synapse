import { and, eq, gte, type SQL } from "drizzle-orm";

import { days, type RlsClient } from "@syn/db";
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
 */

export type ApplyScope = "all" | "from_tomorrow" | "none";

export async function appliedDaysFor(
  rls: RlsClient,
  userId: string,
  templateId: string,
  todayKey: string,
): Promise<{ count: number; dates: string[] }> {
  const rows = await rls.execute((tx) =>
    tx
      .select({ date: days.date })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          eq(days.templateId, templateId),
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
    await materializeDay(rls, userId, { date, templateId });
  }

  return { applied: dates.length };
}
