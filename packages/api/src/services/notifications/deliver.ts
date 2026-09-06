import { and, eq, gte, isNull, lt } from "drizzle-orm";

import { notificationDeliveries, type RlsClient } from "@syn/db";
import type { NotificationKind } from "@syn/types";

import { sendToUser } from "./fan-out";
import type { BuiltPayload } from "./build-payload";

/**
 * Exactly once — the claim official spec §8.1 makes, and the code that keeps
 * it.
 *
 * THE DATABASE DECIDES, NOT THE JOB. Every send inserts a delivery row first
 * and proceeds only if the insert returned one. A cron tick that fires twice,
 * an overlapping window, a retry after a timeout: all of them lose the race to
 * a unique constraint rather than to a job's own carefulness.
 *
 * THE ROW IS WRITTEN EVEN WITH NO SUBSCRIPTION. Somebody who installs the app
 * on Friday must not receive Monday's reminders that evening, all at once, as
 * the first scan finds every past-due minute unsent.
 *
 * TOO LATE IS RECORDED AND DROPPED. §8.1 says "at the time assigned"; a 7:00
 * reminder arriving at 7:40 is not that reminder, it is noise about something
 * the list already shows as passed. The row says `skipped`, which is what
 * answers "why was I not told" later.
 */
export type DeliveryTarget = {
  kind: NotificationKind;
  /** An item or a day. Null for a week. */
  targetId: string | null;
  /** A week key. Null for everything with a row to point at. */
  targetKey: string | null;
  /** Truncated to the minute by `atMinute`. */
  scheduledFor: Date;
};

export type DeliveryOutcome = "sent" | "duplicate" | "skipped" | "no-payload";

/** How late a notification may be and still be the one that was scheduled. */
export const MAX_LATENESS_MS = 15 * 60 * 1000;

/** Seconds and milliseconds off, so two scans of one minute collide. */
export function atMinute(at: Date): Date {
  const minute = new Date(at.getTime());
  minute.setSeconds(0, 0);
  return minute;
}

export async function deliverOnce(
  rls: RlsClient,
  userId: string,
  target: DeliveryTarget,
  payload: BuiltPayload,
  now: Date,
): Promise<DeliveryOutcome> {
  const scheduledFor = atMinute(target.scheduledFor);
  const late = now.getTime() - scheduledFor.getTime() > MAX_LATENESS_MS;

  // The claim on this minute. Losing it means another scan already has it.
  const claimed = await rls.execute((tx) =>
    tx
      .insert(notificationDeliveries)
      .values({
        userId,
        kind: target.kind,
        targetId: target.targetId,
        targetKey: target.targetKey,
        scheduledFor,
        skipped: late,
      })
      .onConflictDoNothing()
      .returning({ id: notificationDeliveries.id }),
  );

  const row = claimed[0];
  if (!row) return "duplicate";
  if (late) return "skipped";

  await sendToUser(
    userId,
    {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      actions: payload.actions,
      actionUrls: payload.actionUrls,
    },
    { ttlSeconds: payload.ttlSeconds },
  );

  await rls.execute((tx) =>
    tx
      .update(notificationDeliveries)
      .set({ sentAt: now })
      .where(eq(notificationDeliveries.id, row.id)),
  );

  return "sent";
}

/**
 * N4's *Later*, once — a second snooze on the same day is refused.
 *
 * The snoozed delivery is a row like any other, an hour on, which the next
 * scan finds due. That is why one mechanism covers both the scheduled
 * reminder and the deferred one: they are the same kind of thing.
 */
export async function snoozeDelivery(
  rls: RlsClient,
  userId: string,
  target: { kind: NotificationKind; targetId: string | null },
  now: Date,
  minutes = 60,
): Promise<{ snoozed: boolean }> {
  const existing = await rls.execute((tx) =>
    tx
      .select({ id: notificationDeliveries.id })
      .from(notificationDeliveries)
      .where(
        and(
          eq(notificationDeliveries.userId, userId),
          eq(notificationDeliveries.kind, target.kind),
          target.targetId === null
            ? isNull(notificationDeliveries.targetId)
            : eq(notificationDeliveries.targetId, target.targetId),
          eq(notificationDeliveries.snoozed, true),
        ),
      )
      .limit(1),
  );

  // Once only. A second *Later* is a person asking to be left alone, and the
  // answer to that is nothing rather than another reminder.
  if (existing.length > 0) return { snoozed: false };

  const rows = await rls.execute((tx) =>
    tx
      .insert(notificationDeliveries)
      .values({
        userId,
        kind: target.kind,
        targetId: target.targetId,
        targetKey: null,
        scheduledFor: atMinute(new Date(now.getTime() + minutes * 60_000)),
        snoozed: true,
      })
      .onConflictDoNothing()
      .returning({ id: notificationDeliveries.id }),
  );

  return { snoozed: rows.length > 0 };
}

/** Snoozed rows that have come due — the N4 job picks these up too. */
export async function dueSnoozed(
  rls: RlsClient,
  userId: string,
  kind: NotificationKind,
  from: Date,
  to: Date,
): Promise<Array<{ id: string; targetId: string | null }>> {
  return rls.execute((tx) =>
    tx
      .select({
        id: notificationDeliveries.id,
        targetId: notificationDeliveries.targetId,
      })
      .from(notificationDeliveries)
      .where(
        and(
          eq(notificationDeliveries.userId, userId),
          eq(notificationDeliveries.kind, kind),
          eq(notificationDeliveries.snoozed, true),
          isNull(notificationDeliveries.sentAt),
          gte(notificationDeliveries.scheduledFor, from),
          lt(notificationDeliveries.scheduledFor, to),
        ),
      ),
  );
}
