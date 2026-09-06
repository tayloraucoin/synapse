import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";
import type { UpdatePreferencesInput } from "@syn/validators";
import { addDays, resolveDayKey } from "@syn/utils";

/**
 * The one home for "change my account preferences".
 *
 * It is a service rather than a resolver body because it is already
 * multi-step — build the patch, write, read back — and because the same
 * operation will be reachable from more than one rail: the settings mutation
 * today, and the first-run sequence writing a timezone tomorrow. A rule
 * implemented in two seams is a rule that will diverge in one of them.
 */

export type UserPreferencesRow = {
  id: string;
  email: string | null;
  displayName: string | null;
  timezone: string;
  dayCloseTime: string;
  reviewReminderTime: string;
  /** FR-01 / ST-08. The default `anchor_time` for a new template (SET-5). */
  usualWakeTime: string;
  theme: "system" | "light" | "dark";
  firstRunStep: number | null;
  firstRunCompletedAt: Date | null;
  /**
   * The deferred half of ST-08 (cross-cutting §7.3, §7.5). Non-null means the
   * person has changed the value and it takes effect on `…From`; the screen
   * shows the pending value with *Applies from tomorrow.*, because showing the
   * old one would look like the save failed.
   */
  pendingDayCloseTime: string | null;
  pendingDayCloseTimeFrom: string | null;
  pendingTimezone: string | null;
  pendingTimezoneFrom: string | null;
  /** ST-07's N6 value, and the one server fact about the reminder ask. */
  weekBuildReminderWeekday: number;
  weekBuildReminderTime: string;
  reminderPromptAnsweredAt: Date | null;
};

const PREFERENCE_COLUMNS = {
  id: users.id,
  email: users.email,
  displayName: users.displayName,
  timezone: users.timezone,
  dayCloseTime: users.dayCloseTime,
  reviewReminderTime: users.reviewReminderTime,
  usualWakeTime: users.usualWakeTime,
  theme: users.theme,
  firstRunStep: users.firstRunStep,
  firstRunCompletedAt: users.firstRunCompletedAt,
  pendingDayCloseTime: users.pendingDayCloseTime,
  pendingDayCloseTimeFrom: users.pendingDayCloseTimeFrom,
  pendingTimezone: users.pendingTimezone,
  pendingTimezoneFrom: users.pendingTimezoneFrom,
  weekBuildReminderWeekday: users.weekBuildReminderWeekday,
  weekBuildReminderTime: users.weekBuildReminderTime,
  reminderPromptAnsweredAt: users.reminderPromptAnsweredAt,
} as const;

/** The caller's own row, or null. RLS makes "own" the only reachable answer. */
export async function readPreferences(
  rls: RlsClient,
  userId: string,
): Promise<UserPreferencesRow | null> {
  const rows = await rls.execute((tx) =>
    tx.select(PREFERENCE_COLUMNS).from(users).where(eq(users.id, userId)).limit(1),
  );
  return rows[0] ?? null;
}

/**
 * Writes the given subset and returns the updated row.
 *
 * Returning the row rather than `{ ok: true }` is deliberate: the client cache
 * updates from the response in one round trip instead of a write followed by a
 * refetch, and the caller sees exactly what was stored rather than what it
 * hoped was stored.
 *
 * The `where` clause is belt and braces — RLS already restricts the update to
 * the caller's row — but a mutation with no `where` is one refactor away from
 * being a mutation over the table, and the policy should not be the only thing
 * standing between here and that.
 */
export async function updatePreferences(
  rls: RlsClient,
  userId: string,
  input: UpdatePreferencesInput,
  /** Injectable for a fixed clock; the resolver never passes one. */
  now: Date = new Date(),
): Promise<UserPreferencesRow | null> {
  const patch = {
    ...(input.displayName !== undefined ? { displayName: input.displayName } : {}),
    ...(input.timezone !== undefined ? { timezone: input.timezone } : {}),
    ...(input.dayCloseTime !== undefined
      ? { dayCloseTime: input.dayCloseTime }
      : {}),
    ...(input.reviewReminderTime !== undefined
      ? { reviewReminderTime: input.reviewReminderTime }
      : {}),
    ...(input.theme !== undefined ? { theme: input.theme } : {}),
    ...(input.usualWakeTime !== undefined
      ? { usualWakeTime: input.usualWakeTime }
      : {}),
    // `null` is a real value here — it is how the sequence records "no step
    // owed" — so the guard is against `undefined` alone, as everywhere above.
    ...(input.firstRunStep !== undefined
      ? { firstRunStep: input.firstRunStep }
      : {}),
    ...(input.weekBuildReminderWeekday !== undefined
      ? { weekBuildReminderWeekday: input.weekBuildReminderWeekday }
      : {}),
    ...(input.weekBuildReminderTime !== undefined
      ? { weekBuildReminderTime: input.weekBuildReminderTime }
      : {}),
    ...(input.reminderPromptAnsweredAt !== undefined
      ? { reminderPromptAnsweredAt: input.reminderPromptAnsweredAt }
      : {}),
    updatedAt: new Date(),
  };

  const deferring =
    input.pendingDayCloseTime !== undefined ||
    input.pendingTimezone !== undefined;

  /**
   * The date a deferred change starts applying: the day after the one the
   * person is currently in.
   *
   * IT IS COMPUTED FROM THEIR CURRENT ZONE AND CLOSE TIME, not the new ones.
   * "Has tomorrow arrived" has to be answered in the day they are still living
   * in — the same reason `resolveTodayFor` compares with the old values before
   * promoting. Computing it with the new zone would let a westward move set a
   * boundary that has already passed, applying the change immediately, which
   * is the one thing the pending pair exists to prevent.
   *
   * It is computed on the SERVER and never accepted from the client, so no
   * request can ask for a change that applies retroactively.
   */
  const pendingPatch = deferring
    ? await rls.execute(async (tx) => {
        const [current] = await tx
          .select({
            timezone: users.timezone,
            dayCloseTime: users.dayCloseTime,
          })
          .from(users)
          .where(eq(users.id, userId))
          .limit(1);

        if (!current) return {};

        const from = addDays(
          resolveDayKey(now, current.timezone, current.dayCloseTime),
          1,
        );

        return {
          ...(input.pendingDayCloseTime !== undefined
            ? {
                pendingDayCloseTime: input.pendingDayCloseTime,
                pendingDayCloseTimeFrom: from,
              }
            : {}),
          ...(input.pendingTimezone !== undefined
            ? {
                pendingTimezone: input.pendingTimezone,
                pendingTimezoneFrom: from,
              }
            : {}),
        };
      })
    : {};

  const rows = await rls.execute((tx) =>
    tx
      .update(users)
      .set({ ...patch, ...pendingPatch })
      .where(eq(users.id, userId))
      .returning(PREFERENCE_COLUMNS),
  );

  return rows[0] ?? null;
}
