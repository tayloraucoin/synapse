import {
  blockItemRecord,
  blockRecord,
  dayRecordRecord,
  slotRecord,
} from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { nowDayRecords, onNowDay } from "./now-day";

/**
 * Now's other block forms (USE-17; day/now/states): the ··· menu, behind
 * the plan, a meal between blocks and before Ready, go on Taylor's Monday,
 * and the two checklist forms on Sunday 18 October. Each scenario's `now` is
 * its frame's minute.
 *
 * Ids count from 201 so they never meet the Monday's (101) or the base
 * day's.
 */

export const SUNDAY_DATE = "2026-10-18";

/** An instant on the Sunday, `HH:MM` in Toronto (EDT, -04:00). */
export function onSunday(time: string): string {
  return `${SUNDAY_DATE}T${time}:00-04:00`;
}

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

export const SUNDAY_IDS = {
  blocks: {
    reset: fixtureId(1, 201),
    checklist: fixtureId(1, 202),
    lunch: fixtureId(1, 203),
  },
} as const;

/** The checklist's rows, the same six in both forms [placeholder items]. */
export const CHECKLIST = [
  "Groceries",
  "Laundry",
  "Water the plants",
  "Meal prep",
  "Tidy the flat",
  "Plan the week",
] as const;

/** A checklist row's id in a block: 2xx for the reset, 3xx for the day. */
export function checklistItemId(form: "reset" | "day", index: number): string {
  return fixtureId(2, (form === "reset" ? 210 : 230) + index);
}

function block(fields: {
  id: string;
  kind: "wellness" | "life";
  name: string;
  startsAt: string;
  endsAt: string;
  checklist: boolean;
}) {
  return blockRecord.parse({
    ...stamps,
    icon: null,
    color: null,
    rrule: null,
    onDate: SUNDAY_DATE,
    fill: "set_items",
    meal: false,
    notify: false,
    archivedAt: null,
    ...fields,
  });
}

/** The six rows in `blockId`, Water the plants checked at 10:12. */
function checklistRows(form: "reset" | "day", blockId: string) {
  const items = CHECKLIST.map((title, sortOrder) =>
    blockItemRecord.parse({
      ...stamps,
      id: checklistItemId(form, sortOrder),
      blockId,
      title,
      icon: null,
      isTransition: false,
      atTime: null,
      // A checklist has no lengths and no times.
      lengthMin: null,
      meal: false,
      onDate: null,
      sortOrder,
    }),
  );
  const plants = CHECKLIST.indexOf("Water the plants");
  const slots = [
    slotRecord.parse({
      ...stamps,
      id: fixtureId(3, (form === "reset" ? 210 : 230) + plants),
      blockId,
      onDate: SUNDAY_DATE,
      skipped: false,
      sortOrder: plants,
      blockItemId: checklistItemId(form, plants),
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: onSunday("10:12"),
    }),
  ];
  return { items, slots };
}

/** The Sunday, readied at 9:40, with the Monday's to-dos in the tray. */
export function sundayRecords(form: "reset" | "day"): FixtureRecords {
  const monday = nowDayRecords([]);
  const blocks =
    form === "reset"
      ? [
          block({
            id: SUNDAY_IDS.blocks.reset,
            kind: "wellness",
            name: "Sunday reset",
            startsAt: "10:00",
            endsAt: "13:00",
            checklist: true,
          }),
        ]
      : [
          // A checklist with no span is the whole date (D-USE-28) [ASSUMPTION].
          block({
            id: SUNDAY_IDS.blocks.checklist,
            kind: "wellness",
            name: "Sunday",
            startsAt: "00:00",
            endsAt: "24:00",
            checklist: true,
          }),
          block({
            id: SUNDAY_IDS.blocks.lunch,
            kind: "life",
            name: "Lunch with Sam",
            startsAt: "13:00",
            endsAt: "14:30",
            checklist: false,
          }),
        ];
  const rows = checklistRows(form, blocks[0]!.id);
  return structuredClone({
    ...monday,
    blocks,
    blockItems: rows.items,
    slots: rows.slots,
    todos: monday.todos.map((todo) => ({ ...todo, onDate: SUNDAY_DATE })),
    dayRecords: [
      dayRecordRecord.parse({
        ...stamps,
        id: fixtureId(0, 231),
        onDate: SUNDAY_DATE,
        orientedAt: onSunday("09:20"),
        readyAt: onSunday("09:40"),
        closedAt: null,
      }),
    ],
  });
}

/** The Monday with nothing readied yet: oriented at 6:55, no Ready, go. */
function beforeGoRecords(): FixtureRecords {
  const records = nowDayRecords([]);
  records.dayRecords = records.dayRecords.map((record) =>
    record.onDate === BASE_DATE ? { ...record, readyAt: null } : record,
  );
  return records;
}

/** Wellness's first three items, checked by 7:14 on Now's Monday. */
const WELLNESS_DONE = ["peeAndWeigh", "water", "startColdBath"] as const;

export const NOW_FORM_SCENARIOS: Record<string, () => Scenario> = {
  "header-menu": () => ({
    name: "header-menu",
    now: onNowDay("07:14"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
    view: { open: "block-menu" },
  }),
  behind: () => ({
    name: "behind",
    now: onNowDay("08:04"),
    records: nowDayRecords(WELLNESS_DONE),
    mode: "ready",
  }),
  transition: () => ({
    name: "transition",
    now: onNowDay("09:02"),
    records: nowDayRecords([...WELLNESS_DONE, "meditate", "coldBath"]),
    mode: "ready",
  }),
  "before-ready-go": () => ({
    name: "before-ready-go",
    now: onNowDay("07:02"),
    records: beforeGoRecords(),
    mode: "ready",
    reachedByTab: true,
  }),
  "checklist-block": () => ({
    name: "checklist-block",
    now: onSunday("10:20"),
    records: sundayRecords("reset"),
    mode: "ready",
  }),
  "sunday-checklist": () => ({
    name: "sunday-checklist",
    now: onSunday("11:20"),
    records: sundayRecords("day"),
    mode: "ready",
  }),
  // A box ticked while its write is still out: shown checked at once.
  "sunday-checklist-tick-pending": () => ({
    name: "sunday-checklist-tick-pending",
    now: onSunday("11:20"),
    records: sundayRecords("day"),
    mode: "ready",
    slotWrites: "hang",
  }),
  // A box whose write fails: back as the server has it, "Not saved." under it.
  "sunday-checklist-not-saved": () => ({
    name: "sunday-checklist-not-saved",
    now: onSunday("11:20"),
    records: sundayRecords("day"),
    mode: "ready",
    failWrites: [checklistItemId("day", 0)],
  }),
};
