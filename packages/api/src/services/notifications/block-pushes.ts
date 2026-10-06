import { and, eq, gt, inArray, isNotNull } from "drizzle-orm";

import { dayBlocks, type RlsClient } from "@syn/db";

/**
 * The block-boundary pushes — UX v1.1 §9 (N1a *block_start*, N1c
 * *fixture_start*, N1d *devices_off*).
 *
 * THIS IS THE SEAM `confirmDay` CALLS at the moment v1.1 §5.4 says the
 * transition pushes are enqueued. Under DYN-20's ruling there is nothing
 * to write: Phase 1's notifications are a scan, not a queue — USE-8's
 * scheduler reads each fifteen-minute window and `claimDelivery` keys each
 * send on `(kind, target, scheduled_for)` — and "enqueued at the pick" is
 * the scan's condition, `days.confirmed_at IS NOT NULL` on every block and
 * item start (`jobs/notify.ts`, `notifyStarts`). A queue would be a second
 * delivery model with its own exactly-once to keep.
 *
 * What this reports is what the scans will find: the block boundaries still
 * ahead on the day just set, so `confirmDay`'s return says something true.
 */
const BLOCK_START_KINDS = ["prep", "training", "work", "break", "activity", "wind_down"] as const;

export async function enqueueBlockPushes(
  rls: RlsClient,
  userId: string,
  dayId: string,
  now: Date = new Date(),
): Promise<{ enqueued: number; dayId: string }> {
  const ahead = await rls.execute((tx) =>
    tx
      .select({ id: dayBlocks.id })
      .from(dayBlocks)
      .where(
        and(
          eq(dayBlocks.userId, userId),
          eq(dayBlocks.dayId, dayId),
          inArray(dayBlocks.kind, [...BLOCK_START_KINDS]),
          inArray(dayBlocks.state, ["planned", "set"]),
          isNotNull(dayBlocks.scheduledStart),
          gt(dayBlocks.scheduledStart, now),
        ),
      ),
  );
  return { enqueued: ahead.length, dayId };
}
