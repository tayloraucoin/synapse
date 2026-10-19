import type { RlsClient } from "@syn/db";
import { dateKeyIn } from "@syn/utils";
import type { BuiltPayload } from "../notifications/build-payload";
import {
  claimDelivery,
  sendClaimed,
  type DeliveryTarget,
} from "../notifications/deliver";

/**
 * The window a push job scans, and the claim-then-send it does (USE-105).
 *
 * THE WINDOW IS `(from, to]`, `to` the run's own time and `from` one interval
 * and a minute before it. The cron runs every 5 minutes (C12), so the minute
 * of overlap covers a tick that fires a little late; whatever both runs see
 * collides on `notification_deliveries_key` and is sent once.
 */

/** The cron's interval (`apps/web/vercel.json`, C12). */
export const SCHEDULER_INTERVAL_MS = 5 * 60_000;
/** A late tick's slack; the deliveries key dedupes what it overlaps. */
export const WINDOW_OVERLAP_MS = 60_000;

export type PushWindow = { from: Date; to: Date };

export function pushWindow(now: Date): PushWindow {
  return {
    from: new Date(now.getTime() - SCHEDULER_INTERVAL_MS - WINDOW_OVERLAP_MS),
    to: now,
  };
}

export function inWindow(at: Date, window: PushWindow): boolean {
  return (
    at.getTime() > window.from.getTime() && at.getTime() <= window.to.getTime()
  );
}

/** The calendar dates the window touches in the zone: one, or two across midnight. */
export function windowDates(window: PushWindow, timeZone: string): string[] {
  return [
    ...new Set([
      dateKeyIn(window.from, timeZone),
      dateKeyIn(window.to, timeZone),
    ]),
  ];
}

/**
 * The two halves of a delivery, passed in so a job is proved over rows in
 * memory: `claim` inserts the deliveries row (ON CONFLICT DO NOTHING) and
 * returns it, or why there is none; `send` fans out and settles the rows.
 */
export type PushDeps = {
  claim: (
    target: DeliveryTarget,
  ) => Promise<{ id: string } | "duplicate" | "skipped">;
  send: (rowIds: readonly string[], payload: BuiltPayload) => Promise<void>;
};

/** The real halves, inside the account's RLS client. */
export function rlsPushDeps(
  rls: RlsClient,
  userId: string,
  now: Date,
): PushDeps {
  return {
    claim: (target) => claimDelivery(rls, userId, target, now),
    send: (rowIds, payload) => sendClaimed(rls, userId, rowIds, payload, now),
  };
}
