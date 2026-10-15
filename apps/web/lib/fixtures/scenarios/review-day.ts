import {
  blockItemRecord,
  blockRecord,
  dayRecordRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";

/**
 * Review the day (USE-31; day/review-the-day/), on Taylor's Monday (D-USE-8)
 * at 6:58, oriented at 6:55 and not yet readied, Start not tapped: Up at
 * 7:00 with Orient's five minutes, Wellness's five items, Training with its
 * drives as transitions, Breakfast and Lunch as meals, Work 9:30 to 12:00
 * with two Primary and one Secondary, and Work again 13:00 to 15:00. The
 * tray holds "Call the mechanic" (10:00) and a placeholder. Bracketed names
 * are the boards' placeholders.
 *
 * Ids count from 501, clear of the Monday's (101) and the other surfaces'.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const id = (table: number, n: number) => fixtureId(table, 500 + n);
const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";
const WEEKDAYS =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export const REVIEW_IDS = {
  blocks: { lunch: id(1, 1), afternoonWork: id(1, 2) },
  items: { driveThere: id(2, 1), workout: id(2, 2), driveHome: id(2, 3) },
  workItems: { linked: id(4, 1), primary: id(4, 2), secondary: id(4, 3) },
  slots: { linked: id(3, 1), primary: id(3, 2), secondary: id(3, 3) },
  todos: { mechanic: id(6, 1), placeholder: id(6, 2) },
  dayRecord: id(0, 1),
} as const;

const R = REVIEW_IDS;

const extraBlocks = [
  {
    id: R.blocks.lunch,
    kind: "break",
    name: "Lunch",
    startsAt: "12:00",
    endsAt: "13:00",
    rrule: DAILY,
    fill: null,
    meal: true,
  },
  {
    id: R.blocks.afternoonWork,
    kind: "work",
    name: "Work",
    startsAt: "13:00",
    endsAt: "15:00",
    rrule: WEEKDAYS,
    fill: "tasks_for_the_day",
  },
].map((block) =>
  blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    onDate: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...block,
  }),
);

/** Training's three: the drives are transitions, 15 + 30 + 12 = 57 min. */
const trainingItems = [
  {
    id: R.items.driveThere,
    title: "Drive to the YMCA",
    isTransition: true,
    lengthMin: 15,
  },
  {
    id: R.items.workout,
    title: "Workout: gym",
    isTransition: false,
    lengthMin: 30,
  },
  {
    id: R.items.driveHome,
    title: "Drive home",
    isTransition: true,
    lengthMin: 12,
  },
].map((item, sortOrder) =>
  blockItemRecord.parse({
    ...stamps,
    blockId: NOW_IDS.blocks.training,
    icon: null,
    atTime: null,
    meal: false,
    onDate: null,
    sortOrder,
    ...item,
  }),
);

const workItems = [
  {
    id: R.workItems.linked,
    title: "[Primary item, linked]",
    linearIdentifier: "ENG-123",
  },
  { id: R.workItems.primary, title: "[Primary item]", linearIdentifier: null },
  {
    id: R.workItems.secondary,
    title: "[Secondary item]",
    linearIdentifier: null,
  },
].map((item) =>
  workItemRecord.parse({
    ...stamps,
    notes: null,
    icon: null,
    size: "medium",
    lengthMinMin: null,
    lengthMaxMin: null,
    dueOn: null,
    clientId: null,
    parentWorkItemId: null,
    doneAt: null,
    doneSource: null,
    archivedAt: null,
    linearConnectionId: null,
    linearIssueId: null,
    ...item,
  }),
);

const workSlots = (
  [
    [R.slots.linked, R.workItems.linked, "primary"],
    [R.slots.primary, R.workItems.primary, "primary"],
    [R.slots.secondary, R.workItems.secondary, "secondary"],
  ] as const
).map(([slotId, workItemId, tier], sortOrder) =>
  slotRecord.parse({
    ...stamps,
    id: slotId,
    blockId: NOW_IDS.blocks.work,
    onDate: BASE_DATE,
    skipped: false,
    sortOrder,
    blockItemId: null,
    todoId: null,
    workItemId,
    tier,
    lengthMin: null,
    tookMin: null,
    doneAt: null,
  }),
);

const todos = [
  {
    id: R.todos.mechanic,
    title: "Call the mechanic",
    type: "call",
    icon: { kind: "curated", value: "phone", colorKey: null },
    remindAt: "10:00",
    createdAt: "2026-10-11T20:00:00.000Z",
  },
  {
    id: R.todos.placeholder,
    title: "[Placeholder to-do]",
    type: "other",
    icon: { kind: "curated", value: "backpack", colorKey: null },
    createdAt: "2026-10-11T21:00:00.000Z",
  },
].map((todo) =>
  todoRecord.parse({
    updatedAt: STAMP,
    lengthMin: null,
    notes: null,
    onDate: BASE_DATE,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...todo,
  }),
);

/** The Monday as Review the day draws it: oriented at 6:55, not readied. */
export function reviewDayRecords(): FixtureRecords {
  const monday = nowDayRecords([]);
  return structuredClone({
    ...monday,
    usualWakeTime: "07:00",
    blocks: [...monday.blocks, ...extraBlocks],
    blockItems: [...monday.blockItems, ...trainingItems],
    workItems,
    slots: [...monday.slots, ...workSlots],
    todos,
    dayRecords: [
      dayRecordRecord.parse({
        ...stamps,
        id: R.dayRecord,
        onDate: BASE_DATE,
        orientedAt: onNowDay("06:55"),
        readyAt: null,
        closedAt: null,
      }),
    ],
  });
}

function review(name: string, extra: Partial<Scenario> = {}): () => Scenario {
  return () => ({
    name,
    now: onNowDay("06:58"),
    records: reviewDayRecords(),
    mode: "ready",
    startedOnDevice: false,
    ...extra,
  });
}

export const REVIEW_SCENARIOS: Record<string, () => Scenario> = {
  "review-success": review("review-success"),
  // The tray opened in place (board 2a); it pushes the column down.
  "review-tray-open": review("review-tray-open", { view: { open: "todos" } }),
};
