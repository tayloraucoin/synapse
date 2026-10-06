import { eq } from "drizzle-orm";

import { notificationPrefs, users, type RlsClient } from "@syn/db";
import { BLOCK_KINDS, NOTIFICATION_CATALOGUE } from "@syn/constants";
import type { BlockKind, NotificationKind } from "@syn/types";

import { effectiveEveningTimes } from "../user/preferences";

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
 * `item_start` IS A PREFERENCE PER BLOCK (UX v1.1 §9.3, R19, DYN-20): the
 * rows for it are `(item_start, block_kind)`, one per kind with items, and
 * `itemStartBlocks` is what *Every item in…* renders. The catalogue row for
 * `item_start` with no block is the v1.0 switch; it stays in `rows` for the
 * shape's sake and nothing reads it.
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
  /** *Every item in…* — one switch per block kind with items; orient has none. */
  itemStartBlocks: Array<{ blockKind: BlockKind; enabled: boolean }>;
  reviewReminderTime: string;
  /** UX v1.2 §9 N2 (RUN-11): the effective time (the person's, or an hour before phone away) and the profile switch. */
  journalReminderTime: string | null;
  journalReminderEnabled: boolean;
  journalEnabled: boolean;
  weekBuildReminderWeekday: number;
  weekBuildReminderTime: string;
};

/** The kinds *Every item in…* offers — orient's one item is the person's own words. */
export const ITEM_START_BLOCK_KINDS: readonly BlockKind[] = BLOCK_KINDS.filter(
  (kind) => kind !== "orient",
);

export async function listNotificationPrefs(
  rls: RlsClient,
  userId: string,
  phase: 1 | 2 = 1,
): Promise<NotificationPrefs> {
  return rls.execute(async (tx) => {
    const stored = await tx
      .select({
        kind: notificationPrefs.kind,
        blockKind: notificationPrefs.blockKind,
        enabled: notificationPrefs.enabled,
      })
      .from(notificationPrefs)
      .where(eq(notificationPrefs.userId, userId));

    const byKind = new Map(
      stored.filter((row) => row.blockKind === null).map((row) => [row.kind, row.enabled]),
    );
    const itemStartByBlock = new Map(
      stored
        .filter((row) => row.kind === "item_start" && row.blockKind !== null)
        .map((row) => [row.blockKind as BlockKind, row.enabled]),
    );

    const [account] = await tx
      .select({
        reviewReminderTime: users.reviewReminderTime,
        weekBuildReminderWeekday: users.weekBuildReminderWeekday,
        weekBuildReminderTime: users.weekBuildReminderTime,
        journalReminderTime: users.journalReminderTime,
        journalReminderEnabled: users.journalReminderEnabled,
        journalEnabled: users.journalEnabled,
        devicesOffTime: users.devicesOffTime,
        lightsOutTime: users.lightsOutTime,
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
      // Off unless the person turned a block on — R19's default.
      itemStartBlocks: ITEM_START_BLOCK_KINDS.map((blockKind) => ({
        blockKind,
        enabled: itemStartByBlock.get(blockKind) ?? false,
      })),
      reviewReminderTime: account?.reviewReminderTime ?? "21:00",
      weekBuildReminderWeekday: account?.weekBuildReminderWeekday ?? 6,
      weekBuildReminderTime: account?.weekBuildReminderTime ?? "18:00",
      journalReminderTime: account ? effectiveEveningTimes(account).journalReminderTimeEffective : null,
      journalReminderEnabled: account?.journalReminderEnabled ?? true,
      journalEnabled: account?.journalEnabled ?? true,
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
 * writes `block_kind = null`; `item_start` writes the block (DYN-20).
 */
export async function setNotificationPref(
  rls: RlsClient,
  userId: string,
  input: { kind: NotificationKind; enabled: boolean; blockKind?: BlockKind | null },
): Promise<{ kind: NotificationKind; enabled: boolean; blockKind: BlockKind | null }> {
  const blockKind = input.kind === "item_start" ? (input.blockKind ?? null) : null;
  await rls.execute((tx) =>
    tx
      .insert(notificationPrefs)
      .values({
        userId,
        kind: input.kind,
        enabled: input.enabled,
        blockKind,
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

  return { kind: input.kind, enabled: input.enabled, blockKind };
}
