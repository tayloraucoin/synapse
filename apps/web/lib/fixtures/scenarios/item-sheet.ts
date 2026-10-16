import {
  blockItemRecord,
  blockRecord,
  slotRecord,
  workItemRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import { issueId } from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { ITEM_SHEET_LINEAR_SCENARIOS } from "./item-sheet-linear";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";
import {
  mondayEvent,
  TODAY_DESK_NOW,
  TODAY_WORK_IDS,
  todayWorkRecords,
} from "./today-desk";
import { WEEK_IDS } from "./week";

/**
 * The Item sheet's states (USE-64; day/item-sheet), over Taylor's Monday at
 * 6:58 before Wellness: Meditate in Wellness, and "Workout: gym" in Training
 * between the drives, with the other workouts on Tuesday to Thursday's
 * Training blocks as the library. `?sheet=item&id=<item>&state=item-<state>`.
 * A work item's states (USE-65) are work's Today Monday instead.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const weekly = (day: string) =>
  `DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=${day}`;

export const ITEM_SHEET_IDS = {
  blocks: {
    tuesday: fixtureId(1, 641),
    wednesday: fixtureId(1, 642),
    thursday: fixtureId(1, 643),
  },
  items: {
    driveThere: fixtureId(2, 641),
    gym: fixtureId(2, 642),
    driveBack: fixtureId(2, 643),
    homeWorkout: fixtureId(2, 644),
    yoga: fixtureId(2, 645),
    abs: fixtureId(2, 646),
    /** Meditate's copy for the date, at a set time (`item-at-a-set-time`). */
    meditateToday: fixtureId(2, 647),
  },
  slots: { meditateOff: fixtureId(3, 641) },
  /**
   * A work item's sheet (USE-65), on work's Today Monday at 10:20:
   * [Portal sign-in] (KES-42, 3 Medium, Primary in Work 9:30 to 12:00) and
   * [Desk Today layout] (SYN-212, session 1 of 3: Mon 12, Thu 15, Mon 19).
   */
  work: {
    portal: WEEK_IDS.workItems.kes42,
    desk: WEEK_IDS.workItems.syn212,
  },
  /**
   * A session's sheet (USE-67): [Desk Today layout] as tier-and-sessions.md
   * draws it, Mon 12 (Secondary, this one), Wed 14 (Primary), Thu 15
   * (Secondary), 2 to 4 h each, and SYN-214 [Firing in place on the row]
   * placed alone on Thu 15.
   */
  sessions: {
    subItem: fixtureId(4, 671),
    subSlot: fixtureId(3, 671),
  },
} as const;

const I = ITEM_SHEET_IDS.items;
const B = ITEM_SHEET_IDS.blocks;

function item(
  id: string,
  blockId: string,
  title: string,
  glyph: string,
  lengthMin: number,
  sortOrder: number,
) {
  return blockItemRecord.parse({
    ...stamps,
    id,
    blockId,
    title,
    icon: { kind: "curated", value: glyph, colorKey: "clay" },
    isTransition: false,
    atTime: null,
    lengthMin,
    meal: false,
    onDate: null,
    sortOrder,
  });
}

function training(id: string, day: string) {
  return blockRecord.parse({
    ...stamps,
    id,
    kind: "training",
    name: "Training",
    icon: null,
    color: null,
    startsAt: "08:00",
    endsAt: "08:57",
    rrule: weekly(day),
    onDate: null,
    fill: "set_items",
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
  });
}

/**
 * At a set time on, as the sheet writes it: Meditate off the date and its
 * copy for the date at 7:20.
 */
function withMeditateAt(records: FixtureRecords, atTime: string) {
  const meditate = records.blockItems.find(
    (row) => row.id === NOW_IDS.items.meditate,
  )!;
  records.slots.push(
    slotRecord.parse({
      ...stamps,
      id: ITEM_SHEET_IDS.slots.meditateOff,
      blockId: meditate.blockId,
      onDate: BASE_DATE,
      skipped: true,
      sortOrder: meditate.sortOrder,
      blockItemId: meditate.id,
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
  records.blockItems.push(
    blockItemRecord.parse({
      ...meditate,
      id: I.meditateToday,
      atTime,
      onDate: BASE_DATE,
    }),
  );
  return records;
}

/** Monday as drawn; `library` adds the other days' workouts. */
export function itemSheetRecords(library: boolean): FixtureRecords {
  const records = nowDayRecords([]);
  const training_ = NOW_IDS.blocks.training;
  // The boards' Monday: Meditate follows Start the cold bath at 7:12.
  records.blockItems = records.blockItems.map((row) =>
    row.id === NOW_IDS.items.peeAndWeigh ? { ...row, lengthMin: 4 } : row,
  );
  // Training is Monday's own; the rest of the week's are the library.
  records.blocks = records.blocks.map((row) =>
    row.id === training_ ? { ...row, rrule: weekly("MO") } : row,
  );
  records.blockItems.push(
    item(I.driveThere, training_, "Drive to the YMCA", "car", 10, 0),
    item(I.gym, training_, "Workout: gym", "dumbbell", 35, 1),
    item(I.driveBack, training_, "Drive home", "car", 10, 2),
  );
  if (library) {
    records.blocks.push(
      training(B.tuesday, "TU"),
      training(B.wednesday, "WE"),
      training(B.thursday, "TH"),
    );
    records.blockItems.push(
      item(I.homeWorkout, B.tuesday, "Home workout", "home", 25, 0),
      item(I.yoga, B.wednesday, "Yoga", "flower-2", 30, 0),
      item(I.abs, B.thursday, "Abs at home", "flame", 20, 0),
    );
  }
  return records;
}

const AT = onNowDay("06:58");

function scenario(
  name: string,
  overrides: Partial<Scenario> = {},
  library = true,
): () => Scenario {
  return () => ({
    name,
    now: AT,
    records: itemSheetRecords(library),
    mode: "ready",
    ...overrides,
  });
}

/** The week's ids as the week fixture numbers them (`week.ts`'s PLACED). */
const WEEK_SLOT = {
  deskThu: fixtureId(3, 409),
  deskNext: fixtureId(3, 411),
} as const;

/**
 * Work's Monday with [Desk Today layout] spread as the board draws it:
 * Mon 12 Secondary, Wed 14 Primary, Thu 15 Secondary, 2 to 4 h each, and
 * with `placed` SYN-214 on Thu 15's Secondary by itself.
 */
function sessionsRecords(placed: boolean): FixtureRecords {
  const records = todayWorkRecords();
  const desk = WEEK_IDS.workItems.syn212;
  records.workItems = records.workItems.map((row) =>
    row.id === desk ? { ...row, lengthMinMin: 120, lengthMaxMin: 240 } : row,
  );
  // Thu's share is 80 min, so a 30 min sub-issue there runs Secondary to 11:20.
  records.slots = records.slots.map((row) =>
    row.id === WEEK_SLOT.deskThu
      ? { ...row, tier: "secondary", lengthMin: 80 }
      : row.id === WEEK_SLOT.deskNext
        ? { ...row, onDate: "2026-10-14", tier: "primary" }
        : row,
  );
  // SYN-214 is a quick one in Linear: 1 point, at most 30 min.
  for (const workspace of records.integrations?.linear ?? []) {
    for (const issue of workspace.snapshot.subIssues) {
      if (issue.id === issueId("SYN-214")) issue.estimate = 1;
    }
  }
  if (!placed) return records;
  const sub = issueId("SYN-214");
  const workspace = records.integrations?.linear.find((row) =>
    row.snapshot.subIssues.some((issue) => issue.id === sub),
  );
  const parent = records.workItems.find((row) => row.id === desk)!;
  records.workItems.push(
    workItemRecord.parse({
      ...parent,
      id: ITEM_SHEET_IDS.sessions.subItem,
      title: "[Firing in place on the row]",
      icon: null,
      size: "quick",
      lengthMinMin: 15,
      lengthMaxMin: 30,
      parentWorkItemId: desk,
      linearIdentifier: "SYN-214",
      linearConnectionId: workspace?.connection.id ?? parent.linearConnectionId,
      linearIssueId: sub,
    }),
  );
  const thu = records.slots.find((row) => row.id === WEEK_SLOT.deskThu)!;
  records.slots.push(
    slotRecord.parse({
      ...thu,
      id: ITEM_SHEET_IDS.sessions.subSlot,
      workItemId: ITEM_SHEET_IDS.sessions.subItem,
      tier: "secondary",
      lengthMin: null,
      sortOrder: thu.sortOrder + 1,
    }),
  );
  return records;
}

function sessions(
  name: string,
  placed: boolean,
  open?: string,
): () => Scenario {
  return () => ({
    name,
    now: TODAY_DESK_NOW,
    records: sessionsRecords(placed),
    mode: "ready",
    ...(open === undefined ? {} : { view: { open } }),
  });
}

/** `view.open` names the sheet's start: ··· open, Swap, or the icon step. */
export const ITEM_SHEET_SCENARIOS: Record<string, () => Scenario> = {
  "item-default": scenario("item-default"),
  "item-more-open": scenario("item-more-open", {
    view: { open: "item:more" },
  }),
  "item-at-a-set-time": () => ({
    ...scenario("item-at-a-set-time")(),
    records: withMeditateAt(itemSheetRecords(true), "07:20"),
  }),
  "item-swap": scenario("item-swap", { view: { open: "item:swap" } }),
  "item-swap-empty": scenario(
    "item-swap-empty",
    { view: { open: "item:swap" } },
    false,
  ),
  "item-icon": scenario("item-icon", { view: { open: "item:icon" } }),
  "item-loading": scenario("item-loading"),
  "item-offline": scenario("item-offline", { offline: true }),
  // USE-65: a work item's sheet, `&sheet=item&id=<ITEM_SHEET_IDS.work.*>`.
  "item-size-and-length": () => ({
    name: "item-size-and-length",
    now: TODAY_DESK_NOW,
    records: todayWorkRecords(),
    mode: "ready",
  }),
  "item-work-more-open": () => ({
    name: "item-work-more-open",
    now: TODAY_DESK_NOW,
    records: todayWorkRecords(),
    mode: "ready",
    view: { open: "item:more" },
  }),
  // USE-66: a linked work item's Linear side, `&id=<ITEM_SHEET_LINEAR_IDS.item>`.
  ...ITEM_SHEET_LINEAR_SCENARIOS,
  // USE-67: a session's sheet, `&sheet=item&id=<ITEM_SHEET_IDS.work.desk>`.
  "item-tier-and-sessions": sessions("item-tier-and-sessions", true),
  "item-this-session-or-all": sessions(
    "item-this-session-or-all",
    true,
    "item:ask:primary",
  ),
  "item-sub-issue-alone": sessions("item-sub-issue-alone", false, "item:place"),
  // 12:20: [Portal sign-in] started 11:18, its prompt out at 11:58, so
  // "Firing · 22 min" and "worked 40 min before it"; `&id=<work.portal>`.
  "item-while-firing": () => ({
    name: "item-while-firing",
    now: "2026-10-12T12:20:00-04:00",
    records: todayWorkRecords([
      mondayEvent(1, TODAY_WORK_IDS.slots.portal, "started", "11:18"),
      mondayEvent(2, TODAY_WORK_IDS.slots.portal, "prompt_sent", "11:58"),
    ]),
    mode: "ready",
  }),
};
