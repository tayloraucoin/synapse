import { and, eq, inArray, isNull, notExists, sql } from "drizzle-orm";

import { dayBlocks, dayItems, days, templates, type RlsClient } from "@syn/db";

import { isUntouchedItem } from "./untouched";
import { readDayItems } from "./materialize-day";

/**
 * The one data migration that is not SQL — UX v1.1 §11.8, TD-2 (DYN-5).
 *
 * Every v1.0 day was one template laid out from the wake anchor: a morning,
 * in v1.1's words. So every existing day with items and no blocks gets ONE
 * `morning` block — pointing at `days.template_id`, named after it, holding
 * every item the day has — and `day_items.day_block_id` is set, which is
 * what `0006` needs before it makes the column NOT NULL.
 *
 * WHY A SERVICE, NOT A MIGRATION. Which block an item belongs to is the
 * materialiser's kind of decision, and the block's state is a question about
 * the items ("has anything happened here") that `isUntouchedItem` answers
 * and SQL would re-derive. It runs once per tier, by hand, after `0005`
 * (`docs/developer-guides/migrations.md`), and again does nothing.
 *
 * REVERSIBLE IN REASONING, NOT BY DELETING. `day_items.day_block_id` cascades,
 * so deleting the blocks would take the items with them. The reversal is two
 * statements in this order: `UPDATE day_items SET day_block_id = NULL WHERE
 * day_block_id IN (the blocks this wrote)`, then `DELETE FROM day_blocks` for
 * those ids — which are the only blocks on days whose `days.template_id` is
 * set and which have exactly one block. Written down so the reversal is a
 * known pair rather than a guess.
 */
export async function backfillBlocks(
  rls: RlsClient,
  userId: string,
  todayKey: string,
): Promise<{ days: number; items: number }> {
  return rls.execute(async (tx) => {
    // Days with items and no blocks — the v1.0 rows.
    const candidates = await tx
      .select({
        id: days.id,
        date: days.date,
        templateId: days.templateId,
        templateName: templates.name,
        closedAt: days.closedAt,
      })
      .from(days)
      .leftJoin(templates, eq(templates.id, days.templateId))
      .where(
        and(
          eq(days.userId, userId),
          notExists(
            sql`(SELECT 1 FROM ${dayBlocks} WHERE ${dayBlocks.dayId} = ${days.id})`,
          ),
        ),
      );

    let dayCount = 0;
    let itemCount = 0;

    for (const day of candidates) {
      const items = await readDayItems(tx, userId, day.id);
      if (items.length === 0) continue;

      const dateKey = String(day.date);
      const isPast = dateKey < todayKey || day.closedAt !== null;
      const touched = items.some((item) => !isUntouchedItem(item));

      const starts = items
        .map((item) => item.originalScheduledStart ?? item.scheduledStart)
        .filter((at): at is Date => at !== null)
        .sort((a, b) => a.getTime() - b.getTime());
      const ends = items
        .map((item) => item.scheduledEnd)
        .filter((at): at is Date => at !== null)
        .sort((a, b) => b.getTime() - a.getTime());

      const [block] = await tx
        .insert(dayBlocks)
        .values({
          userId,
          dayId: day.id,
          kind: "morning",
          templateId: day.templateId,
          templateNameSnapshot: day.templateName ?? null,
          // A day that has been lived is set; a plan is still planned.
          state: isPast || touched ? "set" : "planned",
          sortOrder: 0,
          scheduledStart: starts[0] ?? null,
          scheduledEnd: ends[0] ?? null,
          // The block's ghost begins where its first item's did.
          originalScheduledStart: isPast || touched ? (starts[0] ?? null) : null,
        })
        .returning({ id: dayBlocks.id });
      if (!block) throw new Error("day_blocks insert returned no row");

      const updated = await tx
        .update(dayItems)
        .set({ dayBlockId: block.id })
        .where(
          and(
            inArray(
              dayItems.id,
              items.map((item) => item.id),
            ),
            isNull(dayItems.dayBlockId),
          ),
        )
        .returning({ id: dayItems.id });

      dayCount += 1;
      itemCount += updated.length;
    }

    return { days: dayCount, items: itemCount };
  });
}
