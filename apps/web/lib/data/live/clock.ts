import type { FixtureRecords } from "@/lib/fixtures/records";
import type { TrpcClient } from "@/lib/trpc/client";

/**
 * The live clock's zone (USE-90): the account's timezone and close time
 * (`user.me`), read once in the browser. Until it answers, the device's zone
 * and the schema's default close stand in [ASSUMPTION: the first paint may
 * read the device's day, which is the account's for one person on one zone].
 */

export interface LiveZone {
  timeZone: string;
  dayCloseTime: string;
}

/** `users.day_close_time`'s default, until the account answers. */
const DEFAULT_DAY_CLOSE = "03:00";

export function deviceZone(): LiveZone {
  return {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    dayCloseTime: DEFAULT_DAY_CLOSE,
  };
}

/** The account's zone, "HH:MM" as the day reads it; null when it cannot be read. */
export async function readAccountZone(
  client: TrpcClient,
): Promise<LiveZone | null> {
  try {
    const me = await client.user.me.query();
    return { timeZone: me.timezone, dayCloseTime: me.dayCloseTime.slice(0, 5) };
  } catch {
    return null;
  }
}

/**
 * The live scenario's records: no rows, only the zone. The few surfaces that
 * read `scenario.records` read its `timeZone`; everything else comes from a
 * hook's query.
 */
export function liveRecords(zone: LiveZone): FixtureRecords {
  return {
    ...zone,
    blocks: [],
    blockChanges: [],
    blockItems: [],
    slots: [],
    workItems: [],
    clients: [],
    clientsEnabled: false,
    todos: [],
    dayEvents: [],
    slotEvents: [],
    savedColours: [],
    dayBounds: [],
    usualWakeTime: "07:00",
    dayRecords: [],
    passages: [],
    links: [],
    quotes: [],
    morningLines: [],
    journalEntries: [],
    account: { name: "", email: "", photoUrl: null },
  };
}
