import { slotRecord, todoRecord, type TodoRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { NOW_IDS, nowDayRecords, onNowDay, type NowItemName } from "./now-day";

/**
 * The To-dos tray's states (USE-19; day/todos/), on Taylor's Monday: "Call
 * the mechanic" reminds at 10:00, and "Library books" was dated Sunday and
 * left unchecked, so it carries, "From Sunday". Names take the `todos-`
 * prefix where another surface uses the bare word.
 */

export const TRAY_IDS = {
  mechanic: fixtureId(6, 201),
  books: fixtureId(6, 202),
} as const;

const SUNDAY = "2026-10-11";
const WELLNESS_DONE: NowItemName[] = ["peeAndWeigh", "water", "startColdBath"];

function trayTodo(todo: Partial<TodoRecord> & { id: string; title: string }) {
  return todoRecord.parse({
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
    type: "other",
    icon: null,
    lengthMin: null,
    notes: null,
    onDate: null,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...todo,
  });
}

/** The two to-dos the boards draw. */
export function trayTodoRecords(): TodoRecord[] {
  return [
    trayTodo({
      id: TRAY_IDS.mechanic,
      title: "Call the mechanic",
      type: "call",
      icon: { kind: "curated", value: "phone", colorKey: null },
      onDate: BASE_DATE,
      remindAt: "10:00",
      createdAt: "2026-10-11T20:00:00.000Z",
    }),
    trayTodo({
      id: TRAY_IDS.books,
      title: "Library books",
      type: "errand",
      icon: { kind: "curated", value: "backpack", colorKey: null },
      onDate: SUNDAY,
      createdAt: "2026-10-10T15:00:00.000Z",
    }),
  ];
}

function trayDay(todos: TodoRecord[]): FixtureRecords {
  return { ...nowDayRecords(WELLNESS_DONE), todos };
}

/**
 * The morning done by 10:00, so Work is the active block, as the board
 * draws it: Wellness checked through and Breakfast eaten.
 */
function workDay(todos: TodoRecord[]): FixtureRecords {
  const records = nowDayRecords([...WELLNESS_DONE, "meditate", "coldBath"]);
  const breakfast = slotRecord.parse({
    createdAt: "2026-10-01T12:00:00.000Z",
    updatedAt: "2026-10-01T12:00:00.000Z",
    id: fixtureId(3, 201),
    blockId: NOW_IDS.blocks.breakfast,
    onDate: BASE_DATE,
    skipped: false,
    sortOrder: 0,
    // Breakfast's meal item (USE-17's `NOW_IDS.items.breakfast`).
    blockItemId: fixtureId(2, 106),
    todoId: null,
    workItemId: null,
    tier: null,
    lengthMin: null,
    tookMin: 30,
    doneAt: onNowDay("09:30"),
  });
  return { ...records, slots: [...records.slots, breakfast], todos };
}

/** Now at 7:14 with the tray open, as `open.md` draws it. */
function openAt(name: string, extra: Partial<Scenario> = {}): Scenario {
  return {
    name,
    now: onNowDay("07:14"),
    records: trayDay(trayTodoRecords()),
    mode: "ready",
    view: { open: "todos" },
    ...extra,
  };
}

export const TODOS_SCENARIOS: Record<string, () => Scenario> = {
  "todos-open": () => openAt("todos-open"),
  // The carried state renders the same frame (open.md).
  "todos-carried": () => openAt("todos-carried"),
  "todos-empty": () => ({
    ...openAt("todos-empty"),
    records: trayDay([]),
  }),
  // Tapping the 10:00 reminder: Now at 10:00, the tray open on that to-do.
  "from-a-reminder": () => ({
    ...openAt("from-a-reminder"),
    now: onNowDay("10:00"),
    records: workDay(trayTodoRecords()),
    view: { open: `todos:${TRAY_IDS.mechanic}` },
  }),
  "todos-loading": () =>
    openAt("todos-loading", { regions: { todos: "loading" } }),
  "todos-error": () => openAt("todos-error", { regions: { todos: "error" } }),
  // The mechanic's box fails once: it reverts, "Not saved. Try again."
  "todos-check-error": () =>
    openAt("todos-check-error", { failWrites: [TRAY_IDS.mechanic] }),
  // Offline the tray works and looks as online (D-USE-56, D-USE-64).
  "todos-offline": () => openAt("todos-offline", { offline: true }),
};
