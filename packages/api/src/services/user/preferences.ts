import { eq } from "drizzle-orm";

import { users, type RlsClient } from "@syn/db";
import type { UpdatePreferencesInput } from "@syn/validators";

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
    updatedAt: new Date(),
  };

  const rows = await rls.execute((tx) =>
    tx
      .update(users)
      .set(patch)
      .where(eq(users.id, userId))
      .returning(PREFERENCE_COLUMNS),
  );

  return rows[0] ?? null;
}
