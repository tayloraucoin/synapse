import type { SlotEventKind } from "@syn/types";
import {
  blockItemRecord,
  blockRecord,
  slotEventRecord,
  slotRecord,
} from "@syn/validators";
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

/**
 * Several running (USE-24; day/running): a Life block, 9:30 to 12:00, with
 * the boards' [placeholder] items. The frames draw a Work block with tiers;
 * the lead's ruling carries them as a non-work block's Running rows, so the
 * tier heading and caption are not here. Ids count from 401 (events 501).
 */
export const SEVERAL_IDS = {
  block: fixtureId(1, 401),
  items: {
    spec: fixtureId(2, 401),
    refactor: fixtureId(2, 402),
    tests: fixtureId(2, 403),
    review: fixtureId(2, 404),
  },
  slots: {
    spec: fixtureId(3, 401),
    refactor: fixtureId(3, 402),
    tests: fixtureId(3, 403),
    review: fixtureId(3, 404),
  },
} as const;

type SeveralItem = keyof typeof SEVERAL_IDS.items;

const SEVERAL: { name: SeveralItem; title: string; lengthMin: number }[] = [
  { name: "spec", title: "[Write the sync spec]", lengthMin: 45 },
  {
    name: "refactor",
    title: "[Agent: refactor the sync queue]",
    lengthMin: 30,
  },
  { name: "tests", title: "[Agent: ENG-123 tests]", lengthMin: 30 },
  { name: "review", title: "[Review the Paper handoff]", lengthMin: 30 },
];

/** A timer on an item: its events, and the slot's Done when it has one. */
interface Timer {
  name: SeveralItem;
  events: { kind: SlotEventKind; at: string }[];
  done?: { at: string; tookMin: number };
}

function severalRecords(timers: Timer[]): FixtureRecords {
  const records = nowDayRecords([]);
  const stamps = { createdAt: STAMP, updatedAt: STAMP };
  records.blocks = [
    blockRecord.parse({
      ...stamps,
      id: SEVERAL_IDS.block,
      kind: "life",
      name: "Life",
      startsAt: "09:30",
      endsAt: "12:00",
      icon: null,
      color: null,
      rrule: null,
      onDate: BASE_DATE,
      fill: "set_items",
      checklist: false,
      meal: false,
      notify: false,
      archivedAt: null,
    }),
  ];
  records.blockItems = SEVERAL.map((item, sortOrder) =>
    blockItemRecord.parse({
      ...stamps,
      id: SEVERAL_IDS.items[item.name],
      blockId: SEVERAL_IDS.block,
      title: item.title,
      icon: null,
      isTransition: false,
      atTime: null,
      lengthMin: item.lengthMin,
      meal: false,
      onDate: null,
      sortOrder,
    }),
  );
  records.slots = [];
  let n = 0;
  for (const timer of timers) {
    const slotId = SEVERAL_IDS.slots[timer.name];
    records.slots.push(
      slotRecord.parse({
        ...stamps,
        id: slotId,
        blockId: SEVERAL_IDS.block,
        onDate: BASE_DATE,
        skipped: false,
        sortOrder: SEVERAL.findIndex((item) => item.name === timer.name),
        blockItemId: SEVERAL_IDS.items[timer.name],
        todoId: null,
        workItemId: null,
        tier: null,
        lengthMin: null,
        tookMin: timer.done?.tookMin ?? null,
        doneAt: timer.done ? onDay(timer.done.at) : null,
      }),
    );
    for (const { kind, at } of timer.events) {
      records.slotEvents.push(
        slotEventRecord.parse({
          id: fixtureId(7, 501 + n),
          createdAt: onDay(at),
          slotId,
          kind,
          clientEventId: fixtureId(7, 601 + n),
          at: onDay(at),
          receivedAt: onDay(at),
          stepAwayId: null,
        }),
      );
      n += 1;
    }
  }
  return records;
}

const started = (at: string) => [{ kind: "started" as const, at }];

/**
 * At 10:20: the spec 26:40 into 45 ("18:20"), the refactor 17:56 into 30
 * ("12:04"), and the tests either 34:30 into 30 ("4 min over", warning) or
 * Done at 10:20 after `testsTook` minutes.
 */
function several(
  name: string,
  view: Scenario["view"],
  testsTook?: number,
): Scenario {
  const tests: Timer =
    testsTook === undefined
      ? { name: "tests", events: started("09:45:30") }
      : {
          name: "tests",
          events: [
            ...started(`${minutesBefore("10:20", testsTook)}:00`),
            { kind: "done", at: "10:20:00" },
          ],
          done: { at: "10:20:00", tookMin: testsTook },
        };
  return {
    name,
    now: onDay("10:20:00"),
    records: severalRecords([
      { name: "spec", events: started("09:53:20") },
      { name: "refactor", events: started("10:02:04") },
      tests,
    ]),
    mode: "ready",
    view,
  };
}

/** "HH:MM", `min` minutes before `time` on the same day. */
function minutesBefore(time: string, min: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h! * 60 + m! - min;
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 60))}:${pad(total % 60)}`;
}

const I = SEVERAL_IDS.items;

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
  // ---- Several running (USE-24): the card and two Running rows ----
  "several-running": () =>
    several("several-running", { currentItemId: I.spec }),
  // The refactor lifted: it is the card, the spec a row; no event written.
  "running-row-focused": () =>
    several("running-row-focused", { currentItemId: I.refactor }),
  // The tests' box at 34 of 30: settled, "Done · 34 min of 30" in warning.
  "done-on-a-running-row": () =>
    several(
      "done-on-a-running-row",
      { currentItemId: I.spec, open: `settled:${I.tests}` },
      34,
    ),
  // At 41 of 30: "Done · 41 min of 30" in danger.
  "done-well-over": () =>
    several(
      "done-well-over",
      { currentItemId: I.spec, open: `settled:${I.tests}` },
      41,
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
