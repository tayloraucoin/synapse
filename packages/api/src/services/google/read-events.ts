/**
 * The Google side of the day and week reads (USE-103): the snapshots of the
 * dates' weeks and the calendars that are on, selected inside the
 * transaction `rls.execute` hands it. A calendar turned off drops out on the
 * next read; nothing waits on a sync. A snapshot whose payload does not
 * parse is read as empty.
 */
import { eq, inArray } from "drizzle-orm";
import { googleCalendars, googleEventSnapshots, type RlsClient } from "@syn/db";
import { mondayOf } from "@syn/utils";
import {
  googleSnapshotPayload,
  type GoogleSnapshotEvent,
} from "@syn/validators";
import type { EnabledCalendar } from "./events";

type Tx = Parameters<Parameters<RlsClient["execute"]>[0]>[0];

export interface GoogleSnapshotRow {
  accountId: string;
  /** The week's Monday. */
  weekStart: string;
  events: GoogleSnapshotEvent[];
}

export interface GoogleRows {
  googleSnapshots: GoogleSnapshotRow[];
  googleCalendars: EnabledCalendar[];
}

export async function selectGoogleRows(
  tx: Tx,
  dates: readonly string[],
): Promise<GoogleRows> {
  if (dates.length === 0) return { googleSnapshots: [], googleCalendars: [] };
  const weeks = [...new Set(dates.map(mondayOf))];
  const [snapshots, calendars] = await Promise.all([
    tx
      .select({
        accountId: googleEventSnapshots.accountId,
        weekStart: googleEventSnapshots.weekStart,
        payload: googleEventSnapshots.payload,
      })
      .from(googleEventSnapshots)
      .where(inArray(googleEventSnapshots.weekStart, weeks)),
    tx
      .select({
        id: googleCalendars.id,
        accountId: googleCalendars.accountId,
        calendarId: googleCalendars.calendarId,
      })
      .from(googleCalendars)
      .where(eq(googleCalendars.enabled, true)),
  ]);
  return {
    googleSnapshots: snapshots.map((row) => {
      const parsed = googleSnapshotPayload.safeParse(row.payload);
      return {
        accountId: row.accountId,
        weekStart: row.weekStart,
        events: parsed.success ? parsed.data.events : [],
      };
    }),
    googleCalendars: calendars,
  };
}
