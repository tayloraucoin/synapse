import { z } from "zod";
import { dateKeySchema, weekKeySchema } from "./keys";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  dayBoundsRecord,
  dayEventRecord,
  dayRecordRecord,
  slotEventRecord,
  slotRecord,
} from "./planner";
import { clockTimeSchema } from "./preferences";
import { todoRecord } from "./todo";
import { clientRecord, workItemRecord } from "./work";

/**
 * The planner's two reads (USE-91), composed of the record schemas: what
 * `planner.today` and `planner.week` return, and what the fixture server's
 * `readToday` and `readWeek` return, so the two cannot drift. Records only:
 * occurrences, the clock, fit and Next are derived in the hooks' `select`.
 *
 * In their own file, not `planner.ts`: `todo.ts` and `work.ts` import that
 * one, and composing their records there would make a cycle.
 */

export const dayReadInput = z.object({ dateKey: dateKeySchema });

export type DayReadInput = z.infer<typeof dayReadInput>;

/** One date's read: the date's rows, and the pools the day draws on. */
export const dayReadOutput = z.object({
  date: dateKeySchema,
  timeZone: z.string(),
  /** `[start, end)` from `dayWindow`: the day opens at `day_close_time`. */
  dayWindow: z.object({ start: z.date(), end: z.date() }),
  /** Every block; `readDay` decides which run on the date. */
  blocks: z.array(blockRecord),
  blockChanges: z.array(blockChangeRecord),
  blockItems: z.array(blockItemRecord),
  slots: z.array(slotRecord),
  /** The work pool, slotted or not. */
  workItems: z.array(workItemRecord),
  clients: z.array(clientRecord),
  /** The to-do pool, with the daily reminders. */
  todos: z.array(todoRecord),
  dayEvents: z.array(dayEventRecord),
  /** The events of the date's slots. */
  slotEvents: z.array(slotEventRecord),
  /** The date's orient, Ready, go and close stamps; none before the first open. */
  dayRecord: dayRecordRecord.nullable(),
  /** "Up at", `HH:MM`: the day lays out from the wake against it. */
  usualWakeTime: clockTimeSchema,
});

export type DayReadOutput = z.infer<typeof dayReadOutput>;

/** The usual week, or a dated week by its ISO key (`2026-W42`). */
export const weekRefSchema = z.union([z.literal("usual"), weekKeySchema]);

export const weekReadInput = z.object({ week: weekRefSchema });

export type WeekReadInput = z.infer<typeof weekReadInput>;

/** One day of the set-up area: a usual weekday, or a date. */
export const setUpDayRead = z.object({
  /** Monday 0 … Sunday 6. */
  weekday: z.number().int().min(0).max(6),
  /** The date in a dated week; null in the usual week. */
  date: dateKeySchema.nullable(),
  /** The date's own row, else its weekday's; null when not set. */
  bounds: dayBoundsRecord.nullable(),
  /** The blocks that may run: the weekday's usual ones, or the date's. */
  blocks: z.array(blockRecord),
  /** The date's block changes; none in the usual week. */
  changes: z.array(blockChangeRecord),
  /**
   * The blocks' items: every-date items, and on a date its own; a set item
   * skipped on the date is left out.
   */
  items: z.array(blockItemRecord),
  /** The date's slots, skipped ones included; none in the usual week. */
  slots: z.array(slotRecord),
  /** Events on the date, or repeating on the weekday. */
  events: z.array(dayEventRecord),
  /** The work items and to-dos the date's slots hold. */
  workItems: z.array(workItemRecord),
  todos: z.array(todoRecord),
});

export type SetUpDayRead = z.infer<typeof setUpDayRead>;

export const weekReadOutput = z.object({
  week: weekRefSchema,
  timeZone: z.string(),
  /** Seven days, Monday first. */
  days: z.array(setUpDayRead).length(7),
});

export type WeekReadOutput = z.infer<typeof weekReadOutput>;
