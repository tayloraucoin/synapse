import type { z } from "zod";
import {
  occursOn,
  parseRule,
  thisWeekDates,
  usualChangeReach,
  weekdayIndex,
} from "@syn/utils";
import type {
  BlockItemRecord,
  BlockRecord,
  PlannerWriteOutput,
  WriteScopeInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import type { WriteJournal, WriteRows } from "./write-journal";

/**
 * What every planner plan shares (USE-92), each as the fixture server has it
 * (`lib/fixtures/planner/index.ts`), so a refusal reads the same words live
 * as on fixtures: the lookups, the on-date test, the patch and the reach.
 */

export type WriteScope = WriteScopeInput;

/** What a plan hands back: the row it made or changed, and its reach. */
export interface PlanOut {
  id?: string;
  reach?: { weekday: number; changedOn?: ReadonlySet<string> };
}

/** The schema's first words, as a refusal "invalid" (the fixture's `parse`). */
export function parseOrRefuse<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
): z.output<S> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    throw refuse(
      "invalid",
      parsed.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return parsed.data;
}

/** Only the keys sent change; `null` clears. */
export function patch<T extends object>(row: T, change: object): T {
  const next = { ...row };
  for (const [key, value] of Object.entries(change)) {
    if (value !== undefined) Object.assign(next, { [key]: value });
  }
  return next;
}

/** A look field written: absent keeps what the row had, null clears it. */
export function lookOf<T>(
  next: T | null | undefined,
  had: T | null | undefined,
) {
  return next === undefined ? (had ?? null) : next;
}

export function blockOn(block: BlockRecord, dateKey: string): boolean {
  if (block.rrule === null) return block.onDate === dateKey;
  const parsed = parseRule(block.rrule);
  return parsed.ok && occursOn(parsed.rule, dateKey);
}

/** RLS keeps another user's block out of `rows`, so it reads as unknown. */
export function findBlock(rows: WriteRows, id: string): BlockRecord {
  const block = rows.blocks.find((b) => b.id === id);
  if (!block) throw refuse("unknown", "No block with that id.");
  return block;
}

export function findItem(rows: WriteRows, id: string): BlockItemRecord {
  const item = rows.blockItems.find((i) => i.id === id);
  if (!item) throw refuse("unknown", "No item with that id.");
  return item;
}

export function requireOn(block: BlockRecord, dateKey: string) {
  if (!blockOn(block, dateKey)) {
    throw refuse("not-on-date", "That block is not on that date.");
  }
}

/** Dates on which a block has its own change. */
export function changedDates(rows: WriteRows, blockId: string): Set<string> {
  return new Set(
    rows.blockChanges.filter((c) => c.blockId === blockId).map((c) => c.onDate),
  );
}

/** A date's own Up at, else its weekday's, else the account's usual wake. */
function upAtOn(rows: WriteRows, dateKey: string): string {
  const own = rows.dayBounds.find((row) => row.onDate === dateKey);
  if (own) return own.upAt;
  const weekday = weekdayIndex(dateKey);
  return (
    rows.dayBounds.find((row) => row.weekday === weekday)?.upAt ??
    rows.usualWakeTime
  );
}

/** C-USE-set-my-days-4: this week's date a usual change reaches, or none. */
export function reachOf(
  journal: WriteJournal,
  weekday: number,
  changedOn: ReadonlySet<string> = new Set(),
): NonNullable<PlannerWriteOutput["reach"]> {
  const { rows } = journal;
  const now = journal.now();
  const { follows } = usualChangeReach({
    weekday,
    weekDates: thisWeekDates(now, rows.timeZone),
    now,
    timeZone: rows.timeZone,
    upAtOn: (date) => upAtOn(rows, date),
    changedOn,
  });
  return { weekday, follows };
}

/** The usual weekday's reach for a block, when the edit was made on one. */
export function blockReach(
  rows: WriteRows,
  scope: WriteScope | undefined,
  blockId: string,
): PlanOut["reach"] {
  return (
    scope && { weekday: scope.weekday, changedOn: changedDates(rows, blockId) }
  );
}
