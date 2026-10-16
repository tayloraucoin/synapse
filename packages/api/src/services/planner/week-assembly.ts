import { readDay, usualDay, weekDates, weekdayIndex } from "@syn/utils";
import type {
  DayBoundsRecord,
  SetUpDayRead,
  WeekReadOutput,
} from "@syn/validators";

import { eventOn } from "./day-assembly";
import type { PlannerRows } from "./planner-rows";

/**
 * A week's read from its rows (USE-91), pure: what the fixture server's
 * `readWeek` returns, seven days as records. Which blocks run is decided by
 * the pure readers (`usualDay`, `readDay`), never here by hand.
 */

type DayRef = { weekday: number } | { date: string };

/** A date's own Up at and Lights out win over its weekday's. */
export function boundsFor(
  rows: Pick<PlannerRows, "dayBounds">,
  ref: DayRef,
): DayBoundsRecord | null {
  if ("date" in ref) {
    const own = rows.dayBounds.find((row) => row.onDate === ref.date);
    if (own) return own;
  }
  const weekday = "date" in ref ? weekdayIndex(ref.date) : ref.weekday;
  return rows.dayBounds.find((row) => row.weekday === weekday) ?? null;
}

export function assembleSetUpDay(rows: PlannerRows, ref: DayRef): SetUpDayRead {
  const bounds = boundsFor(rows, ref);
  if (!("date" in ref)) {
    const blocks = usualDay(
      rows.blocks.filter((block) => block.archivedAt === null),
      ref.weekday,
    );
    const ids = new Set(blocks.map((block) => block.id));
    return {
      weekday: ref.weekday,
      date: null,
      bounds,
      blocks,
      changes: [],
      items: rows.blockItems.filter(
        (item) => ids.has(item.blockId) && item.onDate === null,
      ),
      slots: [],
      events: usualDay(rows.dayEvents, ref.weekday),
      workItems: [],
      todos: [],
    };
  }

  const date = ref.date;
  const changes = rows.blockChanges.filter((change) => change.onDate === date);
  const slots = rows.slots.filter((slot) => slot.onDate === date);
  const read = readDay({
    dateKey: date,
    timeZone: rows.timeZone,
    blocks: rows.blocks,
    changes,
    slots,
  });
  const blocks = read.blocks.map((occurrence) => occurrence.block);
  const ids = new Set(blocks.map((block) => block.id));
  const skipped = new Set(
    slots
      .filter((slot) => slot.skipped && slot.blockItemId !== null)
      .map((slot) => slot.blockItemId),
  );
  const workIds = new Set(slots.map((slot) => slot.workItemId));
  const todoIds = new Set(slots.map((slot) => slot.todoId));
  return {
    weekday: weekdayIndex(date),
    date,
    bounds,
    blocks,
    changes,
    items: rows.blockItems.filter(
      (item) =>
        ids.has(item.blockId) &&
        (item.onDate === null || item.onDate === date) &&
        !skipped.has(item.id),
    ),
    slots,
    events: rows.dayEvents.filter((event) => eventOn(event, date)),
    workItems: rows.workItems.filter((item) => workIds.has(item.id)),
    todos: rows.todos.filter((todo) => todoIds.has(todo.id)),
  };
}

/** The dates a week's read needs: none for the usual week. */
export function datesOf(week: string): string[] {
  return week === "usual" ? [] : weekDates(week);
}

export function assembleWeek(rows: PlannerRows, week: string): WeekReadOutput {
  const refs: DayRef[] =
    week === "usual"
      ? [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday }))
      : weekDates(week).map((date) => ({ date }));
  return {
    week,
    timeZone: rows.timeZone,
    days: refs.map((ref) => assembleSetUpDay(rows, ref)),
  };
}
