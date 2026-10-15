import {
  blockRecord,
  dayBoundsRecord,
  dayEventRecord,
  slotRecord,
  workItemRecord,
  type WorkItemRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { POOL_IDS, poolRecords } from "./pool";
import {
  emptyPoolRecords,
  linearOffRecords,
  poolPanelRecords,
} from "./pool-panel";

/**
 * The Week (USE-72): 12 to 18 Oct as the Priority lens board draws it, Monday
 * the 12th today. Every weekday has Training, three Work blocks (9:30 to
 * 12:00, 13:00 to 15:00, 15:10 to 17:00, a stretch break between) and Lunch;
 * Saturday has Errands and no Work; Sunday its reset checklist. The board's
 * chips sit as slots in those Work blocks: Monday's work ends at 16:20 at the
 * top of the ranges, Friday holds nothing. The pool (USE-55's clients, items
 * and Linear) stays as it is, unplaced. Bracketed names are the boards'
 * placeholders.
 */

/** Monday 12 October, 9:10 in Toronto: the board's today. */
export const WEEK_NOW = "2026-10-12T09:10:00-04:00";
/** Monday 12 October, 10:20: the Time lens board's now (USE-73). */
export const WEEK_TIME_NOW = "2026-10-12T10:20:00-04:00";
/** Wednesday 14 October, 10:00: Monday and Tuesday have gone. */
export const WEEK_PAST_NOW = "2026-10-14T10:00:00-04:00";

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Week ids count from 401, clear of the set-up's and the pool's. */
const id = (table: number, n: number) => fixtureId(table, 400 + n);

const DAY_CODES = ["MO", "TU", "WE", "TH", "FR", "SA", "SU"];
function weekly(...weekdays: number[]): string {
  const days = weekdays.map((day) => DAY_CODES[day]).join(",");
  return `DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=${days}`;
}
const MON_FRI = [0, 1, 2, 3, 4];

export const WEEK_IDS = {
  blocks: {
    training: id(1, 1),
    workMorning: id(1, 2),
    lunch: id(1, 3),
    workAfternoon: id(1, 4),
    stretchBreak: id(1, 5),
    workLate: id(1, 6),
    errandsSaturday: id(1, 7),
    sundayReset: id(1, 8),
  },
  workItems: {
    kes42: id(4, 1),
    ald17: id(4, 2),
    kes51: id(4, 3),
    syn212: id(4, 4),
    kes60: id(4, 5),
    invoice: id(4, 6),
  },
  events: { kestrelWeekly: id(8, 1), dentist: id(8, 2) },
} as const;

const B = WEEK_IDS.blocks;
const W = WEEK_IDS.workItems;

function block(seed: {
  id: string;
  kind: string;
  name: string;
  startsAt: string;
  endsAt: string;
  rrule: string;
  fill?: string;
  checklist?: boolean;
  meal?: boolean;
}) {
  return blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    onDate: null,
    fill: null,
    checklist: false,
    meal: false,
    notify: false,
    archivedAt: null,
    ...seed,
  });
}

function weekBlocks() {
  const work = {
    kind: "work",
    fill: "tasks_for_the_day",
    rrule: weekly(...MON_FRI),
  };
  return [
    block({
      id: B.training,
      kind: "training",
      name: "Training",
      startsAt: "08:00",
      endsAt: "08:57",
      rrule: weekly(...MON_FRI),
      fill: "set_items",
    }),
    block({
      ...work,
      id: B.workMorning,
      name: "Work",
      startsAt: "09:30",
      endsAt: "12:00",
    }),
    block({
      id: B.lunch,
      kind: "break",
      name: "Lunch",
      startsAt: "12:00",
      endsAt: "13:00",
      rrule: weekly(...MON_FRI),
      meal: true,
    }),
    block({
      ...work,
      id: B.workAfternoon,
      name: "Work",
      startsAt: "13:00",
      endsAt: "15:00",
    }),
    block({
      id: B.stretchBreak,
      kind: "break",
      name: "Stretch break",
      startsAt: "15:00",
      endsAt: "15:10",
      rrule: weekly(...MON_FRI),
    }),
    block({
      ...work,
      id: B.workLate,
      name: "Work",
      startsAt: "15:10",
      endsAt: "17:00",
    }),
    block({
      id: B.errandsSaturday,
      kind: "todos",
      name: "Errands",
      startsAt: "10:00",
      endsAt: "12:30",
      rrule: weekly(5),
      fill: "from_todos",
    }),
    block({
      id: B.sundayReset,
      kind: "wellness",
      name: "Sunday reset",
      startsAt: "00:00",
      endsAt: "24:00",
      rrule: weekly(6),
      fill: "set_items",
      checklist: true,
    }),
  ];
}

const emoji = (value: string) => ({ kind: "emoji" as const, value });

function weekWorkItems(): WorkItemRecord[] {
  return [
    {
      id: W.kes42,
      title: "[Portal sign-in]",
      icon: emoji("🔐"),
      size: "medium",
      linearIdentifier: "KES-42",
      clientId: POOL_IDS.clients.kestrel,
    },
    {
      id: W.ald17,
      title: "[Alder intro]",
      icon: emoji("✍️"),
      size: "medium",
      linearIdentifier: "ALD-17",
      clientId: POOL_IDS.clients.alder,
      dueOn: "2026-10-15",
    },
    {
      id: W.kes51,
      title: "[SMS copy]",
      icon: emoji("💬"),
      size: "small",
      linearIdentifier: "KES-51",
      clientId: POOL_IDS.clients.kestrel,
    },
    {
      id: W.syn212,
      title: "[Desk Today layout]",
      icon: emoji("🧭"),
      size: "large",
      linearIdentifier: "SYN-212",
      clientId: POOL_IDS.clients.personal,
    },
    {
      id: W.kes60,
      title: "[Audit notes]",
      icon: emoji("📝"),
      size: "small",
      linearIdentifier: "KES-60",
      clientId: POOL_IDS.clients.kestrel,
      dueOn: "2026-10-15",
    },
    {
      id: W.invoice,
      title: "[Invoice template]",
      icon: emoji("🧾"),
      size: "quick",
      linearIdentifier: null,
      clientId: null,
    },
  ].map((item) =>
    workItemRecord.parse({
      ...stamps,
      notes: null,
      lengthMinMin: null,
      lengthMaxMin: null,
      dueOn: null,
      parentWorkItemId: null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearConnectionId: null,
      linearIssueId: null,
      ...item,
    }),
  );
}

/** [slot n, work item, date, block, tier, session length or null]. */
const PLACED = [
  [1, W.kes42, "2026-10-12", B.workMorning, "primary", null],
  [2, W.ald17, "2026-10-12", B.workAfternoon, "primary", 60],
  [3, W.kes51, "2026-10-12", B.workAfternoon, "secondary", null],
  [4, W.syn212, "2026-10-12", B.workLate, "secondary", 40],
  [5, W.invoice, "2026-10-12", B.workLate, "stretch", null],
  [6, W.ald17, "2026-10-13", B.workMorning, "primary", 60],
  [7, W.kes51, "2026-10-13", B.workMorning, "secondary", null],
  [8, W.ald17, "2026-10-14", B.workMorning, "primary", 60],
  [9, W.syn212, "2026-10-15", B.workMorning, "primary", 90],
  [10, W.kes60, "2026-10-15", B.workAfternoon, "secondary", null],
  // The third session sits next week, so Monday's and Thursday's read "of 3".
  [11, W.syn212, "2026-10-19", B.workMorning, "primary", 90],
] as const;

function weekSlots() {
  return PLACED.map(
    ([n, workItemId, onDate, blockId, tier, lengthMin], index) =>
      slotRecord.parse({
        ...stamps,
        id: id(3, n),
        blockId,
        onDate,
        skipped: false,
        sortOrder: index,
        blockItemId: null,
        todoId: null,
        workItemId,
        tier,
        lengthMin,
        tookMin: null,
        doneAt: null,
      }),
  );
}

function weekEvents() {
  const event = {
    ...stamps,
    icon: null,
    notes: null,
    color: null,
    clientId: null,
  };
  return [
    dayEventRecord.parse({
      ...event,
      id: WEEK_IDS.events.kestrelWeekly,
      onDate: null,
      rrule: weekly(0),
      title: "[Kestrel weekly]",
      startsAt: "11:00",
      endsAt: "11:30",
      tag: "work",
      clientId: POOL_IDS.clients.kestrel,
    }),
    dayEventRecord.parse({
      ...event,
      id: WEEK_IDS.events.dentist,
      onDate: "2026-10-13",
      rrule: null,
      title: "[Dentist]",
      startsAt: "15:30",
      endsAt: "16:00",
      tag: "personal",
    }),
  ];
}

function weekBounds() {
  return [0, 1, 2, 3, 4, 5, 6].map((weekday) =>
    dayBoundsRecord.parse({
      ...stamps,
      id: fixtureId(0, 470 + weekday),
      weekday,
      onDate: null,
      upAt: "07:00",
      lightsOut: "22:30",
    }),
  );
}

/** The board's week; `placed: false` is the empty week (blocks and events, no work slotted). */
export function weekRecords({ placed = true } = {}): FixtureRecords {
  const pool = poolRecords();
  const setUpWork = new Set(
    pool.slots
      .filter((slot) => slot.workItemId !== null)
      .map((s) => s.workItemId),
  );
  const poolItems = new Set<string>(Object.values(POOL_IDS.workItems));
  return {
    ...pool,
    blocks: weekBlocks(),
    blockChanges: [],
    blockItems: [],
    // The set-up's Monday items go; the pool's stay, unplaced.
    workItems: [
      ...pool.workItems.filter(
        (item) => poolItems.has(item.id) || !setUpWork.has(item.id),
      ),
      ...weekWorkItems(),
    ],
    slots: placed ? weekSlots() : [],
    dayEvents: weekEvents(),
    dayBounds: weekBounds(),
  };
}

function week(
  name: string,
  options: Partial<Scenario> & {
    placed?: boolean;
    /** The pool panel's records (USE-74), over the Week's. */
    pool?: (records: FixtureRecords) => FixtureRecords;
  } = {},
): () => Scenario {
  const { placed, pool, ...rest } = options;
  return () => {
    const records = weekRecords({ placed });
    return {
      name,
      now: WEEK_NOW,
      records: pool ? pool(records) : records,
      mode: "ready",
      ...rest,
    };
  };
}

export const WEEK_SCENARIOS: Record<string, () => Scenario> = {
  "week-priority": week("week-priority"),
  "week-empty": week("week-empty", { placed: false }),
  "week-past-day": week("week-past-day", { now: WEEK_PAST_NOW }),
  "week-loading": week("week-loading", { mode: "loading" }),
  "week-error": week("week-error", { regions: { week: "error" } }),
  "week-offline": week("week-offline", { offline: true }),
  // USE-74: the pool panel beside the Priority lens. `pool` is USE-55's records.
  "pool-panel": week("pool-panel", { pool: poolPanelRecords }),
  "pool-linear-tab": week("pool-linear-tab", {
    pool: poolPanelRecords,
    view: { open: "pool:linear" },
  }),
  "pool-empty": week("pool-empty", { pool: emptyPoolRecords }),
  "pool-linear-off": week("pool-linear-off", { pool: linearOffRecords }),
  // USE-73: the Time lens on the same week at 10:20, the pool panel beside it.
  "week-time": week("week-time", {
    now: WEEK_TIME_NOW,
    pool: poolPanelRecords,
    view: { open: "week:time" },
  }),
};
