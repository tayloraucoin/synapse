import { and, asc, eq, inArray, isNotNull, isNull, or } from "drizzle-orm";

import {
  dayBlocks,
  dayItems,
  days,
  fixtures,
  habits,
  templates,
  type RlsClient,
} from "@syn/db";
import type { DayShape, WeekPlanStatus } from "@syn/types";
import { addDays, weekDates, weekKeyOf, weekdayForDayKey, weekdayIndex } from "@syn/utils";

/**
 * WK-01's seven rows, plus the target line — under v1.1, one line per day
 * (§4.13): the shape, the morning, the focus, the workout, the fixtures.
 *
 * A WEEK IS NOT A TABLE. `week_plans` does not exist (SET-1's ruling): a
 * week's status is "does any day have a block or a one-off", which is a
 * question about days. Deriving it means it can never be stale.
 *
 * `templateId`/`templateName` are the MORNING block's — the v1.0 whole-day
 * template was a morning (TD-1); the v1.0 column went in `0006` after its
 * backfill (DYN-21).
 */

export type DayPlanView = {
  date: string;
  weekday: string;
  isToday: boolean;
  isPast: boolean;
  /** The morning block's template. */
  templateId: string | null;
  templateName: string | null;
  anchorTime: string | null;
  oneOffCount: number;

  /* ---- UX v1.1 §4.13 — the line per day (DYN-5) ---- */
  shape: DayShape | null;
  /** The variant's name · *Menu* · *one of A/B*; null when nothing is planned. */
  morningLabel: string | null;
  focusLabel: string | null;
  workoutLabel: string | null;
  fixtureLabels: string[];
  confirmed: boolean;
  /** True once the day has any block — "planned" under v1.1. */
  planned: boolean;
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

// [COPY — needs Vesper sign-off: the week line's word for a pooled morning.]
const MENU_LABEL = "Menu";

export async function getWeek(
  rls: RlsClient,
  userId: string,
  weekKey: string,
  todayKey: string,
): Promise<WeekView> {
  const dates = weekDates(weekKey);

  return rls.execute(async (tx) => {
    const dayRows = await tx
      .select({
        id: days.id,
        date: days.date,
        anchorTime: days.anchorTime,
        shape: days.shape,
        confirmedAt: days.confirmedAt,
        focusId: days.workFocusHabitId,
        focusTitle: habits.title,
      })
      .from(days)
      .leftJoin(habits, eq(habits.id, days.workFocusHabitId))
      .where(and(eq(days.userId, userId), inArray(days.date, dates)));

    const byDate = new Map(dayRows.map((row) => [String(row.date), row]));
    const dayIds = dayRows.map((row) => row.id);

    const blockRows =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              dayId: dayBlocks.dayId,
              kind: dayBlocks.kind,
              templateId: dayBlocks.templateId,
              templateNameSnapshot: dayBlocks.templateNameSnapshot,
              state: dayBlocks.state,
            })
            .from(dayBlocks)
            .where(and(eq(dayBlocks.userId, userId), inArray(dayBlocks.dayId, dayIds)))
            .orderBy(asc(dayBlocks.sortOrder));

    const itemRows =
      dayIds.length === 0
        ? []
        : await tx
            .select({
              dayId: dayItems.dayId,
              origin: dayItems.origin,
              type: dayItems.type,
              title: dayItems.title,
            })
            .from(dayItems)
            .where(
              and(
                eq(dayItems.userId, userId),
                inArray(dayItems.dayId, dayIds),
                or(
                  eq(dayItems.origin, "one_off"),
                  eq(dayItems.origin, "fixture"),
                  eq(dayItems.type, "workout"),
                ),
              ),
            );

    // The rotation, for a workout label before the day is set.
    const workouts = await tx
      .select({ title: habits.title, typicalDays: habits.typicalDays })
      .from(habits)
      .where(
        and(eq(habits.userId, userId), eq(habits.type, "workout"), isNull(habits.archivedAt)),
      )
      .orderBy(asc(habits.createdAt));
    const fixtureRows = await tx
      .select({ title: fixtures.title, weekdays: fixtures.weekdays })
      .from(fixtures)
      .where(and(eq(fixtures.userId, userId), isNull(fixtures.archivedAt)));

    const dayViews: DayPlanView[] = dates.map((date) => {
      const row = byDate.get(date);
      const blocks = row ? blockRows.filter((block) => block.dayId === row.id) : [];
      const items = row ? itemRows.filter((item) => item.dayId === row.id) : [];
      const weekday = weekdayIndex(date);

      const morning = blocks.find((block) => block.kind === "morning");
      const training = blocks.find((block) => block.kind === "training");
      const morningLabel =
        morning === undefined
          ? null
          : morning.state === "pooled"
            ? MENU_LABEL
            : (morning.templateNameSnapshot ?? null);
      const workoutItem = items.find((item) => item.type === "workout");
      const workoutLabel =
        training === undefined || training.state === "not_today"
          ? null
          : (workoutItem?.title ??
            workouts.find((workout) => (workout.typicalDays ?? []).includes(weekday))?.title ??
            null);
      const fixtureLabels =
        items.length > 0 && items.some((item) => item.origin === "fixture")
          ? items.filter((item) => item.origin === "fixture").map((item) => item.title)
          : row
            ? fixtureRows.filter((fixture) => fixture.weekdays.includes(weekday)).map((f) => f.title)
            : [];

      return {
        date,
        weekday: weekdayForDayKey(date),
        isToday: date === todayKey,
        isPast: date < todayKey,
        templateId: morning?.templateId ?? null,
        templateName: morning?.templateNameSnapshot ?? null,
        anchorTime: row?.anchorTime ?? null,
        oneOffCount: items.filter((item) => item.origin === "one_off").length,
        shape: row?.shape ?? null,
        morningLabel,
        focusLabel: row?.focusTitle ?? null,
        workoutLabel,
        fixtureLabels,
        confirmed: row?.confirmedAt != null,
        planned: blocks.length > 0,
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
    for (const block of blockRows) {
      if (block.templateId === null) continue;
      usageByTemplate.set(block.templateId, (usageByTemplate.get(block.templateId) ?? 0) + 1);
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

    // *Copy last week* is hidden when last week had no block on any day —
    // copying nothing is not an offer worth making.
    const lastWeekDates = weekDates(weekKeyOf(addDays(dates[0] ?? todayKey, -7)));
    const lastWeekPlanned = await tx
      .select({ id: days.id })
      .from(days)
      .leftJoin(dayBlocks, eq(dayBlocks.dayId, days.id))
      .where(
        and(
          eq(days.userId, userId),
          inArray(days.date, lastWeekDates),
          isNotNull(dayBlocks.id),
        ),
      )
      .limit(1);

    return {
      weekKey,
      days: dayViews,
      targets: withTargets,
      status: dayViews.some((day) => day.planned || day.oneOffCount > 0)
        ? "planned"
        : "unplanned",
      lastWeekPlanned: lastWeekPlanned.length > 0,
    };
  });
}
