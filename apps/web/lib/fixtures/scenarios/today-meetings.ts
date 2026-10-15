import { dayEventRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { mondayEvent, TODAY_WORK_IDS, todayWorkRecords } from "./today-desk";
import { WEEK_IDS } from "./week";

/**
 * A meeting inside the Work block (USE-62; meeting-coming-up.md,
 * meeting-lifted.md), on work's Monday (USE-57's records):
 *
 * - `today-meeting-coming-up`, 10:20: [Design sync] at 10:30 to 11:00 in the
 *   9:30 Work block, [Kestrel weekly] after it at 11:00. [Portal sign-in] is
 *   Next as a 30 min session, so its card reads "30 min · would end 10:50,
 *   past [Design sync]", and the bands follow it in the flow.
 * - `today-meeting-lifted`, 11:00: [Standup] at 11:00 to 11:15 (Kestrel's
 *   weekly moved off the day) lifts under "At 11:00"; [Portal sign-in] still
 *   fires from 10:16 and [SMS copy] still runs from 10:40.
 */

const STAMP = "2026-10-12T11:00:00.000Z";

/** Meeting ids count from 662, clear of Step away's and the outbox's. */
export const MEETING_IDS = {
  designSync: fixtureId(8, 662),
  standup: fixtureId(8, 663),
} as const;

function meeting(id: string, title: string, startsAt: string, endsAt: string) {
  return dayEventRecord.parse({
    id,
    createdAt: STAMP,
    updatedAt: STAMP,
    onDate: "2026-10-12",
    rrule: null,
    title,
    icon: null,
    startsAt,
    endsAt,
    tag: "work",
    notes: null,
    color: null,
    clientId: null,
  });
}

/** "HH:MM" on the Monday as a scenario's fixed now. */
const at = (clock: string) => `2026-10-12T${clock}:00-04:00`;

const S = TODAY_WORK_IDS.slots;

function comingUpRecords(): FixtureRecords {
  const records = todayWorkRecords([]);
  const portal = records.slots.find((slot) => slot.id === S.portal);
  // A 30 min session: the plan's top for the card (topMinutes).
  if (portal) portal.lengthMin = 30;
  return {
    ...records,
    dayEvents: [
      ...records.dayEvents,
      meeting(MEETING_IDS.designSync, "[Design sync]", "10:30", "11:00"),
    ],
  };
}

function liftedRecords(): FixtureRecords {
  const records = todayWorkRecords([
    mondayEvent(61, S.portal, "prompt_sent", "10:16"),
    mondayEvent(62, S.sms, "started", "10:40"),
  ]);
  return {
    ...records,
    dayEvents: [
      ...records.dayEvents.filter(
        (event) => event.id !== WEEK_IDS.events.kestrelWeekly,
      ),
      meeting(MEETING_IDS.standup, "[Standup]", "11:00", "11:15"),
    ],
  };
}

export const TODAY_MEETING_SCENARIOS: Record<string, () => Scenario> = {
  "today-meeting-coming-up": () => ({
    name: "today-meeting-coming-up",
    now: at("10:20"),
    records: comingUpRecords(),
    mode: "ready",
  }),
  "today-meeting-lifted": () => ({
    name: "today-meeting-lifted",
    now: at("11:00"),
    records: liftedRecords(),
    mode: "ready",
  }),
};
