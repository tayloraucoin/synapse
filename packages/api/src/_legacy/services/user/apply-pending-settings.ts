import { and, eq, gt, isNull } from "drizzle-orm";

import { dayItems, days, type RlsClient } from "@syn/db";
import {
  clockFromMinutes,
  dateKeyIn,
  instantToWallClockMinutes,
  wallClockToInstant,
} from "@syn/utils";

import { materializeDay } from "../day/materialize-day";
import { untouchedWhere } from "../day/untouched";

/**
 * What happens to the plan when a deferred zone or day-close change comes due
 * (cross-cutting §7.3, §7.5).
 *
 * THE PROBLEM THIS SOLVES. `days` snapshots its zone and close time on INSERT
 * ONLY, so a day keeps the rules it was created under — which is what makes a
 * day lived in Vancouver still read in Vancouver after the person flies to
 * London. But the same snapshot means tomorrow, materialised last night under
 * the old zone, would sit at yesterday's instants under the new one: a 7:00
 * run planned in Vancouver would show up at 3:00 PM in London. Promoting the
 * pending pair without this pass changes what "now" means and leaves the plan
 * where it was.
 *
 * SO: FUTURE DAYS ARE RE-LAID, THE PAST IS NOT. Every planned day after today
 * takes the new snapshot and is rebuilt at the same WALL CLOCK — 7:00 stays
 * 7:00, in the new zone. Today is never touched, which is the promise the
 * pending pair exists to keep: nothing on the current day jumps.
 *
 * STRICTLY AFTER TODAY, NOT "FROM `pending_*_from`". In the ordinary case the
 * two are the same date. They differ only when the boundary is forced to today
 * (SYS-2 AC 6 does exactly this in SQL), and there the non-negotiable wins:
 * today keeps its snapshot and its times.
 *
 * A CLOSE-TIME CHANGE MOVES NOTHING. `day_close_time` decides which day an
 * instant belongs to and where the day's window ends; it is not an input to any
 * scheduled time. Its days take the new snapshot and are left alone, which also
 * keeps the pass bounded to the case that needs it.
 *
 * IT IS NOT INSIDE THE PROMOTING TRANSACTION. `rls.execute` opens a real
 * transaction on the pool, so a nested call takes a SECOND connection and
 * cannot see uncommitted work — `materializeDay` would read the old zone off
 * the day row and re-lay it exactly where it already was. Each step below is
 * its own committed transaction, in order, and the caller runs the whole hook
 * after its own commit.
 *
 * IDEMPOTENT. A day already carrying the new snapshot is skipped, so a second
 * pass — two tabs opening at once, the scheduler and a request racing — does no
 * work and moves nothing twice.
 */

export type SettingsApplied = {
  /** The day the person is in right now; everything after it is re-laid. */
  todayKey: string;
  /** Present only when the zone actually changed. */
  timezone?: string;
  /** Present only when the close time actually changed. */
  dayCloseTime?: string;
};

export async function afterSettingsApplied(
  rls: RlsClient,
  userId: string,
  change: SettingsApplied,
): Promise<void> {
  if (change.timezone === undefined && change.dayCloseTime === undefined) {
    return;
  }

  // Planned days only: a closed day is a record, and a past day is not here.
  const planned = await rls.execute((tx) =>
    tx
      .select({
        id: days.id,
        date: days.date,
        timezone: days.timezone,
        dayCloseTime: days.dayCloseTime,
        anchorTime: days.anchorTime,
      })
      .from(days)
      .where(
        and(
          eq(days.userId, userId),
          gt(days.date, change.todayKey),
          isNull(days.closedAt),
        ),
      ),
  );

  const stale = planned.filter(
    (day) =>
      (change.timezone !== undefined && day.timezone !== change.timezone) ||
      (change.dayCloseTime !== undefined &&
        // `time` comes back as `HH:mm:ss`; the stored value is `HH:mm`.
        day.dayCloseTime.slice(0, 5) !== change.dayCloseTime.slice(0, 5)),
  );

  if (stale.length === 0) return;

  for (const day of stale) {
    const oldZone = day.timezone;
    const zoneChanged =
      change.timezone !== undefined && change.timezone !== oldZone;
    const newZone = change.timezone ?? oldZone;

    await rls.execute((tx) =>
      tx
        .update(days)
        .set({
          ...(change.timezone !== undefined
            ? { timezone: change.timezone }
            : {}),
          ...(change.dayCloseTime !== undefined
            ? { dayCloseTime: change.dayCloseTime }
            : {}),
          updatedAt: new Date(),
        })
        .where(eq(days.id, day.id)),
    );

    if (!zoneChanged) continue;

    /*
     * Block-derived items: the materialiser owns them. It reads the day's
     * zone off the row we have just committed and re-walks every untouched
     * item from the day's anchors, which are the wall clocks the profile and
     * the blocks hold. "Keep" leaves the day's blocks as they are; the anchor
     * is passed explicitly so a profile whose wake has since changed does not
     * silently re-anchor this day.
     */
    await materializeDay(rls, userId, {
      date: String(day.date),
      blocks: "keep",
      anchorTime: day.anchorTime,
    });

    await relayOneOffs(rls, userId, day.id, oldZone, newZone);
  }
}

/**
 * The items no template owns — one-offs and carried items — moved to the same
 * wall clock in the new zone.
 *
 * THE DATE IS READ IN THE OLD ZONE, not taken from `days.date`. A day's items
 * can sit past midnight (a 1:00 AM item on a day that closes at 03:00 belongs
 * to the previous calendar date), so converting minutes-since-midnight against
 * the day key would move those items back a day. `dateKeyIn` gives the calendar
 * date the instant actually fell on, which round-trips.
 *
 * `original_scheduled_start` IS LEFT ALONE — it is immutable by trigger, and it
 * is honest: the plan WAS made under the old zone (SYS-2 AC 6's ruling).
 */
async function relayOneOffs(
  rls: RlsClient,
  userId: string,
  dayId: string,
  oldZone: string,
  newZone: string,
): Promise<void> {
  const rows = await rls.execute((tx) =>
    tx
      .select({
        id: dayItems.id,
        scheduledStart: dayItems.scheduledStart,
        scheduledEnd: dayItems.scheduledEnd,
      })
      .from(dayItems)
      .where(
        and(
          eq(dayItems.dayId, dayId),
          eq(dayItems.userId, userId),
          isNull(dayItems.templateSlotId),
          untouchedWhere(),
        ),
      ),
  );

  const moved = rows
    .map((row) => ({
      id: row.id,
      scheduledStart: sameWallClock(row.scheduledStart, oldZone, newZone),
      scheduledEnd: sameWallClock(row.scheduledEnd, oldZone, newZone),
    }))
    .filter((row) => row.scheduledStart !== null || row.scheduledEnd !== null);

  if (moved.length === 0) return;

  await rls.execute(async (tx) => {
    for (const row of moved) {
      await tx
        .update(dayItems)
        .set({
          ...(row.scheduledStart === null
            ? {}
            : { scheduledStart: row.scheduledStart }),
          ...(row.scheduledEnd === null
            ? {}
            : { scheduledEnd: row.scheduledEnd }),
          updatedAt: new Date(),
        })
        .where(eq(dayItems.id, row.id));
    }
  });
}

/** The same wall clock, on the same calendar date, in another zone. */
function sameWallClock(
  instant: Date | null,
  oldZone: string,
  newZone: string,
): Date | null {
  if (instant === null) return null;
  return wallClockToInstant(
    dateKeyIn(instant, oldZone),
    clockFromMinutes(instantToWallClockMinutes(instant, oldZone)),
    newZone,
  );
}
