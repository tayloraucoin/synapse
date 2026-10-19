import type { SlotEventKind } from "@syn/types";
import {
  blockItemRecord,
  blockRecord,
  dayEventRecord,
  dayRecordRecord,
  slotEventRecord,
  slotRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE, emptyRecords } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import { onSunday, SUNDAY_DATE } from "./now-forms";
import { REVIEW_IDS, reviewDayRecords } from "./review-day";

/**
 * Schedule (USE-27; day/schedule/), on Review the day's Monday readied at
 * 7:00 and read at 10:20 with Work under way, and on the Sunday at 11:20.
 *
 * - `during-go`: nothing checked; Wellness, Training and Breakfast past.
 * - `checks-and-running`: Wellness's first three checked; Work's Primary
 *   reads "[Write the sync spec]" checked and "[Review the Paper handoff]"
 *   running since 9:55; Secondary "[Answer the review comments]".
 * - `meeting-inside-a-block`: the same, with "[Design sync]" 10:30 to 11:00.
 * - `checklist-day`: the Sunday checklist in the strip, Meal prep checked;
 *   Lunch with Sam 13:00 to 14:30 an event on its own (rose, Personal).
 * - the system states on during go's records.
 *
 * Work's lengths (25, 30, 30) put the Secondary item past 10:30, so the
 * meeting lands between the tiers as drawn. Bracketed names are the
 * boards' placeholders. Ids count from 901.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const id = (table: number, n: number) => fixtureId(table, 900 + n);

export const SCHEDULE_IDS = {
  dayRecord: id(0, 1),
  sundayRecord: id(0, 2),
  wellnessSlots: [id(3, 1), id(3, 2), id(3, 3)],
  events: { designSync: id(8, 1), lunchWithSam: id(8, 2) },
  sunday: { checklist: id(1, 1) },
  sundayItems: [id(2, 1), id(2, 2), id(2, 3), id(2, 4)],
  sundaySlot: id(3, 11),
  slotEvents: [id(7, 1)],
} as const;

/** The Monday as during go: Review the day's, readied at 7:00. */
export function scheduleDayRecords(): FixtureRecords {
  const records = reviewDayRecords();
  records.dayRecords = [
    dayRecordRecord.parse({
      ...stamps,
      id: SCHEDULE_IDS.dayRecord,
      onDate: BASE_DATE,
      orientedAt: onNowDay("06:55"),
      readyAt: onNowDay("07:00"),
      closedAt: null,
    }),
  ];
  return records;
}

/** The marks frame: three of Wellness checked, Work's first done, its second running. */
export function checksAndRunningRecords(): FixtureRecords {
  const records = scheduleDayRecords();
  const W = REVIEW_IDS.workItems;
  const names: Record<string, string> = {
    [W.linked]: "[Write the sync spec]",
    [W.primary]: "[Review the Paper handoff]",
    [W.secondary]: "[Answer the review comments]",
  };
  records.workItems = records.workItems.map((item) => ({
    ...item,
    title: names[item.id] ?? item.title,
  }));
  const lengths: Record<string, number> = {
    [REVIEW_IDS.slots.linked]: 25,
    [REVIEW_IDS.slots.primary]: 30,
    [REVIEW_IDS.slots.secondary]: 30,
  };
  records.slots = records.slots.map((slot) =>
    slot.id in lengths
      ? {
          ...slot,
          lengthMin: lengths[slot.id]!,
          ...(slot.id === REVIEW_IDS.slots.linked
            ? { doneAt: onNowDay("09:55"), tookMin: 25 }
            : {}),
        }
      : slot,
  );
  const wellness = [
    ["peeAndWeigh", "07:07", 2],
    ["water", "07:08", 1],
    ["startColdBath", "07:10", 2],
  ] as const;
  records.slots.push(
    ...wellness.map(([name, at, took], sortOrder) =>
      slotRecord.parse({
        ...stamps,
        id: SCHEDULE_IDS.wellnessSlots[sortOrder],
        blockId: NOW_IDS.blocks.wellness,
        onDate: BASE_DATE,
        skipped: false,
        sortOrder,
        blockItemId: NOW_IDS.items[name],
        todoId: null,
        workItemId: null,
        tier: null,
        lengthMin: null,
        tookMin: took,
        doneAt: onNowDay(at),
      }),
    ),
  );
  records.slotEvents.push(
    slotEvent(0, REVIEW_IDS.slots.primary, "started", onNowDay("09:55")),
  );
  return records;
}

function slotEvent(n: number, slotId: string, kind: SlotEventKind, at: string) {
  return slotEventRecord.parse({
    id: SCHEDULE_IDS.slotEvents[n] ?? id(7, 1 + n),
    createdAt: at,
    slotId,
    kind,
    clientEventId: id(7, 51 + n),
    at,
    receivedAt: at,
    stepAwayId: null,
  });
}

function dayEvent(fields: {
  id: string;
  onDate: string;
  title: string;
  startsAt: string;
  endsAt: string;
  tag: "work" | "personal";
  color: string | null;
}) {
  return dayEventRecord.parse({
    ...stamps,
    rrule: null,
    icon: null,
    notes: null,
    clientId: null,
    ...fields,
  });
}

/** A 30-minute meeting inside Work, plum (no colour). */
export function meetingRecords(): FixtureRecords {
  const records = checksAndRunningRecords();
  records.dayEvents = [
    dayEvent({
      id: SCHEDULE_IDS.events.designSync,
      onDate: BASE_DATE,
      title: "[Design sync]",
      startsAt: "10:30",
      endsAt: "11:00",
      tag: "work",
      color: null,
    }),
  ];
  return records;
}

/** The checklist's drawn four [placeholder items]. */
const SUNDAY_ROWS = ["Groceries", "Laundry", "Water the plants", "Meal prep"];

/** The Sunday: the checklist with no span, Meal prep checked; Lunch with Sam an event. */
export function checklistDayRecords(): FixtureRecords {
  const monday = nowDayRecords([]);
  const checklist = blockRecord.parse({
    ...stamps,
    id: SCHEDULE_IDS.sunday.checklist,
    kind: "wellness",
    name: "Sunday",
    icon: null,
    color: null,
    rrule: null,
    onDate: SUNDAY_DATE,
    // A checklist with no span is the whole date (D-USE-28) [ASSUMPTION].
    startsAt: "00:00",
    endsAt: "24:00",
    fill: "set_items",
    checklist: true,
    meal: false,
    notify: false,
    archivedAt: null,
  });
  const items = SUNDAY_ROWS.map((title, sortOrder) =>
    blockItemRecord.parse({
      ...stamps,
      id: SCHEDULE_IDS.sundayItems[sortOrder],
      blockId: checklist.id,
      title,
      icon: null,
      isTransition: false,
      atTime: null,
      lengthMin: null,
      meal: false,
      onDate: null,
      sortOrder,
    }),
  );
  const mealPrep = SUNDAY_ROWS.indexOf("Meal prep");
  return structuredClone({
    ...monday,
    blocks: [checklist],
    blockItems: items,
    slots: [
      slotRecord.parse({
        ...stamps,
        id: SCHEDULE_IDS.sundaySlot,
        blockId: checklist.id,
        onDate: SUNDAY_DATE,
        skipped: false,
        sortOrder: mealPrep,
        blockItemId: SCHEDULE_IDS.sundayItems[mealPrep],
        todoId: null,
        workItemId: null,
        tier: null,
        lengthMin: null,
        tookMin: null,
        doneAt: onSunday("10:40"),
      }),
    ],
    dayEvents: [
      dayEvent({
        id: SCHEDULE_IDS.events.lunchWithSam,
        onDate: SUNDAY_DATE,
        title: "Lunch with Sam",
        startsAt: "13:00",
        endsAt: "14:30",
        tag: "personal",
        color: "rose",
      }),
    ],
    todos: monday.todos.map((todo) => ({ ...todo, onDate: SUNDAY_DATE })),
    dayRecords: [
      dayRecordRecord.parse({
        ...stamps,
        id: SCHEDULE_IDS.sundayRecord,
        onDate: SUNDAY_DATE,
        orientedAt: onSunday("09:20"),
        readyAt: onSunday("09:40"),
        closedAt: null,
      }),
    ],
  });
}

/** Nothing on the day: no block, no checklist, no event; readied at 7:00. */
function emptyDayRecords(): FixtureRecords {
  const records = emptyRecords();
  records.dayRecords = scheduleDayRecords().dayRecords;
  return records;
}

function schedule(
  name: string,
  records: () => FixtureRecords,
  extra: Partial<Scenario> = {},
): () => Scenario {
  return () => ({
    name,
    now: onNowDay("10:20"),
    records: records(),
    mode: "ready",
    ...extra,
  });
}

export const SCHEDULE_SCENARIOS: Record<string, () => Scenario> = {
  "during-go": schedule("during-go", scheduleDayRecords),
  "checks-and-running": schedule("checks-and-running", checksAndRunningRecords),
  "meeting-inside-a-block": schedule("meeting-inside-a-block", meetingRecords),
  "checklist-day": schedule("checklist-day", checklistDayRecords, {
    now: onSunday("11:20"),
  }),
  "schedule-empty": schedule("schedule-empty", emptyDayRecords),
  // The day and the to-dos read apart (D-USE-69): each waits on its own.
  "schedule-loading": schedule("schedule-loading", scheduleDayRecords, {
    mode: "loading",
    regions: { todos: "loading" },
  }),
  // The day fails alone; the tray stays live.
  "schedule-error": schedule("schedule-error", scheduleDayRecords, {
    mode: "error",
  }),
  // The to-dos fail alone; the day stays live.
  "schedule-partial": schedule("schedule-partial", scheduleDayRecords, {
    regions: { todos: "error" },
  }),
  "schedule-offline": schedule("schedule-offline", checksAndRunningRecords, {
    offline: true,
  }),
};
