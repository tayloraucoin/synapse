/**
 * One week of Google events into `google_event_snapshots` (USE-103), per
 * account. Read-only: nothing is written to Google. Network calls run
 * outside any transaction; each write is its own `rls.execute`.
 *
 * Per account: an access token (invalid_grant: Reconnect, skipped), the
 * calendar list (rows upserted, switches kept), every listed calendar's
 * events for `[Monday 00:00, next Monday 00:00)` in the account's zone, then
 * one upsert of the week's snapshot and `last_synced_at`. Every calendar is
 * fetched, not only the ones on, so a switch turned on shows its events on
 * the next read without a sync [ASSUMPTION]. A failure past the token
 * (a refused call, a payload that does not parse) sets `last_sync_error`
 * and leaves the last snapshot as it was.
 *
 * `ensureGoogleWeek` is the cadence's side: the day column's read asks for
 * its week, and an account whose snapshot is missing or older than two
 * minutes is synced first (the client refetches on focus after two minutes
 * and every five while visible, as Linear's). One sync per account and week
 * at a time in this instance.
 */
import { and, eq, sql } from "drizzle-orm";
import {
  googleAccounts,
  googleEventSnapshots,
  users,
  type RlsClient,
} from "@syn/db";
import { addDays, wallClockToInstant } from "@syn/utils";
import {
  googleSnapshotPayload,
  type GoogleSnapshotEvent,
} from "@syn/validators";
import { liveCalendars, writeCalendars } from "./calendars";
import {
  createGoogleCalendarClient,
  GoogleApiError,
  GooglePayloadError,
  type GoogleClientDeps,
} from "./client";
import { snapshotEventOf } from "./events";
import type { FetchLike } from "./oauth";
import type { GoogleTokenStore } from "./token-store";
import {
  GOOGLE_RECONNECT_MESSAGE,
  googleAccessToken,
  GoogleReconnectNeeded,
} from "./tokens";

export const GOOGLE_STALE_MS = 2 * 60_000;
export const GOOGLE_SYNC_FAILED_MESSAGE = "Not synced";

export interface GoogleSyncDeps {
  store: GoogleTokenStore;
  fetch: FetchLike;
  key: Buffer;
  clientId: string;
  clientSecret: string;
  now?: () => Date;
  sleep?: GoogleClientDeps["sleep"];
}

/** The week's edges in the account's zone, RFC 3339 (an exclusive end). */
export function weekBounds(
  monday: string,
  timeZone: string,
): { timeMin: string; timeMax: string } {
  return {
    timeMin: wallClockToInstant(monday, "00:00", timeZone).toISOString(),
    timeMax: wallClockToInstant(
      addDays(monday, 7),
      "00:00",
      timeZone,
    ).toISOString(),
  };
}

export type GoogleSyncResult = "synced" | "reconnect" | "failed";

/** One account's week: Google's calendars and events, then the snapshot. */
export async function syncGoogleAccountWeek(
  rls: RlsClient,
  userId: string,
  accountId: string,
  monday: string,
  timeZone: string,
  deps: GoogleSyncDeps,
): Promise<GoogleSyncResult> {
  let accessToken: string;
  try {
    accessToken = await googleAccessToken(accountId, deps);
  } catch (error) {
    if (error instanceof GoogleReconnectNeeded) return "reconnect";
    throw error;
  }

  const now = deps.now?.() ?? new Date();
  try {
    const client = createGoogleCalendarClient(accessToken, {
      fetch: deps.fetch,
      sleep: deps.sleep,
    });
    const entries = await client.listCalendars();
    const bounds = weekBounds(monday, timeZone);
    const events: GoogleSnapshotEvent[] = [];
    for (const calendar of liveCalendars(entries)) {
      const items = await client.listEvents({
        calendarId: calendar.id,
        ...bounds,
        timeZone,
      });
      for (const item of items) {
        const kept = snapshotEventOf(calendar.id, item);
        if (kept) events.push(kept);
      }
    }
    const payload = googleSnapshotPayload.parse({ events });

    await writeCalendars(rls, userId, accountId, entries);
    await rls.execute(async (tx) => {
      await tx
        .insert(googleEventSnapshots)
        .values({
          userId,
          accountId,
          weekStart: monday,
          payload,
          fetchedAt: now,
        })
        .onConflictDoUpdate({
          target: [
            googleEventSnapshots.accountId,
            googleEventSnapshots.weekStart,
          ],
          set: { payload, fetchedAt: now },
        });
      await tx
        .update(googleAccounts)
        .set({ lastSyncedAt: now, lastSyncError: null, updatedAt: sql`now()` })
        .where(eq(googleAccounts.id, accountId));
    });
    return "synced";
  } catch (error) {
    if (
      error instanceof GoogleApiError ||
      error instanceof GooglePayloadError
    ) {
      await deps.store.markSyncError(accountId, GOOGLE_SYNC_FAILED_MESSAGE);
      return "failed";
    }
    throw error;
  }
}

async function accountTimeZone(
  rls: RlsClient,
  userId: string,
): Promise<string> {
  const [row] = await rls.execute((tx) =>
    tx
      .select({ timeZone: users.timezone })
      .from(users)
      .where(eq(users.id, userId)),
  );
  if (!row) throw new Error("No account row.");
  return row.timeZone;
}

const inFlight = new Map<string, Promise<GoogleSyncResult>>();

function once(
  key: string,
  run: () => Promise<GoogleSyncResult>,
): Promise<GoogleSyncResult> {
  const running = inFlight.get(key);
  if (running) return running;
  const started = run().finally(() => inFlight.delete(key));
  inFlight.set(key, started);
  return started;
}

/**
 * Sync the week for every account (Sync now, `force`), or for those whose
 * snapshot is missing or stale. An account waiting on Reconnect is skipped
 * until it is connected again.
 */
export async function ensureGoogleWeek(
  rls: RlsClient,
  userId: string,
  monday: string,
  deps: GoogleSyncDeps,
  options: { force?: boolean } = {},
): Promise<void> {
  const now = deps.now?.() ?? new Date();
  const accounts = await rls.execute((tx) =>
    tx
      .select({
        id: googleAccounts.id,
        lastSyncError: googleAccounts.lastSyncError,
        fetchedAt: googleEventSnapshots.fetchedAt,
      })
      .from(googleAccounts)
      .leftJoin(
        googleEventSnapshots,
        and(
          eq(googleEventSnapshots.accountId, googleAccounts.id),
          eq(googleEventSnapshots.weekStart, monday),
        ),
      ),
  );
  const due = accounts.filter(
    (account) =>
      account.lastSyncError !== GOOGLE_RECONNECT_MESSAGE &&
      (options.force ||
        !account.fetchedAt ||
        now.getTime() - account.fetchedAt.getTime() >= GOOGLE_STALE_MS),
  );
  if (due.length === 0) return;
  const timeZone = await accountTimeZone(rls, userId);
  await Promise.all(
    due.map((account) =>
      once(`${account.id}:${monday}`, () =>
        syncGoogleAccountWeek(rls, userId, account.id, monday, timeZone, deps),
      ),
    ),
  );
}
