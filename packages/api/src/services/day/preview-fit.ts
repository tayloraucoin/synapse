import { and, eq, inArray } from "drizzle-orm";

import { habits, type RlsClient } from "@syn/db";
import type { PreviewFitInput } from "@syn/validators";
import { clockMinutes, computeBudget, fitToBudget, type FitItem, type FitResult } from "@syn/utils";

import { blockTotalMin } from "./lay-out-day";
import {
  readDay,
  readDayBlocks,
  readDayProfile,
  toLayoutBlocks,
  wakeMinutesOf,
} from "./materialize-day";

/**
 * *Shorten to fit* and the over-budget dialog — UX v1.1 §5.3, R4 (DYN-6).
 * `fitToBudget` against the day's computed budget, so the quick-pick's live
 * line and *Set the day*'s number come from the same arithmetic. Writes
 * nothing; the pick sends the result back as `menuDurations`.
 */
export async function previewFit(
  rls: RlsClient,
  userId: string,
  input: PreviewFitInput,
): Promise<FitResult & { availableMin: number }> {
  return rls.execute(async (tx) => {
    const profile = await readDayProfile(tx, userId);
    const day = await readDay(tx, userId, input.date);
    const blocks = day ? await readDayBlocks(tx, userId, day.id) : [];
    const layoutBlocks = day ? toLayoutBlocks(blocks, day) : [];
    const totalOf = (kind: "orient" | "prep"): number => {
      const block = layoutBlocks.find((entry) => entry.kind === kind);
      return block ? blockTotalMin(block) : 0;
    };

    const wakeMin = day ? wakeMinutesOf(day) : clockMinutes(profile.usualWakeTime.slice(0, 5));
    const workStartRaw = day?.workStartTime ?? profile.workStartTime;
    const workStartMin = workStartRaw === null ? null : clockMinutes(workStartRaw.slice(0, 5));
    const { availableMin } =
      workStartMin === null
        ? { availableMin: 0 }
        : computeBudget({
            wakeMin,
            workStartMin: workStartMin < wakeMin ? workStartMin + 1440 : workStartMin,
            orientMin: totalOf("orient"),
            prepTotalMin: totalOf("prep"),
          });

    const rows =
      input.habitIds.length === 0
        ? []
        : await tx
            .select({
              id: habits.id,
              lifePriority: habits.lifePriority,
              durationMinMin: habits.durationMinMin,
              durationMaxMin: habits.durationMaxMin,
            })
            .from(habits)
            .where(and(eq(habits.userId, userId), inArray(habits.id, input.habitIds)));
    const byId = new Map(rows.map((row) => [row.id, row]));

    const items: FitItem[] = input.habitIds
      .map((id) => byId.get(id))
      .filter((row): row is NonNullable<typeof row> => row !== undefined)
      .map((row) => ({
        id: row.id,
        durationMin:
          input.durations[row.id] ?? midpoint(row.durationMinMin, row.durationMaxMin),
        gapBeforeMin: 0,
        pinnedAtMin: null,
        scheduling: "soft",
        priority: row.lifePriority,
        durationMinMin: row.durationMinMin,
        isAssigned: true,
      }));

    return { ...fitToBudget(items, availableMin, input.mode), availableMin };
  });
}

function midpoint(min: number | null, max: number | null): number {
  if (min === null && max === null) return 15;
  if (min === null) return max as number;
  if (max === null) return min;
  return Math.round((min + max) / 2);
}
