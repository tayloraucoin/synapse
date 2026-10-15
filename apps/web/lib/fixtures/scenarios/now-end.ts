import { blockItemRecord, blockRecord, slotRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import { trayTodoRecords } from "./todos-tray";

/**
 * Now at a block's end and the day's (USE-20; day/now/states): Wellness all
 * done at 7:34 in its three drawn frames, an empty Break at 15:02 and the
 * day after its last block at 18:40, on Taylor's Monday. Ids count from 701.
 *
 * The three 7:34 frames are one moment: live, the add row, the ahead line
 * and the to-do link all show while Wellness has time. `view.ending` holds
 * back what a frame does not draw, for its capture only.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

export const NOW_END_IDS = {
  blocks: { break: fixtureId(1, 701), windDown: fixtureId(1, 702) },
  items: { warmUp: fixtureId(2, 701), strength: fixtureId(2, 702) },
  slots: { breakfast: fixtureId(3, 701) },
} as const;

const ALL_WELLNESS = [
  "peeAndWeigh",
  "water",
  "startColdBath",
  "meditate",
  "coldBath",
] as const;

/**
 * Wellness all done by 7:34, Cold bath taking `coldBathMin`, and Training
 * given two items [placeholder] so Start Training has one to lift.
 */
export function allDoneRecords(coldBathMin: number): FixtureRecords {
  const records = nowDayRecords(ALL_WELLNESS);
  records.slots = records.slots.map((slot) =>
    slot.blockItemId === NOW_IDS.items.coldBath
      ? { ...slot, tookMin: coldBathMin, doneAt: onNowDay("07:34") }
      : slot,
  );
  const training = [
    { id: NOW_END_IDS.items.warmUp, title: "Warm-up [placeholder]", min: 10 },
    {
      id: NOW_END_IDS.items.strength,
      title: "Strength [placeholder]",
      min: 40,
    },
  ].map((item, sortOrder) =>
    blockItemRecord.parse({
      ...stamps,
      id: item.id,
      blockId: NOW_IDS.blocks.training,
      title: item.title,
      icon: null,
      isTransition: false,
      atTime: null,
      lengthMin: item.min,
      meal: false,
      onDate: null,
      sortOrder,
    }),
  );
  records.blockItems = [...records.blockItems, ...training];
  return records;
}

function afternoonBlock(fields: {
  id: string;
  kind: "break" | "wellness";
  name: string;
  startsAt: string;
  endsAt: string;
}) {
  return blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    rrule: null,
    onDate: BASE_DATE,
    fill: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...fields,
  });
}

/**
 * The morning done (Wellness checked through, Breakfast eaten), then a true
 * Break, 15:00 to 15:10, Meal off and nothing in it, and the day's last
 * block, Wind-down [placeholder], 17:30 to 18:30, with nothing left in it.
 * The tray holds USE-19's two to-dos, as the boards draw them.
 */
export function afternoonRecords(): FixtureRecords {
  const records = nowDayRecords(ALL_WELLNESS);
  const breakfast = slotRecord.parse({
    ...stamps,
    id: NOW_END_IDS.slots.breakfast,
    blockId: NOW_IDS.blocks.breakfast,
    onDate: BASE_DATE,
    skipped: false,
    sortOrder: 0,
    blockItemId: NOW_IDS.items.breakfast,
    todoId: null,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: 30,
    doneAt: onNowDay("09:30"),
  });
  return {
    ...records,
    blocks: [
      ...records.blocks,
      afternoonBlock({
        id: NOW_END_IDS.blocks.break,
        kind: "break",
        name: "Break",
        startsAt: "15:00",
        endsAt: "15:10",
      }),
      afternoonBlock({
        id: NOW_END_IDS.blocks.windDown,
        kind: "wellness",
        name: "Wind-down [placeholder]",
        startsAt: "17:30",
        endsAt: "18:30",
      }),
    ],
    slots: [...records.slots, breakfast],
    todos: trayTodoRecords(),
  };
}

const tookColdBath = `took:${NOW_IDS.items.coldBath}`;

export const NOW_END_SCENARIOS: Record<string, () => Scenario> = {
  "all-done-start-next": () => ({
    name: "all-done-start-next",
    now: onNowDay("07:34"),
    records: allDoneRecords(12),
    mode: "ready",
    view: { open: tookColdBath, ending: { addRow: false, ahead: false } },
  }),
  "all-done-add-more": () => ({
    name: "all-done-add-more",
    now: onNowDay("07:34"),
    records: allDoneRecords(10),
    mode: "ready",
    view: { open: tookColdBath, ending: { ahead: false } },
  }),
  ahead: () => ({
    name: "ahead",
    now: onNowDay("07:34"),
    records: allDoneRecords(10),
    mode: "ready",
    view: { open: tookColdBath, ending: { addRow: false } },
  }),
  "empty-break": () => ({
    name: "empty-break",
    now: onNowDay("15:02"),
    records: afternoonRecords(),
    mode: "ready",
  }),
  "empty-no-blocks": () => ({
    name: "empty-no-blocks",
    now: onNowDay("18:40"),
    records: afternoonRecords(),
    mode: "ready",
  }),
};
