import {
  blockItemRecord,
  blockRecord,
  dayEventRecord,
  dayRecordRecord,
  slotRecord,
  todoRecord,
  workItemRecord,
} from "@syn/validators";
import { LATER_START } from "@/lib/data/later-start-flag";
import { FIRST_CHANGE, RAIL_HINT } from "@/lib/data/review-first-times";
import type { RoomAddition } from "@/lib/data/room";
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

const SATURDAYS = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=SA";

export const REVIEW_IDS = {
  blocks: { lunch: id(1, 1), afternoonWork: id(1, 2), saturday: id(1, 3) },
  items: {
    driveThere: id(2, 1),
    workout: id(2, 2),
    driveHome: id(2, 3),
    yoga: id(2, 4),
    homeWorkout: id(2, 5),
  },
  workItems: { linked: id(4, 1), primary: id(4, 2), secondary: id(4, 3) },
  slots: { linked: id(3, 1), primary: id(3, 2), secondary: id(3, 3) },
  todos: { mechanic: id(6, 1), placeholder: id(6, 2) },
  dayRecord: id(0, 1),
  /** USE-41's morning: the boards' Journal, Call with Sam and the evening. */
  room: { journal: id(2, 6), evening: id(1, 4), callWithSam: id(8, 1) },
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
  // Saturday's Training holds the workouts Swap offers on a weekday (USE-37).
  {
    id: R.blocks.saturday,
    kind: "training",
    name: "Training",
    startsAt: "09:00",
    endsAt: "09:30",
    rrule: SATURDAYS,
    fill: "set_items",
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

/** Swap's library from Saturday: Yoga at 23 min ends Training at 8:50. */
const saturdayItems = [
  { id: R.items.yoga, title: "Yoga", lengthMin: 23 },
  { id: R.items.homeWorkout, title: "Home workout", lengthMin: 25 },
].map((item, sortOrder) =>
  blockItemRecord.parse({
    ...stamps,
    blockId: R.blocks.saturday,
    isTransition: false,
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

/**
 * The Monday as Review the day draws it: oriented at 6:55, not readied. With
 * `orientedAt` a late wake (USE-38): nothing else changes, and the layout
 * from the wake is derived on read.
 */
export function reviewDayRecords({
  work = true,
  orientedAt = "06:55",
}: { work?: boolean; orientedAt?: string } = {}): FixtureRecords {
  const monday = nowDayRecords([]);
  return structuredClone({
    ...monday,
    usualWakeTime: "07:00",
    blocks: [...monday.blocks, ...extraBlocks],
    blockItems: [...monday.blockItems, ...trainingItems, ...saturdayItems],
    workItems,
    slots: [...monday.slots, ...(work ? workSlots : [])],
    todos,
    dayRecords: [
      dayRecordRecord.parse({
        ...stamps,
        id: R.dayRecord,
        onDate: BASE_DATE,
        orientedAt: onNowDay(orientedAt),
        readyAt: null,
        closedAt: null,
      }),
    ],
  });
}

/** Both one-time lines already seen (USE-37): a usual morning, not the first. */
const SEEN = [RAIL_HINT, FIRST_CHANGE];

/** The swap from the Item sheet, staged on load (after-swap-undo.md). */
const SWAP_TO_YOGA = { id: R.items.workout, withId: R.items.yoga };

/**
 * A late wake at 8:10, now 8:10. The later-start sheet's day flag (USE-41)
 * is pinned seen, so these frames stay as drawn.
 */
const LATE = {
  now: onNowDay("08:10"),
  records: reviewDayRecords({ orientedAt: "08:10" }),
  seen: [...SEEN, LATER_START],
} satisfies Partial<Scenario>;

/**
 * Finding minutes (USE-41; make-room/, later-start/): the Monday as the
 * three boards draw it. Training's drives are 11 minutes and the workout
 * 35, so Training still ends 8:57 with 3 minutes before Breakfast; Wellness
 * gains "Journal [placeholder]" (15 min); Work holds "Call with Sam
 * [placeholder]" at 11:00 as a day event; an evening block ends at 22:30,
 * so a 70-minute slide puts Lights out at 23:40.
 */
function roomRecords(orientedAt?: string): FixtureRecords {
  const records = reviewDayRecords(orientedAt ? { orientedAt } : {});
  const lengths: Record<string, number> = {
    [R.items.driveThere]: 11,
    [R.items.workout]: 35,
    [R.items.driveHome]: 11,
  };
  return {
    ...records,
    blocks: [
      ...records.blocks,
      blockRecord.parse({
        ...stamps,
        id: R.room.evening,
        kind: "wind_down",
        name: "Evening",
        startsAt: "21:30",
        endsAt: "22:30",
        rrule: DAILY,
        fill: "set_items",
        icon: null,
        color: null,
        onDate: null,
        checklist: false,
        meal: false,
        notify: false,
        archivedAt: null,
      }),
    ],
    blockItems: [
      ...records.blockItems.map((item) =>
        item.id in lengths ? { ...item, lengthMin: lengths[item.id]! } : item,
      ),
      blockItemRecord.parse({
        ...stamps,
        id: R.room.journal,
        blockId: NOW_IDS.blocks.wellness,
        title: "Journal [placeholder]",
        isTransition: false,
        icon: null,
        atTime: null,
        lengthMin: 15,
        meal: false,
        onDate: null,
        sortOrder: 9,
      }),
    ],
    dayEvents: [
      dayEventRecord.parse({
        ...stamps,
        id: R.room.callWithSam,
        onDate: BASE_DATE,
        rrule: null,
        title: "Call with Sam [placeholder]",
        icon: null,
        startsAt: "11:00",
        endsAt: "11:30",
        tag: "work",
        notes: null,
        color: null,
        clientId: null,
      }),
    ],
  };
}

/** What a room scenario opens on, for its capture. */
export interface RoomSeed {
  /** Make room opens on load for this addition, as when the engine asks. */
  makeRoom?: RoomAddition;
  /** The later-start sheet's tab and ticks on open. */
  later?: { tab: "cut" | "slide"; cuts?: string[] };
}

const ROOM_SEEDS: Record<string, RoomSeed> = {
  // Kept as the board drew it (sheet.md): with these lengths the engine's
  // default would take the minutes with no sheet, so the capture opens it.
  "room-make-room": {
    makeRoom: {
      blockId: NOW_IDS.blocks.training,
      title: "Foam roll [placeholder]",
      lengthMin: 10,
      at: "08:45",
    },
  },
  "room-later-cut": {
    later: { tab: "cut", cuts: [NOW_IDS.items.meditate, R.room.journal] },
  },
  "room-later-slide": { later: { tab: "slide" } },
};

export const roomSeedOf = (name: string): RoomSeed | undefined =>
  ROOM_SEEDS[name];

function review(name: string, extra: Partial<Scenario> = {}): () => Scenario {
  return () => ({
    name,
    now: onNowDay("06:58"),
    records: reviewDayRecords(),
    mode: "ready",
    startedOnDevice: false,
    seen: SEEN,
    ...extra,
  });
}

export const REVIEW_SCENARIOS: Record<string, () => Scenario> = {
  "review-success": review("review-success"),
  // The tray opened in place (board 2a); it pushes the column down.
  "review-tray-open": review("review-tray-open", { view: { open: "todos" } }),
  // USE-37: the + hint, until Got it or a first drag.
  "review-first-mornings": review("review-first-mornings", {
    seen: [FIRST_CHANGE],
  }),
  // USE-37: the first change ever, a swap: the line under the header.
  "review-first-edit": review("review-first-edit", {
    seen: [RAIL_HINT],
    view: { staged: { swap: SWAP_TO_YOGA, toast: false } },
  }),
  // USE-37: the swap's landing, with its Toaster and Undo.
  "review-after-swap-undo": review("review-after-swap-undo", {
    view: { staged: { swap: SWAP_TO_YOGA, toast: true } },
  }),
  // USE-37: the Work block with nothing slotted for today.
  "review-no-work": review("review-no-work", {
    records: reviewDayRecords({ work: false }),
  }),
  // USE-34's system states: the day and the to-dos read apart (D-USE-69).
  "review-loading": review("review-loading", {
    mode: "loading",
    regions: { todos: "loading" },
  }),
  // Both fail: the drawn error frame, no tray; one Try again reads both.
  "review-error": review("review-error", {
    mode: "error",
    regions: { todos: "error" },
  }),
  "review-partial-todos": review("review-partial-todos", {
    regions: { todos: "error" },
  }),
  "review-partial-day": review("review-partial-day", { mode: "error" }),
  "review-offline": review("review-offline", { offline: true }),
  // USE-38: woke at 8:10 against Up at 7:00 (D-USE-8's morning). Wellness
  // folds into "Planned before 8:10"; Training runs 8:15 to 8:57.
  "review-late": review("review-late", LATE),
  // USE-41: Make room for Foam roll at 8:45 in Training, at 6:58.
  "room-make-room": review("room-make-room", { records: roomRecords() }),
  // USE-41: woke at 8:10; A later start opens by itself (its flag unset),
  // on Cut some with Meditate and Journal ticked, then on Slide.
  "room-later-cut": review("room-later-cut", {
    now: onNowDay("08:10"),
    records: roomRecords("08:10"),
  }),
  "room-later-slide": review("room-later-slide", {
    now: onNowDay("08:10"),
    records: roomRecords("08:10"),
  }),
  // USE-38: the passed row opened to Wellness's card.
  "review-late-passed-open": review("review-late-passed-open", {
    ...LATE,
    view: { open: "passed" },
  }),
};
