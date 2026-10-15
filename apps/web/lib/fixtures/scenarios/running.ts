import type { SlotEventKind } from "@syn/types";
import { slotEventRecord, slotRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords } from "./now-day";

/**
 * Running on Now (USE-23; day/running): Taylor's Monday with Meditate's slot
 * placed and an event list on it, read at a fixed instant, so each capture
 * shows the drawn figure. The figure is derived from the events, never set.
 * Event ids count from 7·201 so they never meet the base day's.
 */

/** An instant on the date, `HH:MM:SS` in Toronto (EDT, -04:00). */
function onDay(time: string): string {
  return `${BASE_DATE}T${time}-04:00`;
}

const WELLNESS_DONE = ["peeAndWeigh", "water", "startColdBath"] as const;
const STAMP = "2026-10-01T12:00:00.000Z";

function withMeditate(
  events: { kind: SlotEventKind; at: string }[],
  done?: { at: string; tookMin: number },
): FixtureRecords {
  const records = nowDayRecords(WELLNESS_DONE);
  const slotId = NOW_IDS.slots.meditate;
  records.slots.push(
    slotRecord.parse({
      id: slotId,
      createdAt: STAMP,
      updatedAt: STAMP,
      blockId: NOW_IDS.blocks.wellness,
      onDate: BASE_DATE,
      skipped: false,
      sortOrder: 3,
      blockItemId: NOW_IDS.items.meditate,
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: done?.tookMin ?? null,
      doneAt: done ? onDay(done.at) : null,
    }),
  );
  records.slotEvents.push(
    ...events.map(({ kind, at }, n) =>
      slotEventRecord.parse({
        id: fixtureId(7, 201 + n),
        createdAt: onDay(at),
        slotId,
        kind,
        clientEventId: fixtureId(7, 301 + n),
        at: onDay(at),
        receivedAt: onDay(at),
        stepAwayId: null,
      }),
    ),
  );
  return records;
}

function running(
  name: string,
  now: string,
  events: { kind: SlotEventKind; at: string }[],
  done?: { at: string; tookMin: number },
): Scenario {
  return {
    name,
    now: onDay(now),
    records: withMeditate(events, done),
    mode: "ready",
  };
}

const STARTED = { kind: "started", at: "07:14:00" } as const;

export const RUNNING_SCENARIOS: Record<string, () => Scenario> = {
  // 2:18 into 10 min: "7:42", "of 10 min".
  "counting-down": () => running("counting-down", "07:16:18", [STARTED]),
  // 10:40: "0:40 over", ink by the percent bands (the frame's yellow is the form).
  "over-under-a-minute": () =>
    running("over-under-a-minute", "07:24:40", [STARTED]),
  // 13 min on a 10-min item: "3 min over", danger.
  "over-a-minute-or-more": () =>
    running("over-a-minute-or-more", "07:27:00", [STARTED]),
  // Paused at 4:10 left (5:50 worked), read at 7:22.
  paused: () =>
    running("paused", "07:22:00", [
      STARTED,
      { kind: "paused", at: "07:19:50" },
    ]),
  // Done in the ink band: 11 min of 10 reads "11 min", Cold bath lifts at 7:26.
  "timed-done": () =>
    running(
      "timed-done",
      "07:26:00",
      [
        { kind: "started", at: "07:15:00" },
        { kind: "done", at: "07:26:00" },
      ],
      { at: "07:26:00", tookMin: 11 },
    ),
  // 12 of 10 is 20% over: "12 min of 10" in warning.
  "timed-over-warning": () =>
    running(
      "timed-over-warning",
      "07:26:00",
      [STARTED, { kind: "done", at: "07:26:00" }],
      { at: "07:26:00", tookMin: 12 },
    ),
};
