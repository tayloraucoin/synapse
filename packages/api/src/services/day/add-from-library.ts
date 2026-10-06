import { and, asc, desc, eq, isNotNull } from "drizzle-orm";

import { dayBlocks, dayItems, days, habits, type RlsClient } from "@syn/db";
import type { BlockKind } from "@syn/types";

import { ensureDay } from "./one-off";
import { reflowBlock, type ReflowOverflow } from "./reflow-block";

/**
 * *Add from the library* — UX v1.1 §6.2 (DYN-15): the day header sheet's
 * row, "the primary way the day is built" on an unstructured day.
 *
 * A HABIT-DAY ITEM, IN A BLOCK, AT THE END. The habit's fields are
 * snapshotted the way materialisation does it (title, icon, the range's
 * midpoint as the length, its own priority); the row lands at the end of the
 * block the person picked — after its last item, or at the block's start, or
 * now, whichever is latest — and the block re-flows around it. With no block
 * (an unstructured day's grab-and-go), the item is placed at now with no
 * block and stacks nowhere: it is a thing on the day, like a one-off.
 *
 * `origin` is `one_off` (the item has no template slot and the library is
 * not written), so *Remove* on the item sheet applies to it as it does to
 * any one-off. A closed day is refused.
 */

export class AddFromLibraryError extends Error {
  readonly code: "no_such_habit" | "no_such_block" | "closed";
  constructor(code: AddFromLibraryError["code"]) {
    super(code);
    this.name = "AddFromLibraryError";
    this.code = code;
  }
}

function midpoint(min: number | null, max: number | null): number {
  if (min === null && max === null) return 15;
  if (min === null) return max as number;
  if (max === null) return min;
  return Math.round((min + max) / 2);
}

export async function addFromLibrary(
  rls: RlsClient,
  userId: string,
  input: { date: string; habitId: string; blockKind: BlockKind | null },
  now: Date = new Date(),
): Promise<{ id: string; overflow: ReflowOverflow | null }> {
  return rls.execute(async (tx) => {
    const day = await ensureDay(tx, userId, input.date);
    const [closed] = await tx
      .select({ closedAt: days.closedAt })
      .from(days)
      .where(eq(days.id, day.id))
      .limit(1);
    if (closed?.closedAt) throw new AddFromLibraryError("closed");

    const [habit] = await tx
      .select({
        id: habits.id,
        title: habits.title,
        icon: habits.icon,
        type: habits.type,
        lifePriority: habits.lifePriority,
        durationMinMin: habits.durationMinMin,
        durationMaxMin: habits.durationMaxMin,
        quantityUnit: habits.quantityUnit,
        reflectionAxes: habits.reflectionAxes,
        notesPreflight: habits.defaultNotesPreflight,
      })
      .from(habits)
      .where(and(eq(habits.id, input.habitId), eq(habits.userId, userId)))
      .limit(1);
    if (!habit) throw new AddFromLibraryError("no_such_habit");

    const block =
      input.blockKind === null
        ? null
        : ((
            await tx
              .select({ id: dayBlocks.id, scheduledStart: dayBlocks.scheduledStart })
              .from(dayBlocks)
              .where(
                and(
                  eq(dayBlocks.dayId, day.id),
                  eq(dayBlocks.userId, userId),
                  eq(dayBlocks.kind, input.blockKind),
                ),
              )
              .orderBy(asc(dayBlocks.sortOrder))
              .limit(1)
          )[0] ?? null);
    if (input.blockKind !== null && block === null) throw new AddFromLibraryError("no_such_block");

    // Where it lands: after the block's last item, at the block's start, or now.
    const [last] = block
      ? await tx
          .select({ end: dayItems.scheduledEnd, sortOrder: dayItems.sortOrder })
          .from(dayItems)
          .where(
            and(
              eq(dayItems.dayBlockId, block.id),
              eq(dayItems.userId, userId),
              isNotNull(dayItems.scheduledEnd),
            ),
          )
          .orderBy(desc(dayItems.scheduledEnd))
          .limit(1)
      : [];
    const candidates = [last?.end ?? null, block?.scheduledStart ?? null, now].filter(
      (value): value is Date => value !== null,
    );
    const start = new Date(Math.max(...candidates.map((value) => value.getTime())));
    const durationMin = midpoint(habit.durationMinMin, habit.durationMaxMin);

    const [created] = await tx
      .insert(dayItems)
      .values({
        userId,
        dayId: day.id,
        dayBlockId: block?.id ?? null,
        habitId: habit.id,
        templateSlotId: null,
        origin: "one_off",
        title: habit.title,
        icon: habit.icon,
        type: habit.type,
        quantityUnit: habit.quantityUnit,
        reflectionAxes: habit.reflectionAxes,
        notesPreflight: habit.notesPreflight,
        timeMode: "fixed_time",
        scheduledStart: start,
        scheduledEnd: new Date(start.getTime() + durationMin * 60_000),
        durationMin,
        gapBeforeMin: 0,
        pinned: false,
        priority: habit.lifePriority,
        scheduling: "soft",
        sortOrder: (last?.sortOrder ?? -1) + 1,
        templateNameSnapshot: null,
      })
      .returning({ id: dayItems.id });
    if (!created) throw new Error("day_items insert returned no row");

    const overflow = block ? (await reflowBlock(tx, userId, block.id, { now })).overflow : null;
    return { id: created.id, overflow };
  });
}
