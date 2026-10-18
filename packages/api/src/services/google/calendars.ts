/**
 * An account's calendar rows from `calendarList.list` (USE-103), inside RLS.
 * Kept: the id, `summaryOverride ?? summary`, the colour, primary and the
 * access role. A new calendar is on when Google has it selected; one already
 * here keeps Taylor's switch. A calendar Google deleted, or no longer lists,
 * is removed.
 */
import { and, eq, notInArray, sql } from "drizzle-orm";
import { googleCalendars, type RlsClient } from "@syn/db";
import type { GoogleCalendarListEntry } from "@syn/validators";

/** Google's palette default when a calendar has no colour of its own. */
const DEFAULT_COLOR = "#7986cb";

export function liveCalendars(
  entries: readonly GoogleCalendarListEntry[],
): GoogleCalendarListEntry[] {
  return entries.filter((entry) => !entry.deleted);
}

export async function writeCalendars(
  rls: RlsClient,
  userId: string,
  accountId: string,
  entries: readonly GoogleCalendarListEntry[],
): Promise<void> {
  const live = liveCalendars(entries);
  await rls.execute(async (tx) => {
    for (const entry of live) {
      const values = {
        name: entry.summaryOverride ?? entry.summary,
        color: entry.backgroundColor ?? DEFAULT_COLOR,
        primary: entry.primary ?? false,
        accessRole: entry.accessRole,
      };
      await tx
        .insert(googleCalendars)
        .values({
          userId,
          accountId,
          calendarId: entry.id,
          enabled: entry.selected ?? false,
          ...values,
        })
        .onConflictDoUpdate({
          target: [googleCalendars.accountId, googleCalendars.calendarId],
          set: { ...values, updatedAt: sql`now()` },
        });
    }
    const keep = live.map((entry) => entry.id);
    await tx
      .delete(googleCalendars)
      .where(
        keep.length === 0
          ? eq(googleCalendars.accountId, accountId)
          : and(
              eq(googleCalendars.accountId, accountId),
              notInArray(googleCalendars.calendarId, keep),
            ),
      );
  });
}

/** Settings' switch: one calendar on or off. Another person's reads as absent. */
export async function toggleGoogleCalendar(
  rls: RlsClient,
  input: { calendarId: string; enabled: boolean },
): Promise<boolean> {
  const rows = await rls.execute((tx) =>
    tx
      .update(googleCalendars)
      .set({ enabled: input.enabled, updatedAt: sql`now()` })
      .where(eq(googleCalendars.id, input.calendarId))
      .returning({ id: googleCalendars.id }),
  );
  return rows.length > 0;
}
