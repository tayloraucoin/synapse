import { and, eq, inArray } from "drizzle-orm";

import { dayBlocks, days, type RlsClient } from "@syn/db";
import { addDays, weekDates, weekKeyOf } from "@syn/utils";

import { materializeDay, type BlockAssignment } from "./materialize-day";

/**
 * *Copy last week* — blocks, shapes and anchors, never one-offs.
 *
 * A one-off is a thing that happened once, on purpose, on a particular day.
 * Copying them forward would fill next week with last week's exceptions, which
 * is the opposite of what "the same kind of week" means. The blocks and their
 * templates are the shape; the exceptions are not. A pooled block copies as
 * pooled — *decide in the morning* is part of the shape too.
 *
 * ALREADY-PLANNED DAYS ARE ONLY OVERWRITTEN AFTER THE EXTRA CONFIRMATION —
 * `overwrite` is that answer, and without it a planned day is skipped rather
 * than replaced. "Planned" is "has a block", which every materialised day has.
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
        shape: days.shape,
        anchorTime: days.anchorTime,
        focusHabitId: days.workFocusHabitId,
        blockKind: dayBlocks.kind,
        blockTemplateId: dayBlocks.templateId,
        blockState: dayBlocks.state,
      })
      .from(days)
      .innerJoin(dayBlocks, eq(dayBlocks.dayId, days.id))
      .where(and(eq(days.userId, userId), inArray(days.date, sourceDates))),
  );

  const existing = await rls.execute((tx) =>
    tx
      .selectDistinct({ date: days.date })
      .from(days)
      .innerJoin(dayBlocks, eq(dayBlocks.dayId, days.id))
      .where(and(eq(days.userId, userId), inArray(days.date, targetDates))),
  );

  const alreadyPlanned = new Set(existing.map((row) => String(row.date)));

  // One assignment list per source day; the two work halves of a split
  // container collapse to one work block.
  const byDate = new Map<
    string,
    { shape: "structured" | "unstructured"; anchorTime: string; focusHabitId: string | null; blocks: BlockAssignment[] }
  >();
  for (const row of source) {
    const date = String(row.date);
    const entry = byDate.get(date) ?? {
      shape: row.shape,
      anchorTime: row.anchorTime,
      focusHabitId: row.focusHabitId,
      blocks: [],
    };
    if (!entry.blocks.some((block) => block.kind === row.blockKind)) {
      entry.blocks.push({
        kind: row.blockKind,
        templateId: row.blockState === "pooled" ? "pool" : row.blockTemplateId,
      });
    }
    byDate.set(date, entry);
  }

  let copied = 0;
  let skipped = 0;

  for (const [sourceDate, plan] of byDate) {
    const index = sourceDates.indexOf(sourceDate);
    const target = index === -1 ? undefined : targetDates[index];
    if (target === undefined) continue;

    if (alreadyPlanned.has(target) && !overwrite) {
      skipped += 1;
      continue;
    }

    // The same materialiser as every other write path, so a copied day gets
    // the same keep rules as an applied one.
    await materializeDay(rls, userId, {
      date: target,
      blocks: plan.blocks,
      shape: plan.shape,
      anchorTime: plan.anchorTime,
      focusHabitId: plan.focusHabitId,
    });
    copied += 1;
  }

  return { copied, skipped };
}
