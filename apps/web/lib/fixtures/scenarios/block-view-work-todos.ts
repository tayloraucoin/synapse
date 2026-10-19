import type { IconValue } from "@syn/types";
import {
  dayEventRecord,
  slotRecord,
  todoRecord,
  type TodoRecord,
  type WorkItemRecord,
} from "@syn/validators";
import { daysBlockRoute } from "@/lib/routes";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import {
  SET_UP_IDS,
  SET_UP_NOW,
  setUpThisWeekRecords,
  setUpUsualRecords,
} from "./set-up";

/**
 * Block view in editing on This week (USE-50; day/block-view/states/
 * work-tiers.md, work-add-to-a-tier.md and the four todos-*.md): Sunday 11
 * October, 21:10, the set-up clock. Monday 12's Work on its four tiers
 * (Linear rows sized, the others a length alone); Saturday 17's Errands, a
 * To-dos block, holding three to-dos with three more and a Home job waiting
 * in To-dos; Sunday 18's Sunday reset with its three home jobs, one
 * repeating. Bracketed names are the boards' placeholders.
 *
 * Take each at its `BLOCK_WORK_TODOS_PATHS` path with
 * `?state=block-view-<state>`.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Ids count from 1200, clear of the other scenarios'. */
const id = (table: number, n: number) => fixtureId(table, 1200 + n);

const B = SET_UP_IDS.blocks;
const W = SET_UP_IDS.workItems;

export const BLOCK_WORK_TODOS_IDS = {
  todos: {
    dryCleaning: id(6, 1),
    mechanic: id(6, 2),
    groceries: id(6, 3),
    parcel: id(6, 4),
    libraryBooks: id(6, 5),
    postOffice: id(6, 6),
    shelf: id(6, 7),
    bedroom: id(6, 8),
    pantry: id(6, 9),
    fridge: id(6, 10),
  },
  coffee: id(8, 1),
  workItems: { extraPrimary: id(4, 1) },
} as const;

const T = BLOCK_WORK_TODOS_IDS.todos;
const SAT = "2026-10-17";
const SUN = "2026-10-18";

const emoji = (value: string): IconValue => ({ kind: "emoji", value });

function todo(seed: {
  id: string;
  title: string;
  icon: string;
  type: TodoRecord["type"];
  lengthMin: number;
  createdAt: string;
  rrule?: string;
}): TodoRecord {
  return todoRecord.parse({
    updatedAt: seed.createdAt,
    notes: null,
    onDate: null,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...seed,
    icon: emoji(seed.icon),
  });
}

const at = (date: string) => `${date}T12:00:00.000Z`;

function todos(): TodoRecord[] {
  return [
    // Errands' own, on Sat 17.
    todo({
      id: T.dryCleaning,
      title: "Drop off the dry cleaning",
      icon: "🧥",
      type: "errand",
      lengthMin: 20,
      createdAt: at("2026-09-28"),
    }),
    todo({
      id: T.mechanic,
      title: "Call the mechanic",
      icon: "📞",
      type: "call",
      lengthMin: 15,
      createdAt: at("2026-09-29"),
    }),
    todo({
      id: T.groceries,
      title: "Groceries",
      icon: "🛒",
      type: "errand",
      lengthMin: 45,
      createdAt: at("2026-09-30"),
    }),
    // Waiting in To-dos with no day, oldest first.
    todo({
      id: T.parcel,
      title: "Return the parcel",
      icon: "📦",
      type: "errand",
      lengthMin: 15,
      createdAt: at("2026-10-03"),
    }),
    todo({
      id: T.libraryBooks,
      title: "Return the library books",
      icon: "📚",
      type: "errand",
      lengthMin: 30,
      createdAt: at("2026-10-05"),
    }),
    todo({
      id: T.postOffice,
      title: "Post office: stamps",
      icon: "📮",
      type: "errand",
      lengthMin: 40,
      createdAt: at("2026-10-06"),
      rrule: "DTSTART;VALUE=DATE:20261006\nRRULE:FREQ=MONTHLY",
    }),
    todo({
      id: T.shelf,
      title: "Hang the shelf [placeholder]",
      icon: "🔨",
      type: "home",
      lengthMin: 30,
      createdAt: at("2026-10-08"),
    }),
    // Sunday reset's, on Sun 18.
    todo({
      id: T.bedroom,
      title: "Clear out the bedroom",
      icon: "🛏️",
      type: "home",
      lengthMin: 90,
      createdAt: at("2026-10-01"),
    }),
    todo({
      id: T.pantry,
      title: "Sort the pantry",
      icon: "🥫",
      type: "home",
      lengthMin: 45,
      createdAt: at("2026-10-02"),
    }),
    todo({
      id: T.fridge,
      title: "Clean the fridge",
      icon: "🧹",
      type: "home",
      lengthMin: 40,
      createdAt: at("2026-10-04"),
      rrule: "DTSTART;VALUE=DATE:20261004\nRRULE:FREQ=WEEKLY;INTERVAL=2",
    }),
  ];
}

function todoSlots(
  blockId: string,
  onDate: string,
  ids: string[],
  from: number,
) {
  return ids.map((todoId, index) =>
    slotRecord.parse({
      ...stamps,
      id: id(3, from + index),
      blockId,
      onDate,
      skipped: false,
      sortOrder: index,
      blockItemId: null,
      todoId,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
}

/** A size sets a range; a length alone stands (size-and-length.md). */
const SIZED: Record<string, Partial<WorkItemRecord>> = {
  [W.syncSpec]: { size: "medium" },
  [W.paperHandoff]: { lengthMinMin: 30, lengthMaxMin: 30 },
  [W.retryBackoff]: { size: "small" },
  [W.linearBacklog]: { lengthMinMin: 15, lengthMaxMin: 15 },
};

type Variant = "usual" | "past-end" | "nothing-in-primary" | "no-pool";

export function blockWorkTodosRecords(
  variant: Variant = "usual",
  options: { coffee?: boolean } = {},
): FixtureRecords {
  const usual = setUpUsualRecords();
  const week = setUpThisWeekRecords();
  let workItems = week.workItems.map((item) => ({
    ...item,
    ...SIZED[item.id],
  }));
  let workSlots = week.slots;
  if (variant === "past-end") {
    // [placeholder] A third Primary item: 1 h more at the top of its range.
    workItems = [
      ...workItems,
      {
        ...workItems[1]!,
        id: BLOCK_WORK_TODOS_IDS.workItems.extraPrimary,
        title: "[Plan the migration]",
        lengthMinMin: 60,
        lengthMaxMin: 60,
      },
    ];
    workSlots = [
      ...workSlots,
      {
        ...workSlots[1]!,
        id: id(3, 50),
        workItemId: BLOCK_WORK_TODOS_IDS.workItems.extraPrimary,
        sortOrder: 4,
      },
    ];
  }
  if (variant === "nothing-in-primary") {
    workSlots = workSlots.filter((slot) => slot.tier !== "primary");
  }
  const all = todos();
  const kept =
    variant === "no-pool"
      ? all.filter(
          (row) =>
            ![T.parcel, T.libraryBooks, T.postOffice, T.shelf].includes(
              row.id as (typeof T)[keyof typeof T],
            ),
        )
      : all;
  return {
    ...usual,
    workItems,
    todos: kept,
    slots: [
      ...workSlots,
      ...todoSlots(
        B.errandsSaturday,
        SAT,
        [T.dryCleaning, T.mechanic, T.groceries],
        10,
      ),
      ...todoSlots(B.sundayReset, SUN, [T.bedroom, T.pantry, T.fridge], 20),
    ],
    dayEvents: options.coffee
      ? [
          dayEventRecord.parse({
            ...stamps,
            id: BLOCK_WORK_TODOS_IDS.coffee,
            onDate: SAT,
            rrule: null,
            title: "Coffee with Sam",
            icon: null,
            startsAt: "11:00",
            endsAt: "11:30",
            tag: "personal",
            notes: null,
            color: null,
            clientId: null,
          }),
        ]
      : [],
  };
}

const work = daysBlockRoute(B.work, { date: "2026-10-12" });
const errands = daysBlockRoute(B.errandsSaturday, { date: SAT });

/** Where each state is taken: This week's dates. */
export const BLOCK_WORK_TODOS_PATHS = {
  "work-tiers": work,
  "work-add-to-a-tier": work,
  "work-past-end": work,
  "work-nothing-in-primary": work,
  "todos-add-open": errands,
  "todos-new-todo": errands,
  "todos-pool": errands,
  "todos-pool-past-end": errands,
  "todos-pool-type": errands,
  "todos-pool-empty": errands,
  "todos-dated-plan": errands,
  "todos-sunday-reset": daysBlockRoute(B.sundayReset, { date: SUN }),
} as const;

function state(
  key: keyof typeof BLOCK_WORK_TODOS_PATHS,
  records: () => FixtureRecords = () => blockWorkTodosRecords(),
  extra: Partial<Scenario> = {},
): [string, () => Scenario] {
  const name = `block-view-${key}`;
  return [
    name,
    () => ({
      name,
      now: SET_UP_NOW,
      records: records(),
      mode: "ready",
      ...extra,
    }),
  ];
}

const open = (value: string): Partial<Scenario> => ({ view: { open: value } });

export const BLOCK_WORK_TODOS_SCENARIOS: Record<string, () => Scenario> =
  Object.fromEntries([
    state("work-tiers"),
    state("work-add-to-a-tier", undefined, open("tier-add:primary")),
    state("work-past-end", () => blockWorkTodosRecords("past-end")),
    state("work-nothing-in-primary", () =>
      blockWorkTodosRecords("nothing-in-primary"),
    ),
    state("todos-add-open", undefined, open("add")),
    state("todos-new-todo", undefined, open("new-todo")),
    state("todos-pool", undefined, open(`pool:${T.parcel}`)),
    state(
      "todos-pool-past-end",
      undefined,
      open(`pool:${T.parcel},${T.libraryBooks},${T.postOffice}`),
    ),
    state("todos-pool-type", undefined, open(`pool-type:home`)),
    state(
      "todos-pool-empty",
      () => blockWorkTodosRecords("no-pool"),
      open("pool"),
    ),
    state("todos-dated-plan", () =>
      blockWorkTodosRecords("usual", { coffee: true }),
    ),
    state("todos-sunday-reset"),
  ]);
