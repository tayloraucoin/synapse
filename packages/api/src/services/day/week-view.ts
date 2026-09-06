import { and, eq, inArray, isNotNull } from "drizzle-orm";

import { dayItems, days, templates, type RlsClient } from "@syn/db";
import type { WeekPlanStatus } from "@syn/types";
import { addDays, weekDates, weekKeyOf, weekdayForDayKey } from "@syn/utils";

/**
 * WK-01's seven rows, plus the target line.
 *
 * A WEEK IS NOT A TABLE. `week_plans` does not exist (SET-1's ruling): a
 * week's status is "does any day have a template or a one-off", which is a
 * question about days. Deriving it means it can never be stale — the failure a
 * stored flag would eventually have is a week that says *planned* after its
 * last template was removed.
 */

export type DayPlanView = {
  date: string;
  weekday: string;
  isToday: boolean;
  isPast: boolean;
  templateId: string | null;
  templateName: string | null;
  anchorTime: string | null;
  oneOffCount: number;
};

export type WeekTarget = {
  templateId: string;
  name: string;
  used: number;
  target: number;
  /** The one small marker — never a sort (official spec §4.5). */
  mostBehind: boolean;
};

export type WeekView = {
  weekKey: string;
  days: DayPlanView[];
  targets: WeekTarget[];
  status: WeekPlanStatus;
  lastWeekPlanned: boolean;
};

export async function getWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  todayKey: string,
): Promise<WeekView> {
  const dates = weekDates(weekKey);

  return rls.execute(async (tx) => {
    const rows = await tx
      .select({
        date: days.date,
        templateId: days.templateId,
        anchorTime: days.anchorTime,
        templateName: templates.name,
      })
      .from(days)
      .leftJoin(templates, eq(templates.id, days.templateId))
      .where(and(eq(days.userId, userId), inArray(days.date, dates)));

    const byDate = new Map(rows.map((row) => [String(row.date), row]));

    const dayIds = await tx
      .select({ id: days.id, date: days.date })
      .from(days)
      .where(and(eq(days.userId, userId), inArray(days.date, dates)));

    const oneOffs =
      dayIds.length === 0
        ? []
        : await tx
            .select({ dayId: dayItems.dayId, id: dayItems.id })
            .from(dayItems)
            .where(
              and(
                eq(dayItems.userId, userId),
                eq(dayItems.origin, "one_off"),
                inArray(
                  dayItems.dayId,
                  dayIds.map((row) => row.id),
                ),
              ),
            );

    const dateByDayId = new Map(dayIds.map((row) => [row.id, String(row.date)]));
    const oneOffCounts = new Map<string, number>();
    for (const item of oneOffs) {
      const date = dateByDayId.get(item.dayId);
      if (date === undefined) continue;
      oneOffCounts.set(date, (oneOffCounts.get(date) ?? 0) + 1);
    }

    const dayViews: DayPlanView[] = dates.map((date) => {
      const row = byDate.get(date);
      return {
        date,
        weekday: weekdayForDayKey(date),
        isToday: date === todayKey,
        isPast: date < todayKey,
        templateId: row?.templateId ?? null,
        templateName: row?.templateName ?? null,
        anchorTime: row?.anchorTime ?? null,
        oneOffCount: oneOffCounts.get(date) ?? 0,
      };
    });

    // Targets: how many days this week each targeted template is used on.
    const targeted = await tx
      .select({
        id: templates.id,
        name: templates.name,
        weeklyTarget: templates.weeklyTarget,
      })
      .from(templates)
      .where(eq(templates.userId, userId));

    const usageByTemplate = new Map<string, number>();
    for (const view of dayViews) {
      if (view.templateId === null) continue;
      usageByTemplate.set(
        view.templateId,
        (usageByTemplate.get(view.templateId) ?? 0) + 1,
      );
    }

    const withTargets = targeted
      .filter((row) => row.weeklyTarget !== null)
      .map((row) => ({
        templateId: row.id,
        name: row.name,
        used: usageByTemplate.get(row.id) ?? 0,
        target: row.weeklyTarget as number,
        mostBehind: false,
      }));

    // "Most behind" is the largest shortfall; ties keep the first, and a
    // template already at its target is never behind.
    let worst: WeekTarget | null = null;
    for (const entry of withTargets) {
      const shortfall = entry.target - entry.used;
      if (shortfall <= 0) continue;
      if (worst === null || shortfall > worst.target - worst.used) {
        worst = entry;
      }
    }
    if (worst) worst.mostBehind = true;

    // *Copy last week* is hidden when last week had no template on any day —
    // copying nothing is not an offer worth making.
    const lastWeekDates = weekDates(weekKeyOf(addDays(dates[0] ?? todayKey, -7)));
    const lastWeekWithTemplate = await tx
      .select({ id: days.id })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          inArray(days.date, lastWeekDates),
          isNotNull(days.templateId),
        ),
      );

    return {
      weekKey,
      days: dayViews,
      targets: withTargets,
      status: dayViews.some(
        (day) => day.templateId !== null || day.oneOffCount > 0,
      )
        ? "planned"
        : "unplanned",
      // "Unplanned" for last week means no template on any of its days, which
      // is what hides *Copy last week* rather than offering an empty copy.
      lastWeekPlanned: lastWeekWithTemplate.length > 0,
    };
  });
}
