import { slotRecord, workItemRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { Scenario } from "./index";
import { POOL_IDS } from "./pool";
import { POOL_SHEET_IDS } from "./pool-sheet";
import { SET_UP_IDS } from "./set-up";
import { SPREAD_PHONE_NOW, SPREAD_PHONE_SCENARIOS } from "./spread";

/**
 * The phone's place sheet (USE-80): Spread's phone week (USE-78: the pool
 * sheet's records, Monday 12 at 21:10, Friday set as Thursday), with
 * [Case studies: Alder intro] (ALD-17) in sessions: Mon 12 in Secondary,
 * Tue 13 in Primary for 10 min and Wed 14 in Primary for 40 min, so
 * KES-58 (3 Medium, 2 h at the top) runs to 11:40 on Tue and to 12:10 on
 * Wed, past Work's end at 12:00, as the board says.
 *
 * `doesnt-fit` adds [Portal: sign-in outage] (KES-64) in Tue's Urgent for
 * 2 h and gives KES-61 2 h [ASSUMPTION: the board's 5 Large at its full
 * 4 h fits no 2 h 30 Work block on any day, so it could have no "next day
 * with room"]: Tue's Work then misses it by 1 h 40, Wed by 10 min, and
 * Thu 15 has room, 2 h 30. Bracketed names are the boards' placeholders.
 */

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };

/** Place sheet ids count from 831, clear of the pool sheet's. */
const id = (table: number, n: number) => fixtureId(table, 830 + n);

export const PLACE_SHEET_IDS = {
  workItems: { ald17: id(4, 1), kes64: id(4, 2) },
  slots: {
    ald17Mon: id(3, 1),
    ald17Tue: id(3, 2),
    ald17Wed: id(3, 3),
    kes64Tue: id(3, 4),
  },
} as const;

export const PLACE_SHEET_NOW = SPREAD_PHONE_NOW;
/** Monday 12: the day the sheets open over. */
export const PLACE_SHEET_DATE = "2026-10-12";

const W = PLACE_SHEET_IDS.workItems;
const S = PLACE_SHEET_IDS.slots;

function item(fields: {
  id: string;
  title: string;
  emoji: string;
  size: "small" | "medium";
  clientId: string;
  linearIdentifier: string;
}) {
  const { emoji, ...rest } = fields;
  return workItemRecord.parse({
    ...stamps,
    notes: null,
    icon: { kind: "emoji", value: emoji },
    lengthMinMin: null,
    lengthMaxMin: null,
    dueOn: null,
    parentWorkItemId: null,
    doneAt: null,
    doneSource: null,
    archivedAt: null,
    linearConnectionId: null,
    linearIssueId: null,
    ...rest,
  });
}

function session(
  slotId: string,
  workItemId: string,
  onDate: string,
  tier: "urgent" | "primary" | "secondary",
  lengthMin: number,
) {
  return slotRecord.parse({
    ...stamps,
    id: slotId,
    blockId: SET_UP_IDS.blocks.work,
    onDate,
    skipped: false,
    sortOrder: 30,
    blockItemId: null,
    todoId: null,
    workItemId,
    tier,
    lengthMin,
    tookMin: null,
    doneAt: null,
  });
}

export type PlaceSheetScenarioName = "place-sheet" | "placed-undo" | "doesnt-fit";

function placeSheet(name: PlaceSheetScenarioName) {
  return (): Scenario => {
    const base = SPREAD_PHONE_SCENARIOS["spread-402"]!();
    const records = base.records;
    const alder = item({
      id: W.ald17,
      title: "[Case studies: Alder intro]",
      emoji: "✍️",
      size: "small",
      clientId: POOL_IDS.clients.alder,
      linearIdentifier: "ALD-17",
    });
    const workItems = [...records.workItems, alder];
    const slots = [
      ...records.slots,
      session(S.ald17Mon, W.ald17, "2026-10-12", "secondary", 30),
      session(S.ald17Tue, W.ald17, "2026-10-13", "primary", 10),
      session(S.ald17Wed, W.ald17, "2026-10-14", "primary", 40),
    ];
    if (name === "doesnt-fit") {
      workItems.push(
        item({
          id: W.kes64,
          title: "[Portal: sign-in outage]",
          emoji: "🚨",
          size: "medium",
          clientId: POOL_IDS.clients.kestrel,
          linearIdentifier: "KES-64",
        }),
      );
      slots.push(session(S.kes64Tue, W.kes64, "2026-10-13", "urgent", 120));
    }
    return {
      name,
      now: PLACE_SHEET_NOW,
      records: {
        ...records,
        workItems: workItems.map((w) =>
          name === "doesnt-fit" && w.id === POOL_SHEET_IDS.workItems.kes61
            ? { ...w, lengthMinMin: 120, lengthMaxMin: 120 }
            : w,
        ),
        slots,
      },
      mode: "ready",
    };
  };
}

export const PLACE_SHEET_SCENARIOS: Record<string, () => Scenario> = {
  "place-sheet": placeSheet("place-sheet"),
  "placed-undo": placeSheet("placed-undo"),
  "doesnt-fit": placeSheet("doesnt-fit"),
};
