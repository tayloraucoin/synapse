import { and, count, desc, eq, gt, lt, or, sql } from "drizzle-orm";

import {
  dayItems,
  days,
  habits,
  templateSlots,
  templates,
  type RlsClient,
} from "@syn/db";
import type { BlockKind } from "@syn/types";

/**
 * LB-03's two sections, and the counts LB-01's archive dialog needs.
 *
 * "Show where a habit is used so archiving or changing it isn't a surprise"
 * (Epic 1 LB-03). Until SET-5 there are no templates and until SET-6 there are
 * no days, so both queries return empty and the screen renders its empty
 * state — which is the designed state, not a placeholder.
 */

export type HabitUsage = {
  templates: Array<{
    templateId: string;
    templateName: string;
    kind: BlockKind;
    durationMin: number;
    priority: number;
    overridden: boolean;
  }>;
  recentDays: Array<{ date: string; outcome: string }>;
};

/** Epic 1 LB-03's four outcome words. */
const OUTCOME_BY_STATE: Record<string, string> = {
  done: "done",
  missed: "missed",
  carried: "moved",
  pending_review: "missed",
  upcoming: "not assigned",
  active: "not assigned",
};

const RECENT_DAY_LIMIT = 14;

export async function readHabitUsage(
  rls: RlsClient,
  userId: string,
  habitId: string,
): Promise<HabitUsage | null> {
  return rls.execute(async (tx) => {
    const [habit] = await tx
      .select({ id: habits.id })
      .from(habits)
      .where(and(eq(habits.id, habitId), eq(habits.userId, userId)))
      .limit(1);

    // NOT_FOUND rather than an empty result: another person's id must not be
    // distinguishable from one that does not exist.
    if (!habit) return null;

    const slotRows = await tx
      .select({
        templateId: templates.id,
        templateName: templates.name,
        kind: templates.kind,
        durationMin: templateSlots.durationMin,
        priorityOverride: templateSlots.priorityOverride,
        lifePriority: habits.lifePriority,
      })
      .from(templateSlots)
      .innerJoin(templates, eq(templates.id, templateSlots.templateId))
      .innerJoin(habits, eq(habits.id, templateSlots.habitId))
      .where(
        and(
          eq(templateSlots.habitId, habitId),
          eq(templateSlots.userId, userId),
        ),
      )
      .orderBy(templates.name);

    const dayRows = await tx
      .select({
        date: days.date,
        completionState: dayItems.completionState,
        assignmentState: dayItems.assignmentState,
      })
      .from(dayItems)
      .innerJoin(days, eq(days.id, dayItems.dayId))
      .where(
        and(eq(dayItems.habitId, habitId), eq(dayItems.userId, userId)),
      )
      .orderBy(desc(days.date))
      .limit(RECENT_DAY_LIMIT);

    return {
      templates: slotRows.map((row) => ({
        templateId: row.templateId,
        templateName: row.templateName,
        kind: row.kind,
        durationMin: row.durationMin,
        priority: row.priorityOverride ?? row.lifePriority,
        overridden: row.priorityOverride !== null,
      })),
      recentDays: dayRows.map((row) => ({
        date: String(row.date),
        outcome:
          row.assignmentState === "assigned"
            ? (OUTCOME_BY_STATE[row.completionState] ?? "not assigned")
            : "not assigned",
      })),
    };
  });
}

/** How many templates hold this habit — LB-01's archive dialog line. */
export async function countTemplatesUsing(
  rls: RlsClient,
  userId: string,
  habitId: string,
): Promise<number> {
  const rows = await rls.execute((tx) =>
    tx
      .select({ value: count(sql`DISTINCT ${templateSlots.templateId}`) })
      .from(templateSlots)
      .where(
        and(
          eq(templateSlots.habitId, habitId),
          eq(templateSlots.userId, userId),
        ),
      ),
  );
  return Number(rows[0]?.value ?? 0);
}

/**
 * How many slots would fall outside a new range — LB-02's warning before save.
 *
 * The slots keep their duration either way; the dialog exists so the person
 * knows the plan and the definition have drifted apart, not to stop them.
 */
export async function countSlotsOutsideRange(
  rls: RlsClient,
  userId: string,
  habitId: string,
  min: number,
  max: number,
): Promise<number> {
  const rows = await rls.execute((tx) =>
    tx
      .select({ value: count() })
      .from(templateSlots)
      .where(
        and(
          eq(templateSlots.habitId, habitId),
          eq(templateSlots.userId, userId),
          or(
            lt(templateSlots.durationMin, min),
            gt(templateSlots.durationMin, max),
          ),
        ),
      ),
  );
  return Number(rows[0]?.value ?? 0);
}
