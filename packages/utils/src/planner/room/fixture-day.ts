import { readDay, type DayBlockChange } from "../day-read";
import type { RoomBlock, RoomDay, RoomEvent, RoomSlot } from "./day";

/**
 * The tests' day (USE-35): the boards' morning (D-USE-8), Up at 7:00 and
 * awake at 8:10, read through `readDay` the way the edits ticket will. The
 * numbers are the drawn ones: Wellness 7:05 to 8:00, Training 8:00 to 8:57
 * with its drives, Breakfast 9:00, Work 9:30 with Call with Sam at 11:00,
 * the day ending 22:30 so a 70-minute slide lands Lights out at 23:40.
 * Work after lunch has a `block_changes` row today; a dentist's day event
 * sits inside it. Deep-frozen, so a plan that writes to its input throws.
 */

export const DATE = "2026-10-19";
const TZ = "America/Vancouver";

const block = (
  id: string,
  kind: string,
  startsAt: string,
  endsAt: string,
): RoomBlock => ({
  id,
  kind,
  startsAt,
  endsAt,
  rrule: null,
  onDate: DATE,
  archivedAt: null,
});

let order = 0;
const slot = (
  id: string,
  blockId: string,
  lengthMin: number,
  extra: Partial<RoomSlot> = {},
): RoomSlot => ({
  id,
  blockId,
  onDate: DATE,
  sortOrder: order++,
  lengthMin,
  tier: null,
  travel: false,
  atTime: null,
  ...extra,
});

export const UP_AT = 7 * 60;
export const WOKE_AT = 8 * 60 + 10;

const blocks: RoomBlock[] = [
  block("orient", "orient", "07:00", "07:05"),
  block("wellness", "wellness", "07:05", "08:00"),
  block("training", "training", "08:00", "08:57"),
  block("breakfast", "life", "09:00", "09:30"),
  block("work", "work", "09:30", "12:00"),
  block("lunch", "life", "12:00", "13:00"),
  block("work-pm", "work", "13:00", "15:00"),
  block("evening", "evening", "18:00", "22:30"),
];

const changes: DayBlockChange[] = [
  {
    blockId: "work-pm",
    onDate: DATE,
    skipped: false,
    startsAt: "13:00",
    endsAt: "15:30",
  },
];

const slots: RoomSlot[] = [
  slot("pee", "wellness", 2),
  slot("water", "wellness", 1),
  slot("meditate", "wellness", 10),
  slot("cold-bath", "wellness", 10),
  slot("journal", "wellness", 15),
  slot("drive-there", "training", 11, { travel: true, atTime: "08:00" }),
  slot("workout", "training", 35),
  slot("drive-home", "training", 11, { travel: true, atTime: "08:46" }),
  slot("eat", "breakfast", 30),
  slot("ship", "work", 30, { tier: "urgent" }),
  slot("build", "work", 40, { tier: "primary" }),
  slot("review", "work", 30, { tier: "secondary" }),
  slot("tidy", "work", 20, { tier: "stretch" }),
  slot("call-sam", "work", 30, { atTime: "11:00" }),
  slot("lunch-eat", "lunch", 45),
  slot("plan", "work-pm", 60, { tier: "primary" }),
  slot("read", "evening", 30),
];

const events: RoomEvent[] = [
  { id: "dentist", startsAt: "14:00", endsAt: "14:30" },
];

function freeze<T>(value: T): T {
  if (value !== null && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const inner of Object.values(value)) freeze(inner);
  }
  return value;
}

export function fixtureDay(): RoomDay {
  const read = readDay({ dateKey: DATE, timeZone: TZ, blocks, changes, slots });
  return freeze({ dateKey: DATE, blocks: read.blocks, events });
}

/** `HH:MM` of a block on a day, start and end. */
export function timesOf(day: RoomDay, id: string): [string, string] | "off" {
  const occurrence = day.blocks.find((one) => one.block.id === id);
  if (occurrence === undefined) throw new Error(`no block ${id}`);
  return occurrence.off ? "off" : [occurrence.startsAt, occurrence.endsAt];
}
