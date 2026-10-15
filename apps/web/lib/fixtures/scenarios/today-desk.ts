import type { SlotEventKind } from "@syn/types";
import { dayRecordRecord, slotEventRecord, todoRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import { issueId, stateId, withIntegrations } from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import { WEEK_IDS, weekRecords } from "./week";

/**
 * The desk's Today frame (USE-58): the Week's 12 to 18 Oct (USE-72's
 * records) on Monday the 12th at 10:20, the day oriented and readied, so
 * /today lands on Today with the week strip over it and the day column
 * beside it. `today-opened-day` is the same week, captured with
 * `&date=2026-10-13`: Tuesday opened from the Week, planning.
 *
 * Work's Today (USE-57) is the same Monday as the boards draw it: the week's
 * items linked to their Linear issues, SYN-212 with its two sub-issues, the
 * to-dos Kegels (daily, 14:00), the hip stretch (daily, checked) and the
 * mechanic, and [Portal sign-in] fired at 10:16 so it reads "firing · 4 min".
 * `today-not-work` is 8:40, in Training; `today-loading` and `today-error` are
 * the tiers' own read waiting and failing under a real header.
 */

/** Monday 12 October, 10:20 in Toronto, as the boards draw Today. */
export const TODAY_DESK_NOW = "2026-10-12T10:20:00-04:00";

const STAMP = "2026-10-12T11:00:00.000Z";

function todayDeskRecords(): FixtureRecords {
  const records = weekRecords();
  return {
    ...records,
    dayRecords: [
      ...records.dayRecords.filter((row) => row.onDate !== "2026-10-12"),
      dayRecordRecord.parse({
        id: fixtureId(0, 490),
        createdAt: STAMP,
        updatedAt: STAMP,
        onDate: "2026-10-12",
        orientedAt: "2026-10-12T10:55:00.000Z",
        readyAt: "2026-10-12T11:05:00.000Z",
        closedAt: null,
      }),
    ],
  };
}

function desk(name: string): () => Scenario {
  return () => ({
    name,
    now: TODAY_DESK_NOW,
    records: todayDeskRecords(),
    mode: "ready",
  });
}

/** 8:40 on the Monday: Training, Work at 9:30 (not-a-work-block.md). */
export const TODAY_NOT_WORK_NOW = "2026-10-12T08:40:00-04:00";

const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";

/** Work's ids count from 601, clear of the week's. */
export const TODAY_WORK_IDS = {
  todos: {
    kegels: fixtureId(6, 601),
    stretch: fixtureId(6, 602),
    mechanic: fixtureId(6, 603),
  },
  /** The week's Monday slots, in the tiers' order. */
  slots: {
    portal: fixtureId(3, 401),
    alder: fixtureId(3, 402),
    sms: fixtureId(3, 403),
    desk: fixtureId(3, 404),
    invoice: fixtureId(3, 405),
  },
} as const;

/** "HH:MM" on the Monday, in Toronto. */
export function onMonday(clock: string): string {
  return new Date(`2026-10-12T${clock}:00-04:00`).toISOString();
}

/** One slot event on the Monday, received as it happened. */
export function mondayEvent(
  n: number,
  slotId: string,
  kind: SlotEventKind,
  clock: string,
) {
  const at = onMonday(clock);
  return slotEventRecord.parse({
    id: fixtureId(7, 600 + n),
    createdAt: at,
    slotId,
    kind,
    clientEventId: fixtureId(7, 700 + n),
    at,
    receivedAt: at,
    stepAwayId: null,
  });
}

function todayTodos() {
  const todo = {
    createdAt: STAMP,
    updatedAt: STAMP,
    notes: null,
    lengthMin: null,
    onDate: null,
    remindOn: null,
    archivedAt: null,
  };
  return [
    todoRecord.parse({
      ...todo,
      id: TODAY_WORK_IDS.todos.kegels,
      title: "Kegels",
      type: "other",
      icon: { kind: "emoji", value: "🧘" },
      rrule: DAILY,
      remindAt: "14:00",
      doneAt: null,
    }),
    todoRecord.parse({
      ...todo,
      id: TODAY_WORK_IDS.todos.stretch,
      title: "Hip and hamstring stretch",
      type: "other",
      icon: { kind: "emoji", value: "🤸" },
      rrule: DAILY,
      remindAt: "10:00",
      doneAt: onMonday("10:05"),
    }),
    todoRecord.parse({
      ...todo,
      id: TODAY_WORK_IDS.todos.mechanic,
      title: "[Call the mechanic]",
      type: "call",
      icon: { kind: "emoji", value: "📞" },
      rrule: null,
      remindAt: null,
      doneAt: null,
    }),
  ];
}

/**
 * The Monday as work's Today draws it: the week's items linked to Linear,
 * SYN-212's two sub-issues (one done), the board's three to-dos, and the
 * slot events `events` writes.
 */
export function todayWorkRecords(
  events: ReturnType<typeof mondayEvent>[] = [],
): FixtureRecords {
  const records = structuredClone(todayDeskRecords());
  const lighthouse = records.integrations?.linear.find((workspace) =>
    workspace.snapshot.issues.some((row) => row.identifier === "SYN-212"),
  );
  const parent = lighthouse?.snapshot.issues.find(
    (row) => row.identifier === "SYN-212",
  );
  if (lighthouse && parent) {
    lighthouse.snapshot.subIssues.push(
      {
        ...parent,
        id: issueId("SYN-213"),
        identifier: "SYN-213",
        title: "[Rail tabs: Today, Week, Schedule]",
        url: parent.url.replace("SYN-212", "SYN-213"),
        stateId: stateId("SYN", "Done"),
        labels: [],
        parentId: parent.id,
      },
      {
        ...parent,
        id: issueId("SYN-214"),
        identifier: "SYN-214",
        title: "[Firing in place on the row]",
        url: parent.url.replace("SYN-212", "SYN-214"),
        stateId: stateId("SYN", "Todo"),
        labels: [],
        parentId: parent.id,
      },
    );
  }
  const linked = records.integrations
    ? withIntegrations(records, records.integrations)
    : records;
  return {
    ...linked,
    todos: [...linked.todos, ...todayTodos()],
    slotEvents: [...linked.slotEvents, ...events],
  };
}

function work(
  name: string,
  options: Partial<Scenario> & {
    events?: ReturnType<typeof mondayEvent>[];
  } = {},
): () => Scenario {
  const { events, ...rest } = options;
  return () => ({
    name,
    now: TODAY_DESK_NOW,
    records: todayWorkRecords(events),
    mode: "ready",
    ...rest,
  });
}

const S = TODAY_WORK_IDS.slots;

/** [Portal sign-in] fired from its ring at 10:16: "firing · 4 min" at 10:20. */
const PORTAL_FIRING = [mondayEvent(1, S.portal, "prompt_sent", "10:16")];

export const TODAY_DESK_SCENARIOS: Record<string, () => Scenario> = {
  "today-desk": desk("today-desk"),
  "today-opened-day": desk("today-opened-day"),
  // USE-57: work's Today, at the desk and inside Now's Work block.
  "today-working": work("today-working", { events: PORTAL_FIRING }),
  "today-not-work": work("today-not-work", {
    now: TODAY_NOT_WORK_NOW,
    events: [],
  }),
  "today-loading": work("today-loading", {
    events: PORTAL_FIRING,
    regions: { week: "loading" },
  }),
  "today-error": work("today-error", {
    events: PORTAL_FIRING,
    regions: { week: "error" },
  }),
};

/** The Monday's Work blocks, for the tests. */
export const TODAY_WORK_BLOCKS = {
  morning: WEEK_IDS.blocks.workMorning,
  training: WEEK_IDS.blocks.training,
} as const;
