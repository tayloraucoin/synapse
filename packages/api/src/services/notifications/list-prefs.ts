import { eq } from "drizzle-orm";

import { notificationPrefs, users, type RlsClient } from "@syn/db";
import { NOTIFICATION_CATALOGUE } from "@syn/constants";
import type { NotificationKind } from "@syn/types";

/**
 * ST-07's rows — the catalogue merged with whatever the person has said.
 *
 * THE MERGE HAPPENS HERE, not on the client. A missing `notification_prefs`
 * row means the catalogue's default (SET-1's ruling), and a client that had to
 * apply that rule would be a second place it lives — the one place a row for a
 * new kind would be forgotten.
 *
 * PHASE-2 KINDS ARE FILTERED OUT IN PHASE 1. A switch that governs a sender
 * that does not exist is a promise the product cannot keep: someone would turn
 * on *When a window opens*, receive nothing, and reasonably conclude the
 * reminders are broken. They appear with their senders (USE-8).
 *
 * THE TIMES ARE NOT HERE. N4's time is `users.review_reminder_time` and N6's
 * is `week_build_reminder_*` — account scalars, edited by ST-08 as well as
 * this screen. `notification_prefs` holds `enabled` and nothing else, so there
 * is exactly one home for the review-reminder time.
 */
export type NotificationPrefView = {
  kind: NotificationKind;
  n: number;
  enabled: boolean;
};

export type NotificationPrefs = {
  rows: NotificationPrefView[];
  reviewReminderTime: string;
  weekBuildReminderWeekday: number;
  weekBuildReminderTime: string;
};

export async function listNotificationPrefs(
  rls: RlsClient,
  userId: string,
  phase: 1 | 2 = 1,
): Promise<NotificationPrefs> {
  return rls.execute(async (tx) => {
    const stored = await tx
      .select({
        kind: notificationPrefs.kind,
        enabled: notificationPrefs.enabled,
      })
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, userId));

    const byKind = new Map(stored.map((row) => [row.kind, row.enabled]));

    const [account] = await tx
      .select({
        reviewReminderTime: users.reviewReminderTime,
        weekBuildReminderWeekday: users.weekBuildReminderWeekday,
        weekBuildReminderTime: users.weekBuildReminderTime,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return {
      rows: NOTIFICATION_CATALOGUE.filter(
        (entry) => entry.phase <= phase,
      ).map((entry) => ({
        kind: entry.kind,
        n: entry.n,
        enabled: byKind.get(entry.kind) ?? entry.defaultEnabled,
      })),
      reviewReminderTime: account?.reviewReminderTime ?? "21:00",
      weekBuildReminderWeekday: account?.weekBuildReminderWeekday ?? 6,
      weekBuildReminderTime: account?.weekBuildReminderTime ?? "18:00",
    };
  });
}

/**
 * One switch. Upsert rather than update: the first time a person disagrees
 * with a default there is no row to change, and an update that matched nothing
 * would report success and change nothing.
 *
 * THE CONFLICT TARGET INCLUDES `block_kind` since 0005 (UX v1.1 §9.3): the
 * unique constraint is `(user_id, kind, block_kind) NULLS NOT DISTINCT`, and a
 * target that names only two of its columns matches no arbiter and fails at
 * runtime with "no unique or exclusion constraint matching". Every v1.0 kind
 * writes `block_kind = null`; DYN-20 writes a block for `item_start`.
 */
export async function setNotificationPref(
  rls: RlsClient,
  userId: string,
  input: { kind: NotificationKind; enabled: boolean },
): Promise<{ kind: NotificationKind; enabled: boolean }> {
  await rls.execute((tx) =>
    tx
      .insert(notificationPrefs)
      .values({
        userId,
        kind: input.kind,
        enabled: input.enabled,
        blockKind: null,
      })
      .onConflictDoUpdate({
        target: [
          notificationPrefs.userId,
          notificationPrefs.kind,
          notificationPrefs.blockKind,
        ],
        set: { enabled: input.enabled, updatedAt: new Date() },
      }),
  );

  return input;
}
