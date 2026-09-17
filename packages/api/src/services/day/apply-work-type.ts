import { and, eq, inArray, isNull } from "drizzle-orm";

import { dayBlocks, dayItems, days, templates, type RlsClient } from "@syn/db";

import {
  anchorIsHardFor,
  materializeInTx,
  readDay,
  readDayBlocks,
  readDayProfile,
  type BlockAssignment,
  type MaterializeResult,
} from "./materialize-day";
import { isUntouchedItem } from "./untouched";

/**
 * *Working today* — UX v1.2 §3.9, R40, TD-19 (RUN-6).
 *
 * A *Rarely* day has no work block; the Today header's row offers the
 * person's work-day types, and a tap applies one. That is a shape change, not
 * an Adjust: nothing is scored, no `shifts` row is written, and the day's own
 * columns say what happened — `work_template_id`, `work_start_time`,
 * `work_end_time` and `anchor_is_hard` from the type (TD-21's snapshot, so an
 * edit to the type tomorrow never moves a day already lived).
 *
 * THE MATERIALISER DOES THE WORK. The day's other blocks are handed back to
 * `materializeInTx` exactly as they are, so they reconcile to themselves —
 * the one new assignment is the work block, whose fixtures for the weekday
 * land as pins by the same pass every day uses — and `layOutDay` runs once.
 *
 * THE REVERSE IS NOT A DELETE. `removeWorkType` leaves the block as
 * `not_today` and its items *not assigned* — the same state a trim leaves,
 * excluded from the number, never hidden — and nulls the four columns so the
 * profile's anchors are the day's again. Applying a type to a day that was
 * un-worked revives that block rather than adding a second one.
 *
 * NOTHING DETECTS. Both run from a tap; neither is called by a job or a read.
 */

export type WorkTypeCode =
  | "closed"
  | "past"
  | "already_working"
  | "not_working"
  | "no_such_template"
  | "not_work_type";

export class WorkTypeError extends Error {
  readonly code: WorkTypeCode;
  constructor(code: WorkTypeCode) {
    super(code);
    this.name = "WorkTypeError";
    this.code = code;
  }
}

export type WorkTypeContext = {
  /** The person's today, by their zone — a past day is a record and is refused. */
  todayKey: string;
};

const clock = (time: string | null): string | null => (time === null ? null : time.slice(0, 5));

export async function applyWorkType(
  rls: RlsClient,
  userId: string,
  input: { date: string; templateId: string },
  context: WorkTypeContext,
): Promise<MaterializeResult> {
  if (input.date < context.todayKey) throw new WorkTypeError("past");

  return rls.execute(async (tx) => {
    const [type] = await tx
      .select({
        id: templates.id,
        kind: templates.kind,
        anchorTime: templates.anchorTime,
        workEndTime: templates.workEndTime,
        anchorDirection: templates.anchorDirection,
      })
      .from(templates)
      .where(
        and(eq(templates.id, input.templateId), eq(templates.userId, userId), isNull(templates.archivedAt)),
      )
      .limit(1);
    if (!type) throw new WorkTypeError("no_such_template");
    if (type.kind !== "work") throw new WorkTypeError("not_work_type");

    const day = await readDay(tx, userId, input.date);
    if (day?.closedAt) throw new WorkTypeError("closed");

    const existing = day ? await readDayBlocks(tx, userId, day.id) : [];
    const work = existing.filter((row) => row.kind === "work");
    const working = day?.workTemplateId !== null && day?.workTemplateId !== undefined;
    if (working || work.some((row) => row.state !== "not_today")) {
      throw new WorkTypeError("already_working");
    }

    // A block un-worked earlier today comes back rather than doubling.
    for (const row of work) {
      await tx
        .update(dayBlocks)
        .set({ state: "planned", updatedAt: new Date() })
        .where(eq(dayBlocks.id, row.id));
      const parked = row.items.filter((item) => item.assignmentState === "not_assigned").map((item) => item.id);
      if (parked.length > 0) {
        await tx
          .update(dayItems)
          .set({ assignmentState: "assigned", updatedAt: new Date() })
          .where(inArray(dayItems.id, parked));
      }
    }

    const profile = await readDayProfile(tx, userId);
    const blocks: BlockAssignment[] = existing
      .filter((row) => row.kind !== "work")
      .map((row) => ({
        kind: row.kind,
        templateId: row.state === "pooled" ? "pool" : row.templateId,
      }));
    blocks.push({ kind: "work", templateId: type.id });

    const { result } = await materializeInTx(tx, userId, {
      date: input.date,
      blocks,
      shape: "structured",
      anchors: {
        workTemplateId: type.id,
        workStartTime: clock(type.anchorTime) ?? clock(profile.workStartTime),
        workEndTime: clock(type.workEndTime) ?? clock(profile.workEndTime),
        anchorIsHard: anchorIsHardFor(type.anchorDirection ?? profile.anchorDirection),
      },
      // The anchor moved; every row with a time takes the new walk (WK-02's one case).
      recomputeTouchedTimes: true,
    });
    return result;
  });
}

export async function removeWorkType(
  rls: RlsClient,
  userId: string,
  input: { date: string },
  context: WorkTypeContext,
): Promise<MaterializeResult> {
  if (input.date < context.todayKey) throw new WorkTypeError("past");

  return rls.execute(async (tx) => {
    const day = await readDay(tx, userId, input.date);
    if (!day) throw new WorkTypeError("not_working");
    if (day.closedAt) throw new WorkTypeError("closed");
    if (day.workTemplateId === null) throw new WorkTypeError("not_working");

    const blocks = await readDayBlocks(tx, userId, day.id);
    for (const row of blocks) {
      if (row.kind !== "work") continue;
      await tx
        .update(dayBlocks)
        .set({ state: "not_today", updatedAt: new Date() })
        .where(eq(dayBlocks.id, row.id));
      // Untouched items park; a started or done one is a record and stays as it is.
      const parkable = row.items.filter(isUntouchedItem).map((item) => item.id);
      if (parkable.length > 0) {
        await tx
          .update(dayItems)
          .set({ assignmentState: "not_assigned", updatedAt: new Date() })
          .where(inArray(dayItems.id, parkable));
      }
    }

    await tx
      .update(days)
      .set({
        workTemplateId: null,
        workStartTime: null,
        workEndTime: null,
        anchorIsHard: null,
        updatedAt: new Date(),
      })
      .where(eq(days.id, day.id));

    const { result } = await materializeInTx(tx, userId, {
      date: input.date,
      blocks: "keep",
      recomputeTouchedTimes: true,
    });
    return result;
  });
}
