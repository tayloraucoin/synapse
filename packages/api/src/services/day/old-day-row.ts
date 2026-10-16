import { and, eq } from "drizzle-orm";

import { days, users, type RlsClient } from "@syn/db";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

/**
 * The old plan row for a date (USE-96), made on demand: the morning lines
 * live in its columns and a journal entry hangs off its id. Nothing else of
 * the old model is read or written here. A missing row is created with the
 * account's current zone, close time and usual wake, as the old journal did;
 * `ON CONFLICT DO NOTHING` then a read, so two first writes share one row.
 */
export async function ensureOldDayRow(
  tx: Tx,
  userId: string,
  date: string,
): Promise<string> {
  const ofDate = and(eq(days.userId, userId), eq(days.date, date));
  const [existing] = await tx
    .select({ id: days.id })
    .from(days)
    .where(ofDate)
    .limit(1);
  if (existing) return existing.id;

  const [account] = await tx
    .select({
      timezone: users.timezone,
      dayCloseTime: users.dayCloseTime,
      usualWakeTime: users.usualWakeTime,
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);
  if (!account) throw new Error("No account row.");

  await tx
    .insert(days)
    .values({
      userId,
      date,
      anchorTime: account.usualWakeTime,
      timezone: account.timezone,
      dayCloseTime: account.dayCloseTime,
    })
    .onConflictDoNothing({ target: [days.userId, days.date] });

  const [row] = await tx.select({ id: days.id }).from(days).where(ofDate).limit(1);
  if (!row) throw new Error("days insert read back no row");
  return row.id;
}
