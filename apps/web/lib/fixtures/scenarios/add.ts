import { blockChangeRecord, clientRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_NOW } from "./base-day";
import type { Scenario } from "./index";
import { SET_UP_IDS, SET_UP_NOW, setUpThisWeekRecords } from "./set-up";

/**
 * + Add and New task (USE-51) on USE-36's this week, 12 to 18 Oct, drawn as
 * add/states/new-task.md: Work 9:30 to 12:00 Monday to Friday, none at the
 * weekend, so Sat 17 and Sun 18 are dashed. Monday's Primary holds 10 min,
 * so a Medium task runs it to 11:40; Wednesday's Work starts at 9:10 this
 * week, so Wed's runs to 11:10. Clients on: Kestrel and Alder. Bracketed
 * names are the boards' placeholders.
 *
 * `add-sheet`, `add-menu` and `add-new-task` stand at Monday 10:20, during
 * Work; `add-save-to-the-pool` at Sunday 21:10 in Set my days' Pool.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Add's ids count from 401, clear of the set-up's and the pool's. */
const id = (table: number, n: number) => fixtureId(table, 400 + n);

export const ADD_IDS = {
  clients: { kestrel: id(5, 1), alder: id(5, 2) },
  wednesdayWork: id(0, 1),
} as const;

const MON_FRI =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

export function addRecords(): FixtureRecords {
  const week = setUpThisWeekRecords();
  const W = SET_UP_IDS.workItems;
  return structuredClone({
    ...week,
    // Friday works this week too; the afternoon's Work stays Monday to Thursday.
    blocks: week.blocks.map((block) =>
      block.id === SET_UP_IDS.blocks.work
        ? { ...block, rrule: MON_FRI }
        : block,
    ),
    blockChanges: [
      blockChangeRecord.parse({
        ...stamps,
        id: ADD_IDS.wednesdayWork,
        blockId: SET_UP_IDS.blocks.work,
        onDate: "2026-10-14",
        skipped: false,
        startsAt: "09:10",
        endsAt: "12:00",
      }),
    ],
    // [Write the sync spec] holds Monday's 10 min of Primary.
    slots: week.slots.map((slot) =>
      slot.workItemId === W.syncSpec ? { ...slot, lengthMin: 10 } : slot,
    ),
    clients: [
      { id: ADD_IDS.clients.kestrel, name: "Kestrel", colorKey: "rose" },
      { id: ADD_IDS.clients.alder, name: "Alder", colorKey: "moss" },
    ].map((client, sortOrder) =>
      clientRecord.parse({
        ...stamps,
        logoPath: null,
        archivedAt: null,
        sortOrder,
        ...client,
      }),
    ),
    clientsEnabled: true,
  });
}

function add(name: string, now: string): () => Scenario {
  return () => ({ name, now, records: addRecords(), mode: "ready" });
}

export const ADD_SCENARIOS: Record<string, () => Scenario> = {
  "add-sheet": add("add-sheet", BASE_NOW),
  "add-menu": add("add-menu", BASE_NOW),
  "add-new-task": add("add-new-task", BASE_NOW),
  "add-save-to-the-pool": add("add-save-to-the-pool", SET_UP_NOW),
};
