import { and, eq } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";
import {
  computeShiftFit,
  dayWindow,
  overMinutes,
  type ShiftItem,
} from "@syn/utils";

/**
 * The read behind SF-01's preview AND behind the write — official spec §5.6.
 *
 * ONE FUNCTION, TWO CALLERS. `shift.preview` renders from this and
 * `shift.apply` recomputes from it before writing a single row, so the sheet
 * cannot promise a move the database then declines to make. The arithmetic
 * itself lives in `@syn/utils` (`computeShiftFit`), pure and probed; this file
 * is the part that knows about tables.
 *
 * THE STALENESS CHECK IS THE DAY'S OWN CLOCK. A preview is a statement about a
 * day at a moment — finish an item while the sheet is open and the set that
 * moves changes underneath it. `fingerprint` is the day's row count and its
 * latest `updated_at`; `apply` compares and refuses with `CONFLICT` rather than
 * writing a plan the person never saw.
 */

export class DayChangedError extends Error {
  constructor() {
    super("the day changed since the preview");
    this.name = "DayChangedError";
  }
}

export type ShiftPreview = {
  dayId: string;
  deltaMin: number;
  /** How many items move, and how many done ones stay put. */
  moving: number;
  doneStaying: number;
  overflow: Array<{ id: string; newStart: Date | null; newEnd: Date | null }>;
  passedHardIds: string[];
  suggestedCutIds: string[];
  /** Minutes still over with the suggested set cut — usually zero. */
  overMin: number;
  fingerprint: string;
};

type Row = {
  id: string;
  priority: number;
  durationMin: number | null;
  scheduledStart: Date | null;
  scheduledEnd: Date | null;
  scheduling: "hard" | "soft";
  assignmentState: string;
  completionState: string;
  deferredAt: Date | null;
  updatedAt: Date;
};

/** The rows a shift can see, plus the day's own snapshot. */
export async function readShiftContext(
  rls: RlsClient,
  userId: string,
  dateKey: string,
): Promise<{
  day: { id: string; timezone: string; dayCloseTime: string; closedAt: Date | null };
  rows: Row[];
} | null> {
  return rls.execute(async (tx) => {
    const [day] = await tx
      .select({
        id: days.id,
        timezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
        closedAt: days.closedAt,
      })
      .from(days)
      .where(and(eq(days.userId, userId), eq(days.date, dateKey)))
      .limit(1);

    if (!day) return null;

    const rows = await tx
      .select({
        id: dayItems.id,
        priority: dayItems.priority,
        durationMin: dayItems.durationMin,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
        scheduling: dayItems.scheduling,
        assignmentState: dayItems.assignmentState,
        completionState: dayItems.completionState,
        deferredAt: dayItems.deferredAt,
        updatedAt: dayItems.updatedAt,
      })
      .from(dayItems)
      .where(and(eq(dayItems.dayId, day.id), eq(dayItems.userId, userId)));

    return { day, rows: rows as Row[] };
  });
}

/**
 * A row as the fit function sees it.
 *
 * `touched` IS THE UNION OF EVERY REASON NOT TO MOVE SOMETHING: done, running,
 * carried, missed, awaiting review, or deferred. Only an `upcoming`, undeferred
 * item is still a plan, and a plan is the only thing a shift may rewrite.
 */
export function toShiftItem(row: Row): ShiftItem {
  return {
    id: row.id,
    priority: row.priority,
    durationMin: row.durationMin,
    scheduledStart: row.scheduledStart,
    scheduledEnd: row.scheduledEnd,
    scheduling: row.scheduling,
    touched: row.completionState !== "upcoming" || row.deferredAt !== null,
    assigned: row.assignmentState === "assigned",
  };
}

/** The day's shape at this instant — compared before a write. */
export function fingerprintOf(rows: readonly Row[]): string {
  const latest = rows.reduce(
    (max, row) => Math.max(max, row.updatedAt.getTime()),
    0,
  );
  return `${rows.length}:${latest}`;
}

export async function previewShift(
  rls: RlsClient,
  userId: string,
  input: { date: string; deltaMin: number },
  now: Date = new Date(),
): Promise<ShiftPreview | null> {
  const context = await readShiftContext(rls, userId, input.date);
  if (context === null) return null;

  const items = context.rows.map(toShiftItem);
  const window = dayWindow(
    input.date,
    context.day.timezone,
    context.day.dayCloseTime,
  );

  const fit = computeShiftFit({
    items,
    deltaMin: input.deltaMin,
    windowEnd: window.end,
    now,
  });

  const suggested = new Set(fit.suggestedCutIds);

  return {
    dayId: context.day.id,
    deltaMin: input.deltaMin,
    moving: fit.movingIds.length,
    // The copy names DONE items specifically; a running one is not "stayed
    // where it was", it is happening.
    doneStaying: context.rows.filter(
      (row) =>
        row.assignmentState === "assigned" && row.completionState === "done",
    ).length,
    overflow: fit.overflow,
    passedHardIds: fit.passedHardIds,
    suggestedCutIds: fit.suggestedCutIds,
    overMin: overMinutes(fit.overflow, items, suggested),
    fingerprint: fingerprintOf(context.rows),
  };
}
