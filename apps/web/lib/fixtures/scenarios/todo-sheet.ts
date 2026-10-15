import { todoRecord, type TodoRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { nowDayRecords, onNowDay, type NowItemName } from "./now-day";

/**
 * The To-do sheet's states (USE-28; day/todo-sheet/), opened over Now on
 * Taylor's Monday 12 October: "Call the mechanic" in the tray with no day
 * yet, Call, 📞, no repeat, no reminder, and Notes of two lines. Each opens
 * at `?state=<name>&sheet=todo&id=<TODO_SHEET_IDS.mechanic>`; `view.open`
 * opens a select inside it for its capture.
 */

export const TODO_SHEET_IDS = {
  mechanic: fixtureId(6, 301),
} as const;

const WELLNESS_DONE: NowItemName[] = ["peeAndWeigh", "water", "startColdBath"];

/** Allowed, installed: the switch shows (`reminder-availability.ts`). */
const NOTIFYING = {
  ios: true,
  standalone: true,
  permission: "granted",
} as const;

export function mechanicTodo(patch: Partial<TodoRecord> = {}): TodoRecord {
  return todoRecord.parse({
    id: TODO_SHEET_IDS.mechanic,
    createdAt: "2026-10-11T20:00:00.000Z",
    updatedAt: "2026-10-11T20:00:00.000Z",
    title: "Call the mechanic",
    type: "call",
    icon: { kind: "emoji", value: "📞" },
    lengthMin: null,
    notes:
      "Dave at Northside Auto, 555-0142\nAsk about the brake noise and a quote",
    onDate: null,
    rrule: null,
    remindAt: null,
    remindOn: null,
    doneAt: null,
    archivedAt: null,
    ...patch,
  });
}

function sheetDay(todo: TodoRecord): FixtureRecords {
  return { ...nowDayRecords(WELLNESS_DONE), todos: [todo] };
}

function sheet(
  name: string,
  extra: Partial<Scenario> = {},
  todo: TodoRecord = mechanicTodo(),
): Scenario {
  return {
    name,
    now: onNowDay("07:14"),
    records: sheetDay(todo),
    mode: "ready",
    device: NOTIFYING,
    ...extra,
  };
}

export const TODO_SHEET_SCENARIOS: Record<string, () => Scenario> = {
  "todo-sheet": () => sheet("todo-sheet"),
  "type-open": () => sheet("type-open", { view: { open: "todo-type" } }),
  // On Monday the 12th, so the list reads "on Monday" and "on the 12th".
  "repeats-open": () =>
    sheet("repeats-open", { view: { open: "todo-repeats" } }),
  "reminder-on": () =>
    sheet(
      "reminder-on",
      {},
      mechanicTodo({ remindOn: BASE_DATE, remindAt: "12:30" }),
    ),
  "not-installed": () =>
    sheet("not-installed", {
      device: { ios: true, standalone: false, permission: "default" },
    }),
  "notifications-off": () =>
    sheet("notifications-off", {
      device: { ios: true, standalone: true, permission: "denied" },
    }),
  // The first change fails once: the field reverts, "Not saved. Try again."
  "todo-sheet-error": () =>
    sheet("todo-sheet-error", { failWrites: [TODO_SHEET_IDS.mechanic] }),
  // Offline the sheet works as online (D-USE-56, D-USE-64).
  "todo-sheet-offline": () => sheet("todo-sheet-offline", { offline: true }),
};
