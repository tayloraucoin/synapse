import { and, eq, isNull } from "drizzle-orm";

import { habits, templates, type RlsClient } from "@syn/db";
import { clockMinutes, computeBudget, formatClockFromMinutes } from "@syn/utils";

import { defaultTemplateFor, readDayProfile, readTemplateSlots } from "../day/materialize-day";
import { walkTemplate } from "./to-view";

/**
 * The fit, at planning time — UX v1.1 §3.10, §4.12 (DYN-11).
 *
 * ONE ARITHMETIC, READ HERE. The first run's last screen and the block
 * editor's footer "show the same arithmetic": wake to work, minus orient,
 * minus mandatory prep, is what the routine has (`computeBudget`, DYN-1); the
 * routine's own length is the morning template's walk when the person has
 * built one, else the sum of the morning habits' midpoints — what the
 * landscape screen just captured. Nothing here judges the number (§4.12:
 * "The number is a fact"); the screen renders it and asks the overflow
 * question only when `routineMin > availableMin`.
 *
 * The orient and prep totals come from the same `defaultTemplateFor` and
 * `readTemplateSlots` the materialiser uses, so the fit screen and the day
 * that follows it cannot disagree about what prep costs.
 */

export type PlanFit = {
  /** "7:00" / "9:00"; work start null when screen 3 was skipped. */
  wakeClock: string;
  workStartClock: string | null;
  wakeMin: number;
  workStartMin: number | null;
  orientMin: number;
  prepMin: number;
  availableMin: number;
  routineMin: number;
  fits: boolean;
};

async function templateTotal(
  tx: Parameters<typeof readTemplateSlots>[0],
  userId: string,
  kind: "orient" | "prep" | "morning",
): Promise<number | null> {
  const id = await defaultTemplateFor(tx, userId, kind);
  if (id === null) return null;
  const [template] = await tx
    .select({ flow: templates.flow })
    .from(templates)
    .where(eq(templates.id, id))
    .limit(1);
  if (!template) return null;
  const rows = await readTemplateSlots(tx, userId, id);
  return walkTemplate(rows, template.flow, null).totalMin;
}

export async function planFit(rls: RlsClient, userId: string): Promise<PlanFit> {
  return rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const wakeMin = clockMinutes(profile.usualWakeTime.slice(0, 5));
    const workStartMin =
      profile.workStartTime === null ? null : clockMinutes(profile.workStartTime.slice(0, 5));

    const orientMin = (await templateTotal(tx, userId, "orient")) ?? 0;
    const prepMin = (await templateTotal(tx, userId, "prep")) ?? 0;

    // The routine: the template when it exists, else the habits themselves.
    let routineMin = await templateTotal(tx, userId, "morning");
    if (routineMin === null) {
      const rows = await tx
        .select({ min: habits.durationMinMin, max: habits.durationMaxMin })
        .from(habits)
        .where(
          and(
            eq(habits.userId, userId),
            eq(habits.type, "habit"),
            eq(habits.blockKind, "morning"),
            isNull(habits.archivedAt),
          ),
        );
      routineMin = rows.reduce((sum, row) => {
        if (row.min === null || row.max === null) return sum + 15;
        return sum + Math.round((row.min + row.max) / 2);
      }, 0);
    }

    const { availableMin } =
      workStartMin === null
        ? { availableMin: 0 }
        : computeBudget({
            wakeMin,
            workStartMin: workStartMin < wakeMin ? workStartMin + 1440 : workStartMin,
            orientMin,
            prepTotalMin: prepMin,
          });

    return {
      wakeClock: formatClockFromMinutes(wakeMin),
      workStartClock: workStartMin === null ? null : formatClockFromMinutes(workStartMin),
      wakeMin,
      workStartMin,
      orientMin,
      prepMin,
      availableMin,
      routineMin,
      fits: workStartMin === null ? true : routineMin <= availableMin,
    };
  });
}
