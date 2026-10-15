import { pullTodos } from "@syn/utils";
import { blockRecord, slotRecord, todoRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE, emptyRecords } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay } from "./now-day";

/**
 * Now's To-dos block and system states (USE-21). The Errands day: one To-dos
 * block, 10:00 to 12:30, filled at go by USE-9's `pullTodos` from the to-dos
 * with no day, oldest first; three done by 11:22, "Return the parcel" lifted.
 * The rest are Wellness at 7:14 as `success`, offline, a check that fails,
 * loading and each region failing on its own. Ids count from 501.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const DAILY = "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=DAILY";

export const ERRANDS_IDS = {
  block: fixtureId(1, 501),
  todos: {
    dryCleaning: fixtureId(6, 501),
    mechanic: fixtureId(6, 502),
    groceries: fixtureId(6, 503),
    parcel: fixtureId(6, 504),
    prescription: fixtureId(6, 505),
    fern: fixtureId(6, 506),
    fridge: fixtureId(6, 507),
  },
} as const;

type ErrandName = keyof typeof ERRANDS_IDS.todos;

/** Oldest first: the order the pull takes them. */
const ERRANDS: {
  name: ErrandName;
  title: string;
  emoji: string;
  lengthMin: number;
  /** When it was made: "a to-do since Tue" reads this. */
  madeAt: string;
  /** Done at, on the Monday; unset is undone. */
  doneAt?: string;
}[] = [
  {
    name: "dryCleaning",
    title: "Drop off the dry cleaning",
    emoji: "🧥",
    lengthMin: 20,
    madeAt: "2026-10-03T09:00:00-04:00",
    doneAt: "10:20",
  },
  {
    name: "mechanic",
    title: "Call the mechanic",
    emoji: "📞",
    lengthMin: 15,
    madeAt: "2026-10-04T09:00:00-04:00",
    doneAt: "10:35",
  },
  {
    name: "groceries",
    title: "Groceries",
    emoji: "🛒",
    lengthMin: 45,
    madeAt: "2026-10-05T09:00:00-04:00",
    doneAt: "11:20",
  },
  {
    name: "parcel",
    title: "Return the parcel",
    emoji: "📦",
    lengthMin: 15,
    madeAt: "2026-10-06T09:00:00-04:00",
  },
  {
    name: "prescription",
    title: "Pick up the prescription",
    emoji: "💊",
    lengthMin: 10,
    madeAt: "2026-10-07T09:00:00-04:00",
  },
  // Too long for what is left of Errands: they stay in To-dos.
  {
    name: "fern",
    title: "Repot the fern",
    emoji: "🪴",
    lengthMin: 60,
    madeAt: "2026-10-08T09:00:00-04:00",
  },
  {
    name: "fridge",
    title: "Clean the fridge",
    emoji: "🧽",
    lengthMin: 60,
    madeAt: "2026-10-09T09:00:00-04:00",
  },
];

/** Errands, 10:00 to 12:30, the Monday's one block: nothing earlier holds it open. */
const errands = blockRecord.parse({
  id: ERRANDS_IDS.block,
  createdAt: STAMP,
  updatedAt: STAMP,
  kind: "todos",
  name: "Errands",
  icon: null,
  color: null,
  startsAt: "10:00",
  endsAt: "12:30",
  rrule: DAILY,
  onDate: null,
  fill: "from_todos",
  checklist: false,
  meal: false,
  notify: false,
  archivedAt: null,
});

/** The Errands Monday: the pull's slots as written at go, three done. */
export function errandsRecords(): FixtureRecords {
  const todos = ERRANDS.map((todo) => {
    const doneAt = todo.doneAt ? onNowDay(todo.doneAt) : null;
    return todoRecord.parse({
      id: ERRANDS_IDS.todos[todo.name],
      createdAt: todo.madeAt,
      updatedAt: doneAt ?? todo.madeAt,
      title: todo.title,
      type: "errand",
      icon: { kind: "emoji", value: todo.emoji },
      lengthMin: todo.lengthMin,
      notes: null,
      onDate: null,
      rrule: null,
      remindAt: null,
      remindOn: null,
      doneAt,
      archivedAt: null,
    });
  });
  const pulled = pullTodos({
    blocks: [
      {
        id: errands.id,
        fill: "from_todos",
        start: new Date(onNowDay("10:00")),
        end: new Date(onNowDay("12:30")),
        slots: [],
      },
    ],
    pool: ERRANDS.map((todo) => ({
      todoId: ERRANDS_IDS.todos[todo.name],
      lengthMin: todo.lengthMin,
      remindAt: null,
    })),
  });
  const slots = pulled.map((pull, n) => {
    const todo = todos.find((row) => row.id === pull.todoId)!;
    // A to-do slot's Done writes the slot and the to-do together.
    return slotRecord.parse({
      id: fixtureId(3, 501 + n),
      createdAt: onNowDay("07:05"),
      updatedAt: todo.doneAt ?? onNowDay("07:05"),
      blockId: pull.blockId,
      onDate: BASE_DATE,
      skipped: false,
      sortOrder: pull.sortOrder,
      blockItemId: null,
      todoId: pull.todoId,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: todo.doneAt ? todo.lengthMin : null,
      doneAt: todo.doneAt,
    });
  });
  return structuredClone({
    ...emptyRecords(),
    blocks: [errands],
    todos,
    slots,
  });
}

/** Wellness's first three items, checked by 7:14 (as `success`). */
const WELLNESS_DONE = ["peeAndWeigh", "water", "startColdBath"] as const;

const atWellness =
  (name: string, extra: Partial<Scenario> = {}) =>
  () =>
    ({
      name,
      now: onNowDay("07:14"),
      records: nowDayRecords(WELLNESS_DONE),
      mode: "ready",
      ...extra,
    }) satisfies Scenario;

export const NOW_SYSTEM_SCENARIOS: Record<string, () => Scenario> = {
  "todos-block": () => ({
    name: "todos-block",
    now: onNowDay("11:22"),
    records: errandsRecords(),
    mode: "ready",
  }),
  offline: atWellness("offline", { offline: true }),
  // Cold bath's slot is placed on its first touch; the change then fails once.
  "error-on-check": atWellness("error-on-check", {
    failWrites: [NOW_IDS.items.coldBath],
  }),
  "now-loading": atWellness("now-loading", { mode: "loading" }),
  "now-partial-todos": atWellness("now-partial-todos", {
    regions: { todos: "error" },
  }),
  "now-partial-block": atWellness("now-partial-block", { mode: "error" }),
};
