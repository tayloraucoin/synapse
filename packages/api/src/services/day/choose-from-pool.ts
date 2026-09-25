import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import { dayBlocks, dayItems, days, type RlsClient } from "@syn/db";

import { habitItem, readHabits } from "./habit-item";
import { readTemplateSlots, readTemplates } from "./materialize-day";
import { reflowBlock, type ReflowOverflow } from "./reflow-block";

/**
 * Free time, chosen — UX v1.3 R50, §3.16, TD-26 (DAY-6).
 *
 * The day's free-time block waits POOLED with its template (*Evenings A*):
 * its fixtures are pins, nothing else is on it, and nothing infers the
 * evening. This is the one service that fills it — the pick's *Free time*
 * section under *Build each morning*, and the Today row's *Choose when
 * you're there* — with the pool members the person tapped:
 *
 *  - each chosen member becomes a habit-day item in the block (the snapshot
 *    `habitItem` takes, as the morning's menu does — origin `template`, no
 *    slot, so no re-lay orphans it), at the slot's length, in the pool's
 *    rank order;
 *  - it lands after the block's last item, at the evening's start, or now,
 *    whichever is latest, and the block re-flows around its pins;
 *  - the block goes `set`.
 *
 * CALLING IT AGAIN ADDS MORE; IT NEVER REMOVES — *Not today* on the item is
 * how one goes. A member already on the block is not added twice. A habit
 * the pool does not hold is refused, and so is a closed day.
 */

export class ChooseFromPoolError extends Error {
  readonly code: "no_such_day" | "closed" | "no_pool" | "not_in_pool";
  constructor(code: ChooseFromPoolError["code"]) {
    super(code);
    this.name = "ChooseFromPoolError";
    this.code = code;
  }
}

export async function chooseFromPool(
  rls: RlsClient,
  userId: string,
  input: { date: string; habitIds: readonly string[] },
  now: Date = new Date(),
): Promise<{ added: string[]; overflow: ReflowOverflow | null }> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({ id: days.id, closedAt: days.closedAt })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, input.date)))
      .limit(1);
    if (!day) throw new ChooseFromPoolError("no_such_day");
    if (day.closedAt) throw new ChooseFromPoolError("closed");

    // The free-time block that carries a pool template.
    const candidates = await tx
      .select({
        id: dayBlocks.id,
        templateId: dayBlocks.templateId,
        scheduledStart: dayBlocks.scheduledStart,
      })
      .from(dayBlocks)
      .where(
        and(eq(dayBlocks.dayId, day.id), eq(dayBlocks.userId, userId), eq(dayBlocks.kind, "activity")),
      )
      .orderBy(asc(dayBlocks.sortOrder));
    const templatesById = await readTemplates(
      tx,
      userId,
      candidates.map((row) => row.templateId).filter((id): id is string => id !== null),
    );
    const block = candidates.find(
      (row) => row.templateId !== null && templatesById.get(row.templateId)?.structure === "opener_pool_closer",
    );
    if (!block || block.templateId === null) throw new ChooseFromPoolError("no_pool");
    const template = templatesById.get(block.templateId);
    if (!template) throw new ChooseFromPoolError("no_pool");

    // The pool's members, in its rank order (the template's slot order).
    const slots = (await readTemplateSlots(tx, userId, template.id)).filter((slot) => slot.role === "pool");
    const slotByHabit = new Map(slots.map((slot) => [slot.habitId, slot]));
    if (input.habitIds.some((id) => !slotByHabit.has(id))) throw new ChooseFromPoolError("not_in_pool");

    const onBlock = await tx
      .select({
        habitId: dayItems.habitId,
        sortOrder: dayItems.sortOrder,
        end: dayItems.scheduledEnd,
      })
      .from(dayItems)
      .where(and(eq(dayItems.dayBlockId, block.id), eq(dayItems.userId, userId)));
    const already = new Set(onBlock.map((row) => row.habitId).filter((id): id is string => id !== null));
    const chosen = slots.filter((slot) => input.habitIds.includes(slot.habitId) && !already.has(slot.habitId));
    if (chosen.length === 0) return { added: [], overflow: null };

    const habitsById = await readHabits(tx, userId, chosen.map((slot) => slot.habitId));

    // After the block's last item, at the evening's start, or now — whichever is latest.
    const [last] = await tx
      .select({ end: dayItems.scheduledEnd })
      .from(dayItems)
      .where(
        and(eq(dayItems.dayBlockId, block.id), eq(dayItems.userId, userId), isNotNull(dayItems.scheduledEnd)),
      )
      .orderBy(desc(dayItems.scheduledEnd))
      .limit(1);
    const from = [last?.end ?? null, block.scheduledStart, now].filter((value): value is Date => value !== null);
    let cursor = Math.max(...from.map((value) => value.getTime()));
    let sortOrder = Math.max(-1, ...onBlock.map((row) => row.sortOrder)) + 1;

    const added: string[] = [];
    for (const slot of chosen) {
      const habit = habitsById.get(slot.habitId);
      if (!habit) continue;
      const start = new Date(cursor);
      const end = new Date(cursor + slot.durationMin * 60_000);
      const [row] = await tx
        .insert(dayItems)
        .values({
          ...habitItem(habit, { durationMin: slot.durationMin, sortOrder, snapshot: template.name }),
          userId,
          dayId: day.id,
          dayBlockId: block.id,
          scheduledStart: start,
          scheduledEnd: end,
        })
        .returning({ id: dayItems.id });
      if (!row) throw new Error("day_items insert returned no row");
      added.push(row.id);
      cursor = end.getTime();
      sortOrder += 1;
    }

    await tx
      .update(dayBlocks)
      .set({ state: "set", updatedAt: new Date() })
      .where(eq(dayBlocks.id, block.id));

    const { overflow } = await reflowBlock(tx, userId, block.id, { now });
    return { added, overflow };
  });
}
