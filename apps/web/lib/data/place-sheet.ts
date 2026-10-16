import {
  clockMinutes,
  firstDayWithRoom,
  fitInBlock,
  topMinutes,
  weekdayIndex,
  type BlockFitDay,
  type BlockFitSlot,
  type WorkSize,
  type WorkTier,
} from "@syn/utils";
import type { SlotRecord, WorkItemRecord } from "@syn/validators";
import { rangeWords } from "@/components/work/from-linear/picker-view";
import { SIZE_RANGE } from "@/components/work/add/new-task/form";
import { workBlocksOf, type PlaceTo } from "./place";
import { clockWords, lengthWords, shortDate } from "./spread";
import type { SetUpDay } from "./use-set-up-day";
import type { SetUpWeek } from "./use-week";
import { dueBadge, SIZE_WORDS, TIER_WORDS } from "./week-view";

/**
 * The phone's place sheet, worked out (USE-80; interactions/place-from-the-
 * pool/states/place-sheet.md and doesnt-fit.md): the week's day chips, each
 * picked day's fit in its first Work block, where a placing lands (USE-75),
 * the fit line, the doesn't-fit card and the action's words. Nothing moves
 * here (C-USE-this-week-2): the sheet's action hands `targets` to usePlace.
 *
 * Fit is USE-8's `fitInBlock` at the top of every range, the tiers at and
 * above the chosen one counted; past Work's end is said with its time, in
 * words (C-USE-place-from-the-pool-place-sheet-2). The next day with room is
 * USE-8's `firstDayWithRoom` over the later offered days of the week, and the
 * card names lengths only (C-USE-place-from-the-pool-doesnt-fit-1). Every
 * word is printed here.
 */

const WEEKDAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const LETTER = ["M", "T", "W", "T", "F", "S", "S"];

const shortDay = (dateKey: string) => SHORT[weekdayIndex(dateKey)]!;
const dateOf = (dateKey: string) => Number(dateKey.slice(8, 10));
/** "Tuesday 13". */
export const longDate = (dateKey: string) =>
  `${WEEKDAY[weekdayIndex(dateKey)]} ${dateOf(dateKey)}`;

/** "2 h 30" read aloud: "2 hours 30". */
export const spokenLength = (words: string) =>
  words.replace(/^1 h\b/, "1 hour").replace(/(\d+) h\b/, "$1 hours");

/** "Tue", "Tue and Wed", "Mon, Tue and Thu". */
export function dayList(dateKeys: readonly string[]): string {
  const names = [...dateKeys].sort().map(shortDay);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names.at(-1)}`;
}

export const PLACE_SHEET_WORDS = {
  pool: "Pool",
  linear: "Linear",
  unsized: "unsized",
  title: (title: string) => `Place ${title}`,
  sessions:
    "One day places it. Two or more days make it sessions of one task, each “Done for today” on its own day.",
  days: "Days",
  tier: "Tier",
  tierValue: (tier: WorkTier) => `Tier: ${TIER_WORDS[tier]}`,
  close: "Close",
  /** "Tue's Primary runs to 11:40 at the top of its ranges." */
  runsFirst: (day: string, tier: WorkTier, to: string, past: string | null) =>
    past === null
      ? `${day}'s ${TIER_WORDS[tier]} runs to ${to} at the top of its ranges.`
      : `${day}'s ${TIER_WORDS[tier]} runs to ${to} at the top of its ranges, past Work's end at ${past}.`,
  /** "Wed's runs to 12:10, past Work's end at 12:00." */
  runsNext: (day: string, to: string, past: string | null) =>
    past === null
      ? `${day}'s runs to ${to}.`
      : `${day}'s runs to ${to}, past Work's end at ${past}.`,
  /** [ASSUMPTION] An item with no top (Huge with no hours) gives no time. */
  noTop: (day: string, tier: WorkTier, size: string) =>
    `${day}'s ${TIER_WORDS[tier]} can't be counted: ${size} names no hours.`,
  placeOn: (days: string) => `Place on ${days}`,
  placeAnyway: (day: string) => `Place on ${day} anyway`,
  /** [ASSUMPTION] for one day, as placed-undo.md. */
  placed: (days: string, tier: WorkTier) =>
    `Placed on ${days}, in ${TIER_WORDS[tier]}.`,
  undo: "Undo",
  undoName: "Undo placing",
  doesntFitBy: (day: string, by: string | null) =>
    by === null
      ? `${day}'s Work doesn't fit it`
      : `${day}'s Work doesn't fit it by ${by}`,
  why: (size: string, range: string, day: string, tier: WorkTier, held: string) =>
    `${size} runs ${range}; ${day}'s ${TIER_WORDS[tier]} already holds ${held} at the top of its ranges.`,
  /** [ASSUMPTION] Nothing above or in the tier yet. */
  nothing: "nothing",
  spread: "Spread it across the week",
  hasRoom: (date: string, length: string) => `${date} has room, ${length}`,
  takeDay: (day: string) => `Use ${day}`,
  takeDayName: (date: string, length: string) => `Use ${date}, ${length} free`,
  /** Why a day is not offered, in words (C-USE-this-week-no-work-block-1). */
  reasons: {
    past: "Already gone",
    "no-work": "No Work block",
    holds: "Already holds it",
  },
  chipName: (date: string, reason: string | null) =>
    reason === null ? date : `${date}, ${reason}`,
} as const;

export type PlaceDayReason = keyof typeof PLACE_SHEET_WORDS.reasons;

/** What the sheet places: a pool item, or a Linear issue not in the pool yet. */
export interface PlaceSheetItem {
  workItemId: string | null;
  title: string;
  size: WorkSize | null;
  lengthMinMin: number | null;
  lengthMaxMin: number | null;
  identifier: string | null;
  clientName: string | null;
  dueOn: string | null;
}

export function placeItemOf(
  item: WorkItemRecord,
  clientName: string | null,
): PlaceSheetItem {
  return {
    workItemId: item.id,
    title: item.title,
    size: item.size,
    lengthMinMin: item.lengthMinMin,
    lengthMaxMin: item.lengthMaxMin,
    identifier: item.linearIdentifier,
    clientName,
    dueOn: item.dueOn,
  };
}

export interface PlaceDayChip {
  dateKey: string;
  /** "T" over "13". */
  letter: string;
  date: number;
  /** "T 13", the compact chip. */
  short: string;
  offered: boolean;
  reason: PlaceDayReason | null;
  picked: boolean;
  /** The day has a Work block: the compact chips leave the rest out. */
  hasWork: boolean;
  /** "Tuesday 13", or "Saturday 17, No Work block". */
  name: string;
}

export interface PlaceDayFit {
  dateKey: string;
  blockId: string;
  fits: boolean;
  /** "11:40"; null when the item names no top. */
  runsTo: string | null;
  /** "12:00", the block's end. */
  workEnds: string;
  overMin: number | null;
  /** What the tiers at and above already hold, at the top of their ranges. */
  heldMin: number;
}

export interface DoesntFitView {
  dateKey: string;
  /** "Tue's Work doesn't fit it by 1 h 40". */
  headline: string;
  /** "5 Large runs 2 to 4 h; Tue's Primary already holds 1 h 50 at the top of its ranges." */
  why: string;
  /** Spread's sheet for this item; a Linear issue not in the pool has none. */
  spread: boolean;
  /** "Spread it across the week". */
  spreadWords: string;
  next: {
    dateKey: string;
    /** "Thu 15 has room, 2 h 30". */
    line: string;
    /** "Use Thu". */
    use: string;
    /** "Use Thursday 15, 2 hours 30 free". */
    name: string;
  } | null;
  /** "Place on Tue anyway". */
  anyway: string;
}

export interface PlaceSheetView {
  /** "Pool · Kestrel Health · KES-58 · 3 Medium · due Wed". */
  meta: string;
  title: string;
  chips: PlaceDayChip[];
  picked: string[];
  tier: WorkTier;
  fits: PlaceDayFit[];
  /** The fit per picked day, in words; null when the card replaces it. */
  fitLine: string | null;
  /** One day picked that cannot hold it (D-USE-108 (2)). */
  doesntFit: DoesntFitView | null;
  /** "Place on Tue and Wed"; null with no day picked. */
  action: string | null;
  /** "Placed on Tue and Wed, in Primary." */
  toast: string;
  /** Where each picked day's placing lands: its first Work block (USE-75). */
  targets: PlaceTo[];
}

export interface PlaceSheetInput {
  week: SetUpWeek;
  item: PlaceSheetItem;
  /** Where the item sits already (its open sessions' dates). */
  holds: readonly string[];
  picked: readonly string[];
  tier: WorkTier;
  todayKey: string;
  /** The day the sheet opens over: due words count from it. */
  dateKey: string;
  from: "pool" | "linear";
}

const MIN_MS = 60_000;
const at = (time: string) => new Date(clockMinutes(time) * MIN_MS);
const minutesOf = (date: Date) => Math.round(date.getTime() / MIN_MS);

/** The item's top: its own range, then its size's (USE-8's `topMinutes`). */
export const itemTopMin = (item: PlaceSheetItem) =>
  topMinutes({
    lengthMin: null,
    lengthMaxMin: item.lengthMaxMin,
    size: item.size,
  });

/** "2 to 4 h": its own range when it names one, else its size's. */
function rangeOf(item: PlaceSheetItem): string | null {
  if (item.lengthMaxMin !== null || item.lengthMinMin !== null) {
    const max = item.lengthMaxMin;
    const min = item.lengthMinMin ?? max ?? 0;
    return rangeWords(min, max);
  }
  if (item.size === null) return null;
  const range = SIZE_RANGE[item.size];
  return rangeWords(range.min, range.max);
}

const sizeWord = (item: PlaceSheetItem) =>
  item.size ? SIZE_WORDS[item.size] : PLACE_SHEET_WORDS.unsized;

/** A day's first Work block as USE-8 reads it, the item's own slots left out. */
export function fitDayOf(
  day: SetUpDay,
  workItemId: string | null,
): (BlockFitDay & { blockId: string; endsAt: string }) | null {
  const block = workBlocksOf(day)[0];
  if (!block || day.date === null) return null;
  const items = new Map(day.records.workItems.map((w) => [w.id, w]));
  const tierOf = (slot: SlotRecord): WorkTier => slot.tier ?? "primary";
  const slots: BlockFitSlot[] = block.slots.flatMap((slot) => {
    if (slot.workItemId === null || slot.workItemId === workItemId) return [];
    const w = items.get(slot.workItemId);
    return [
      {
        tier: tierOf(slot),
        topMin: topMinutes({
          lengthMin: slot.lengthMin,
          lengthMaxMin: w?.lengthMaxMin ?? null,
          size: w?.size ?? null,
        }),
      },
    ];
  });
  return {
    dateKey: day.date,
    blockId: block.block.id,
    endsAt: block.endsAt,
    block: { start: at(block.startsAt), end: at(block.endsAt) },
    slots,
    busy: day.events.map((e) => ({ start: at(e.startsAt), end: at(e.endsAt) })),
  };
}

const RANK: Record<WorkTier, number> = {
  urgent: 0,
  primary: 1,
  secondary: 2,
  stretch: 3,
};

/** What the tiers at and above `tier` already hold, at the top of their ranges. */
function heldMinOf(day: BlockFitDay, tier: WorkTier): number {
  return day.slots
    .filter((slot) => RANK[slot.tier] <= RANK[tier])
    .reduce((sum, slot) => sum + Math.ceil(slot.topMin ?? 0), 0);
}

export function placeSheetView(input: PlaceSheetInput): PlaceSheetView {
  const { item, tier } = input;
  const topMin = itemTopMin(item);
  const holds = new Set(input.holds);

  const fitDays = new Map(
    input.week.days.flatMap((day) => {
      const fit = fitDayOf(day, item.workItemId);
      return fit ? [[fit.dateKey, fit] as const] : [];
    }),
  );

  const chips: PlaceDayChip[] = input.week.days.flatMap((day) => {
    const dateKey = day.date;
    if (dateKey === null) return [];
    const reason: PlaceDayReason | null =
      dateKey < input.todayKey
        ? "past"
        : !fitDays.has(dateKey)
          ? "no-work"
          : holds.has(dateKey)
            ? "holds"
            : null;
    const date = dateOf(dateKey);
    const letter = LETTER[weekdayIndex(dateKey)]!;
    return [
      {
        dateKey,
        letter,
        date,
        short: `${letter} ${date}`,
        offered: reason === null,
        reason,
        picked: reason === null && input.picked.includes(dateKey),
        hasWork: fitDays.has(dateKey),
        name: PLACE_SHEET_WORDS.chipName(
          longDate(dateKey),
          reason === null ? null : PLACE_SHEET_WORDS.reasons[reason],
        ),
      },
    ];
  });
  const picked = chips.filter((c) => c.picked).map((c) => c.dateKey);

  const fits: PlaceDayFit[] = picked.map((dateKey) => {
    const day = fitDays.get(dateKey)!;
    const fit = fitInBlock({ ...day, block: day.block!, tier, topMin });
    return {
      dateKey,
      blockId: day.blockId,
      fits: fit.fits,
      runsTo: fit.runsTo === null ? null : clockWords(minutesOf(fit.runsTo)),
      workEnds: clockWords(clockMinutes(day.endsAt)),
      overMin: fit.fits ? null : fit.overMin,
      heldMin: heldMinOf(day, tier),
    };
  });

  const only = fits.length === 1 ? fits[0]! : null;
  const doesntFit: DoesntFitView | null =
    only && !only.fits ? doesntFitOf(input, only, fitDays, chips, topMin) : null;

  const fitLine =
    fits.length === 0 || doesntFit
      ? null
      : fits
          .map((fit, i) => {
            const day = shortDay(fit.dateKey);
            const past = fit.fits ? null : fit.workEnds;
            if (fit.runsTo === null)
              return PLACE_SHEET_WORDS.noTop(day, tier, sizeWord(item));
            return i === 0
              ? PLACE_SHEET_WORDS.runsFirst(day, tier, fit.runsTo, past)
              : PLACE_SHEET_WORDS.runsNext(day, fit.runsTo, past);
          })
          .join(" ");

  const days = dayList(picked);
  const due = item.dueOn ? dueWord(item.dueOn, input.dateKey) : null;
  const meta = [
    input.from === "pool" ? PLACE_SHEET_WORDS.pool : PLACE_SHEET_WORDS.linear,
    item.clientName,
    item.identifier,
    sizeWord(item),
    due,
  ]
    .filter(Boolean)
    .join(" · ");

  return {
    meta,
    title: PLACE_SHEET_WORDS.title(item.title),
    chips,
    picked,
    tier,
    fits,
    fitLine,
    doesntFit,
    action:
      picked.length === 0
        ? null
        : doesntFit
          ? doesntFit.anyway
          : PLACE_SHEET_WORDS.placeOn(days),
    toast: PLACE_SHEET_WORDS.placed(days, tier),
    targets: fits.map((fit) => ({
      dateKey: fit.dateKey,
      blockId: fit.blockId,
      tier,
    })),
  };
}

function doesntFitOf(
  input: PlaceSheetInput,
  fit: PlaceDayFit,
  fitDays: ReadonlyMap<string, BlockFitDay & { blockId: string }>,
  chips: readonly PlaceDayChip[],
  topMin: number | null,
): DoesntFitView {
  const { item, tier } = input;
  const day = shortDay(fit.dateKey);
  const later = chips
    .filter((c) => c.offered && c.dateKey > fit.dateKey)
    .map((c) => fitDays.get(c.dateKey)!);
  const nextKey = firstDayWithRoom(later, tier, topMin);
  const nextDay = nextKey ? fitDays.get(nextKey)! : null;
  const room = nextDay
    ? fitInBlock({ ...nextDay, block: nextDay.block!, tier, topMin: 0 })
    : null;
  const freeMin = room && room.fits ? room.freeMin : 0;
  const range = rangeOf(item);
  const held =
    fit.heldMin === 0 ? PLACE_SHEET_WORDS.nothing : lengthWords(fit.heldMin);
  return {
    dateKey: fit.dateKey,
    headline: PLACE_SHEET_WORDS.doesntFitBy(
      day,
      fit.overMin === null ? null : lengthWords(fit.overMin),
    ),
    why:
      range === null
        ? `${sizeWord(item)}; ${day}'s ${TIER_WORDS[tier]} already holds ${held} at the top of its ranges.`
        : PLACE_SHEET_WORDS.why(sizeWord(item), range, day, tier, held),
    spread: item.workItemId !== null,
    spreadWords: PLACE_SHEET_WORDS.spread,
    next: nextKey
      ? {
          dateKey: nextKey,
          line: PLACE_SHEET_WORDS.hasRoom(shortDate(nextKey), lengthWords(freeMin)),
          use: PLACE_SHEET_WORDS.takeDay(shortDay(nextKey)),
          name: PLACE_SHEET_WORDS.takeDayName(
            longDate(nextKey),
            spokenLength(lengthWords(freeMin)),
          ),
        }
      : null,
    anyway: PLACE_SHEET_WORDS.placeAnyway(day),
  };
}

/** "due Wed", from two days ahead (D-USE-98), counted from the sheet's day. */
function dueWord(dueOn: string, from: string): string | null {
  const badge = dueBadge(dueOn, from);
  if (!badge) return null;
  return badge.word.charAt(0).toLowerCase() + badge.word.slice(1);
}
