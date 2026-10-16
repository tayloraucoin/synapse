import { addDays } from "@syn/utils";
import { blockItemRecord, blockRecord, dayBoundsRecord } from "@syn/validators";
import { fixtureId } from "../ids";
import type { FixtureRecords } from "../records";
import { BASE_DATE } from "./base-day";
import type { Scenario } from "./index";
import { itemSheetRecords } from "./item-sheet";
import {
  ITEM_SHEET_LINEAR_IDS,
  itemSheetLinearRecords,
} from "./item-sheet-linear";
import { NOW_IDS, onNowDay } from "./now-day";
import { onMonday, todayWorkRecords } from "./today-desk";
import { WEEK_IDS } from "./week";

/**
 * Move to's states (USE-69; interactions/move-to), on Taylor's Monday 12
 * October. `?sheet=item&id=<MOVE_TO_IDS.*>&state=move-<state>`.
 *
 * - plain, pick-a-day, no-kind: Meditate (10 min, Wellness 7:05 to 8:00) at
 *   6:58. Lunch 12:00 to 13:00 holds its 30 min meal; [Wind down] 21:30 to
 *   22:00 holds 25 min. Wellness runs on weekdays, so Saturday 24 has none.
 *   The days 12 to 17 have their own Up at and Lights out ("already set").
 * - linear: [Fix the sync retry] (ENG-123, Primary, Work 9:30 to 12:00) at
 *   6:58, with the afternoon's Work blocks later today.
 * - work, undo: work's Monday at 9:40; [Desk Today layout] moved into the
 *   morning's Secondary (Work 9:30 to 12:00), from the work menu (its own sheet, ×); undo moves it to Work 13:00 on
 *   load and shows the toast.
 */

export const MOVE_TO_IDS = {
  plain: NOW_IDS.items.meditate,
  linear: ITEM_SHEET_LINEAR_IDS.item,
  work: WEEK_IDS.workItems.syn212,
  blocks: { lunch: fixtureId(1, 691), windDown: fixtureId(1, 692) },
  items: { meal: fixtureId(2, 691), read: fixtureId(2, 692) },
} as const;

const STAMP = "2026-10-01T12:00:00.000Z";
const stamps = { createdAt: STAMP, updatedAt: STAMP };
const WEEKDAYS =
  "DTSTART;VALUE=DATE:20261001\nRRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR";

function block(
  id: string,
  kind: "break" | "wellness",
  name: string,
  startsAt: string,
  endsAt: string,
) {
  return blockRecord.parse({
    ...stamps,
    id,
    kind,
    name,
    icon: null,
    color: null,
    startsAt,
    endsAt,
    rrule: WEEKDAYS,
    onDate: null,
    fill: "set_items",
    checklist: false,
    meal: kind === "break",
    notify: false,
    archivedAt: null,
  });
}

function item(
  id: string,
  blockId: string,
  title: string,
  lengthMin: number,
  meal: boolean,
) {
  return blockItemRecord.parse({
    ...stamps,
    id,
    blockId,
    title,
    icon: {
      kind: "curated",
      value: meal ? "utensils" : "book",
      colorKey: null,
    },
    isTransition: false,
    atTime: null,
    lengthMin,
    meal,
    onDate: null,
    sortOrder: 0,
  });
}

/** Monday 12 as the Item sheet draws it, with Lunch, [Wind down] and the week set. */
export function moveToPlainRecords(): FixtureRecords {
  const records = itemSheetRecords(false);
  const B = MOVE_TO_IDS.blocks;
  records.blocks = records.blocks.map((row) =>
    row.id === NOW_IDS.blocks.wellness ? { ...row, rrule: WEEKDAYS } : row,
  );
  records.blocks.push(
    block(B.lunch, "break", "Lunch", "12:00", "13:00"),
    block(B.windDown, "wellness", "[Wind down]", "21:30", "22:00"),
  );
  records.blockItems.push(
    item(MOVE_TO_IDS.items.meal, B.lunch, "Lunch", 30, true),
    item(MOVE_TO_IDS.items.read, B.windDown, "[Read]", 25, false),
  );
  for (let n = 0; n < 6; n += 1) {
    const onDate = addDays(BASE_DATE, n);
    records.dayBounds.push(
      dayBoundsRecord.parse({
        ...stamps,
        id: fixtureId(0, 691 + n),
        weekday: null,
        onDate,
        upAt: "06:30",
        lightsOut: "22:30",
      }),
    );
  }
  return records;
}

const EARLY = onNowDay("06:58");

function plain(name: string, open: string): () => Scenario {
  return () => ({
    name,
    now: EARLY,
    records: moveToPlainRecords(),
    mode: "ready",
    view: { open },
  });
}

/** Work's Monday with [Desk Today layout] in the morning's Secondary, as step 8 draws its row. */
function moveToWorkRecords(): FixtureRecords {
  const records = todayWorkRecords();
  const morning = WEEK_IDS.blocks.workMorning;
  const top = records.slots
    .filter((row) => row.blockId === morning && row.onDate === BASE_DATE)
    .reduce((max, row) => Math.max(max, row.sortOrder), -1);
  records.slots = records.slots.map((row) =>
    row.workItemId === MOVE_TO_IDS.work && row.onDate === BASE_DATE
      ? {
          ...row,
          blockId: morning,
          tier: "secondary",
          sortOrder: top + 1,
          lengthMin: 20,
        }
      : row,
  );
  return records;
}

function work(name: string): () => Scenario {
  return () => ({
    name,
    now: onMonday("09:40"),
    records: moveToWorkRecords(),
    mode: "ready",
  });
}

export const MOVE_TO_SCENARIOS: Record<string, () => Scenario> = {
  "move-plain": plain("move-plain", "item:move"),
  "move-pick-a-day": plain("move-pick-a-day", "item:move:pick:2026-10-15"),
  "move-no-kind": plain("move-no-kind", "item:move:pick:2026-10-24"),
  "move-linear": () => ({
    name: "move-linear",
    now: EARLY,
    records: itemSheetLinearRecords(),
    mode: "ready",
    view: { open: "item:move" },
  }),
  "move-work": work("move-work"),
  "move-undo": work("move-undo"),
};
