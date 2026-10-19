import { and, eq, inArray, isNull } from "drizzle-orm";
import { buildServiceRoleAuthContext } from "@syn/auth";
import {
  blockChanges,
  blocks,
  createRlsClient,
  db,
  slotEvents,
  slots,
  users,
} from "@syn/db";
import { createLogger } from "@syn/observability";
import { readDay, type DayBlock, type DayBlockChange } from "@syn/utils";
import {
  blockStartPayload,
  groupedStartPayload,
  type BuiltPayload,
} from "../notifications/build-payload";
import { atMinute } from "../notifications/deliver";
import {
  inWindow,
  pushWindow,
  rlsPushDeps,
  windowDates,
  type PushDeps,
  type PushWindow,
} from "./push-window";
import type { ScheduledJob } from "./run-scheduled-jobs";

/**
 * `block_start` (USE-105): a block with `notify`, pushed at its start on the
 * date, to the phone and the desk.
 *
 * THE DAY IS READ AS USE-91 READS IT (`readDay`): the block's rule for the
 * date, that date's `block_changes` (a skip sends nothing; a move sends at
 * the moved time), and its slots.
 *
 * NEVER FOR ONE ALREADY UNDER WAY: a block with a slot that has an event or
 * is done that date was started early, or is complete, and sends nothing
 * [ASSUMPTION: "started" is any slot event or done slot in it that date].
 *
 * SAME-MINUTE STARTS ARE ONE PUSH (DYN-20's grouping): every block is claimed
 * on its own row, then one sentence names those claimed.
 *
 * THE ONE RLS BYPASS IS NAMED, as `expire-exports` names it: the scan for
 * accounts with a notifying block uses the singleton `db` and reads user ids
 * alone; every row after it is read under `buildServiceRoleAuthContext`.
 */

const log = createLogger("jobs/block-starts");

export type NotifyBlock = DayBlock & { name: string; notify: boolean };

export type BlockSlot = {
  id: string;
  blockId: string;
  onDate: string;
  sortOrder: number;
  doneAt: Date | null;
};

export type DueStart = { blockId: string; name: string; startsAt: Date };

/** The notifying blocks that start in the window and are not under way. */
export function dueBlockStarts(input: {
  blocks: readonly NotifyBlock[];
  changes: readonly DayBlockChange[];
  slots: readonly BlockSlot[];
  /** Slot ids with any event. */
  slotsWithEvents: ReadonlySet<string>;
  timeZone: string;
  window: PushWindow;
}): DueStart[] {
  const due: DueStart[] = [];
  for (const dateKey of windowDates(input.window, input.timeZone)) {
    const day = readDay({
      dateKey,
      timeZone: input.timeZone,
      blocks: input.blocks.filter((block) => block.notify),
      changes: input.changes,
      slots: input.slots,
    });
    for (const occurrence of day.blocks) {
      if (!inWindow(occurrence.start, input.window)) continue;
      const underWay = occurrence.slots.some(
        (slot) => slot.doneAt !== null || input.slotsWithEvents.has(slot.id),
      );
      if (underWay) continue;
      due.push({
        blockId: occurrence.block.id,
        name: occurrence.block.name,
        startsAt: occurrence.start,
      });
    }
  }
  return due;
}

/** Claim each, then one push per start minute; returns how many were sent. */
export async function sendBlockStarts(
  due: readonly DueStart[],
  timeZone: string,
  deps: PushDeps,
): Promise<number> {
  const byMinute = new Map<number, DueStart[]>();
  for (const start of due) {
    const minute = atMinute(start.startsAt).getTime();
    byMinute.set(minute, [...(byMinute.get(minute) ?? []), start]);
  }

  let sent = 0;
  for (const group of byMinute.values()) {
    const claimed: Array<{ id: string; start: DueStart }> = [];
    for (const start of group) {
      const claim = await deps.claim({
        kind: "block_start",
        targetId: start.blockId,
        targetKey: null,
        scheduledFor: start.startsAt,
      });
      if (claim !== "duplicate" && claim !== "skipped") {
        claimed.push({ id: claim.id, start });
      }
    }
    const first = claimed[0];
    if (!first) continue;
    // `todayRoute()` in `apps/web/lib/routes.ts`: Now, on the phone.
    const url = "/today";
    const payload: BuiltPayload =
      claimed.length === 1
        ? blockStartPayload({
            name: first.start.name,
            startsAt: first.start.startsAt,
            timeZone,
            url,
          })
        : groupedStartPayload({
            titles: claimed.map((c) => c.start.name),
            startsAt: first.start.startsAt,
            timeZone,
            url,
          });
    await deps.send(
      claimed.map((c) => c.id),
      payload,
    );
    sent += 1;
  }
  return sent;
}

/** `HH:MM` from Postgres's `HH:MM:SS`. */
const clockOf = (value: string) => value.slice(0, 5);
const clockOrNull = (value: string | null) =>
  value === null ? null : clockOf(value);

/** One account's block starts, read and sent under its own RLS client. */
export async function notifyBlockStartsFor(
  userId: string,
  now: Date,
): Promise<number> {
  const rls = createRlsClient(buildServiceRoleAuthContext(userId));
  const window = pushWindow(now);
  const read = await rls.execute(async (tx) => {
    const [account] = await tx
      .select({ timeZone: users.timezone })
      .from(users)
      .where(eq(users.id, userId));
    if (!account) return null;
    const dates = windowDates(window, account.timeZone);
    const blockRows = await tx
      .select({
        id: blocks.id,
        name: blocks.name,
        notify: blocks.notify,
        startsAt: blocks.startsAt,
        endsAt: blocks.endsAt,
        rrule: blocks.rrule,
        onDate: blocks.onDate,
      })
      .from(blocks)
      .where(and(eq(blocks.notify, true), isNull(blocks.archivedAt)));
    const changeRows = await tx
      .select({
        blockId: blockChanges.blockId,
        onDate: blockChanges.onDate,
        skipped: blockChanges.skipped,
        startsAt: blockChanges.startsAt,
        endsAt: blockChanges.endsAt,
        name: blockChanges.name,
      })
      .from(blockChanges)
      .where(inArray(blockChanges.onDate, dates));
    const slotRows = await tx
      .select({
        id: slots.id,
        blockId: slots.blockId,
        onDate: slots.onDate,
        sortOrder: slots.sortOrder,
        doneAt: slots.doneAt,
      })
      .from(slots)
      .where(inArray(slots.onDate, dates));
    const eventRows =
      slotRows.length === 0
        ? []
        : await tx
            .selectDistinct({ slotId: slotEvents.slotId })
            .from(slotEvents)
            .where(
              inArray(
                slotEvents.slotId,
                slotRows.map((slot) => slot.id),
              ),
            );
    return {
      timeZone: account.timeZone,
      blockRows,
      changeRows,
      slotRows,
      eventRows,
    };
  });
  if (read === null) return 0;

  const due = dueBlockStarts({
    blocks: read.blockRows.map((row) => ({
      ...row,
      startsAt: clockOf(row.startsAt),
      endsAt: clockOf(row.endsAt),
      archivedAt: null,
    })),
    changes: read.changeRows.map((row) => ({
      ...row,
      startsAt: clockOrNull(row.startsAt),
      endsAt: clockOrNull(row.endsAt),
    })),
    slots: read.slotRows,
    slotsWithEvents: new Set(read.eventRows.map((row) => row.slotId)),
    timeZone: read.timeZone,
    window,
  });
  return sendBlockStarts(due, read.timeZone, rlsPushDeps(rls, userId, now));
}

export async function notifyBlockStarts(
  now: Date = new Date(),
): Promise<number> {
  // System path: "which accounts anywhere have a notifying block" is no session's question.
  const accounts = await db
    .selectDistinct({ userId: blocks.userId })
    .from(blocks)
    .where(and(eq(blocks.notify, true), isNull(blocks.archivedAt)));

  let sent = 0;
  for (const { userId } of accounts) {
    try {
      sent += await notifyBlockStartsFor(userId, now);
    } catch (error) {
      // One account's failure must not stop the rest.
      log.log("could not send one account's block starts", {
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return sent;
}

export const blockStartsJob: ScheduledJob = {
  name: "block_start",
  run: () => notifyBlockStarts(),
};
