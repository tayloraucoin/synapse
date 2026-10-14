import {
  occursOn,
  parseRule,
  readDay,
  usualDay,
  weekDates,
  weekdayIndex,
} from "@syn/utils";
import type { DayBoundsRecord, DayEventRecord } from "@syn/validators";
import type {
  DayRef,
  SetUpDayRecords,
  WeekRecords,
  WeekRef,
} from "@/lib/data/week-records";
import type { FixtureRecords } from "../records";

/**
 * The set-up read (USE-36): seven days as records, what the planner router
 * will return. Which blocks run is decided by the pure readers (`usualDay`,
 * `readDay`), never here by hand.
 */

/** A date's own Up at and Lights out win over its weekday's. */
export function boundsFor(
  records: FixtureRecords,
  ref: DayRef,
): DayBoundsRecord | null {
  if ("date" in ref) {
    const own = records.dayBounds.find((row) => row.onDate === ref.date);
    if (own) return own;
  }
  const weekday = "date" in ref ? weekdayIndex(ref.date) : ref.weekday;
  return records.dayBounds.find((row) => row.weekday === weekday) ?? null;
}

function eventOn(event: DayEventRecord, dateKey: string): boolean {
  if (event.rrule === null) return event.onDate === dateKey;
  const parsed = parseRule(event.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

export function readSetUpDay(
  records: FixtureRecords,
  ref: DayRef,
): SetUpDayRecords {
  const bounds = boundsFor(records, ref);
  if (!("date" in ref)) {
    const blocks = usualDay(
      records.blocks.filter((block) => block.archivedAt === null),
      ref.weekday,
    );
    const ids = new Set(blocks.map((block) => block.id));
    return {
      weekday: ref.weekday,
      date: null,
      bounds,
      blocks,
      changes: [],
      items: records.blockItems.filter(
        (item) => ids.has(item.blockId) && item.onDate === null,
      ),
      slots: [],
      events: usualDay(records.dayEvents, ref.weekday),
      workItems: [],
      todos: [],
    };
  }

  const date = ref.date;
  const changes = records.blockChanges.filter((c) => c.onDate === date);
  const slots = records.slots.filter((slot) => slot.onDate === date);
  const read = readDay({
    dateKey: date,
    timeZone: records.timeZone,
    blocks: records.blocks,
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
    items: records.blockItems.filter(
      (item) =>
        ids.has(item.blockId) &&
        (item.onDate === null || item.onDate === date) &&
        !skipped.has(item.id),
    ),
    slots,
    events: records.dayEvents.filter((event) => eventOn(event, date)),
    workItems: records.workItems.filter((item) => workIds.has(item.id)),
    todos: records.todos.filter((todo) => todoIds.has(todo.id)),
  };
}

export function readWeek(records: FixtureRecords, week: WeekRef): WeekRecords {
  const refs: DayRef[] =
    week === "usual"
      ? [0, 1, 2, 3, 4, 5, 6].map((weekday) => ({ weekday }))
      : weekDates(week).map((date) => ({ date }));
  // A copy, so a caller holding a read never sees a later write change it.
  return structuredClone({
    week,
    timeZone: records.timeZone,
    days: refs.map((ref) => readSetUpDay(records, ref)),
  });
}
