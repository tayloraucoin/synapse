import {
  clockMinutes,
  fitInBlock,
  topMinutes,
  weekdayIndex,
  type BlockFitSlot,
  type WorkSize,
  type WorkTier,
} from "@syn/utils";
import type { Pool } from "./pool-records";
import type { SetUpWeek } from "./use-week";

/**
 * The Week's pure reads (USE-72): a chip's due badge, worked out for its own
 * day column, never from today (D-USE-98), and a day's Fits line, a time at
 * the top of the ranges, never a count (N6, C-USE-week-8).
 */

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DAY_MS = 86_400_000;
const MIN_MS = 60_000;

export type DueTone = "warning" | "danger";

export interface DueBadge {
  word: string;
  tone: DueTone;
}

function dayNumber(dateKey: string): number {
  const [y, m, d] = dateKey.split("-").map(Number);
  return Date.UTC(y!, m! - 1, d!) / DAY_MS;
}

/**
 * From two days before the due date in warning ("Due Thu", "Due tomorrow");
 * on the day "Due today" in danger. [ASSUMPTION] A column after the due date
 * reads "Due <day>" in danger: D-USE-98 rules danger "on the day and after".
 */
export function dueBadge(
  dueOn: string | null,
  columnDate: string,
): DueBadge | null {
  if (dueOn === null) return null;
  const ahead = dayNumber(dueOn) - dayNumber(columnDate);
  const day = WEEKDAY_SHORT[weekdayIndex(dueOn)]!;
  if (ahead > 2) return null;
  if (ahead === 2) return { word: `Due ${day}`, tone: "warning" };
  if (ahead === 1) return { word: "Due tomorrow", tone: "warning" };
  if (ahead === 0) return { word: "Due today", tone: "danger" };
  return { word: `Due ${day}`, tone: "danger" };
}

export interface FitsBlock {
  /** "09:30" wall-clock. */
  startsAt: string;
  endsAt: string;
  /** The block's slots on the date, each with its top (USE-8's `topMinutes`). */
  slots: readonly BlockFitSlot[];
}

export interface FitsDay {
  /** The day's Work blocks only. */
  workBlocks: readonly FitsBlock[];
  /** The day's events, pinned spans inside a block. */
  events: readonly { startsAt: string; endsAt: string }[];
}

/** Minutes past midnight as an instant on a fixed day: fitInBlock reads spans only. */
function at(time: string): Date {
  const [h, m] = time.split(":").map(Number);
  return new Date((h! * 60 + m!) * MIN_MS);
}

function wallClock(instant: Date): string {
  const min = Math.round(instant.getTime() / MIN_MS);
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
}

/**
 * Where the day's slotted work ends at the top of its ranges: each Work
 * block's slots through `fitInBlock` (every tier, the events as busy), the
 * line read from the last block that holds work. [ASSUMPTION] A block that
 * cannot hold its work reads "Doesn't fit by <n> min", summed over the day,
 * in ink (words-and-access.md); a slot with no top (Huge, no range) counts 0.
 */
export function fitsLine(day: FitsDay): string {
  if (day.workBlocks.length === 0) return "No work blocks";
  const blocks = [...day.workBlocks].sort((a, b) =>
    a.startsAt.localeCompare(b.startsAt),
  );
  const busy = day.events.map((event) => ({
    start: at(event.startsAt),
    end: at(event.endsAt),
  }));
  let ends: Date | null = null;
  let overMin = 0;
  for (const block of blocks) {
    if (block.slots.length === 0) continue;
    const fit = fitInBlock({
      block: { start: at(block.startsAt), end: at(block.endsAt) },
      slots: block.slots.map((slot) => ({
        tier: slot.tier,
        topMin: slot.topMin ?? 0,
      })),
      busy,
      tier: "stretch",
      topMin: 0,
    });
    if (fit.fits) ends = fit.runsTo;
    else overMin += fit.overMin ?? 0;
  }
  if (overMin > 0) return `Doesn't fit by ${overMin} min`;
  return ends === null ? NOTHING_SLOTTED : `Work ends ${wallClock(ends)}`;
}

/* ---- The week as the Priority lens reads it ---- */

const WEEKDAY_NAME = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const TIER_WORDS: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};

export const SIZE_WORDS: Record<WorkSize, string> = {
  quick: "1 Quick",
  small: "2 Small",
  medium: "3 Medium",
  large: "5 Large",
  huge: "8 Huge",
};

export const NOTHING_SLOTTED = "Nothing slotted yet";

export interface ChipView {
  /** The slot's id: one item may sit in several cells as sessions. */
  id: string;
  workItemId: string;
  tier: WorkTier;
  title: string;
  emoji: string | null;
  /** "KES-42 · 3 Medium", "ALD-17 · session 2 of 3", "1 Quick"; null with nothing to say. */
  meta: string | null;
  due: DueBadge | null;
  /** The session's place, "2/3" on the desk's strip (D-USE-47); null for one session. */
  session: { n: number; of: number } | null;
  /** "<title>, <tier>, <day>, session n of N, due <day>". */
  label: string;
}

export interface EventChipView {
  id: string;
  /** "11:00", "9:30". */
  time: string;
  title: string;
}

/* ---- The week as the Time lens reads it (USE-73) ---- */

/** The Time lens's hours, minutes from midnight: 8:00 to 18:00 (D-USE-41). */
export const TIME_HOURS = { startMin: 8 * 60, endMin: 18 * 60 };

export interface TimeEventView {
  id: string;
  /** "11:00 [Kestrel weekly]". */
  label: string;
  /** Minutes after its block's start; its length in minutes. */
  offsetMin: number;
  lengthMin: number;
}

export interface TimeBlockView {
  /** The block's id: one block per day, so the column's key. */
  id: string;
  kind: BlockKindOf;
  /** "Work", "Lunch", "Training · gym" as named. */
  name: string;
  /** "Work, 9:30 to 12:00": the Block panel's opener names the block and its times. */
  label: string;
  /** Minutes from the axis's start, and its length; laid out by time, never by order. */
  topMin: number;
  lengthMin: number;
  /** A Work block's work, tier by tier, the date's order within each. */
  chips: ChipView[];
  /** The day's events whose start falls inside it; they never split it. */
  events: TimeEventView[];
  /** The Fits line, in the day's last Work block only. */
  fits: string | null;
}

type BlockKindOf = SetUpWeek["days"][number]["blocks"][number]["block"]["kind"];

export interface WeekDayView {
  dateKey: string;
  /** "Mon 12". */
  head: string;
  /** "Monday". */
  weekday: string;
  isToday: boolean;
  /** Gone: faded and still editable, nothing missed. */
  past: boolean;
  /** Holds a Work block: its head carries › and its tiers show. */
  hasWork: boolean;
  /** The date's all-day checklist's name, the strip's "Sunday reset" (USE-58); else null. */
  checklistName: string | null;
  events: EventChipView[];
  cells: Record<WorkTier, ChipView[]>;
  /** "Work ends 16:20", "Nothing slotted yet", "No work blocks". */
  fits: string;
  /** The Time lens: the day's timed blocks inside 8:00 to 18:00, by start. */
  timeBlocks: TimeBlockView[];
  /** Events inside no block, on their own in the column. */
  looseEvents: (TimeEventView & { topMin: number })[];
}

export interface WeekView {
  /** `2026-W42`. */
  weekKey: string;
  /** "12 to 18 Oct". */
  range: string;
  /** An Urgent row shows only in a week where something is Urgent [ASSUMPTION]. */
  hasUrgent: boolean;
  days: WeekDayView[];
}

function dayOfMonth(dateKey: string): number {
  return Number(dateKey.slice(8, 10));
}

function monthOf(dateKey: string): string {
  return MONTH_SHORT[Number(dateKey.slice(5, 7)) - 1]!;
}

/** "12 to 18 Oct"; across a month "28 Sep to 4 Oct". */
export function weekRange(dates: readonly string[]): string {
  const first = dates[0]!;
  const last = dates.at(-1)!;
  const from =
    monthOf(first) === monthOf(last)
      ? `${dayOfMonth(first)}`
      : `${dayOfMonth(first)} ${monthOf(first)}`;
  return `${from} to ${dayOfMonth(last)} ${monthOf(last)}`;
}

/** "09:30" as the app prints a time, "9:30". */
function clock(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

export interface WeekViewInput {
  weekKey: string;
  week: SetUpWeek;
  /** Every open item's session dates, past this week too; null before it reads. */
  pool: Pool | null;
  todayKey: string;
}

export function deriveWeekView(input: WeekViewInput): WeekView {
  const { week, pool, todayKey } = input;
  const sessionDates = new Map(
    (pool?.items ?? []).map((entry) => [entry.item.id, entry.sessionDates]),
  );
  // An item the pool does not hold (done, or not read yet): its sessions this week.
  const weekDatesOf = new Map<string, string[]>();
  for (const day of week.days) {
    for (const block of day.blocks) {
      for (const slot of block.slots) {
        if (slot.workItemId === null || day.date === null) continue;
        const list = weekDatesOf.get(slot.workItemId) ?? [];
        list.push(day.date);
        weekDatesOf.set(slot.workItemId, list);
      }
    }
  }

  const days = week.days.map((day): WeekDayView => {
    const dateKey = day.date!;
    const index = weekdayIndex(dateKey);
    const weekday = WEEKDAY_NAME[index]!;
    const past = dateKey < todayKey;
    const items = new Map(day.records.workItems.map((item) => [item.id, item]));
    const workBlocks = day.blocks.filter((b) => b.block.kind === "work");
    const cells: Record<WorkTier, ChipView[]> = {
      urgent: [],
      primary: [],
      secondary: [],
      stretch: [],
    };
    const fitsBlocks: FitsBlock[] = [];
    const chipsOf = new Map<string, ChipView[]>();

    for (const block of workBlocks) {
      const blockChips: ChipView[] = [];
      chipsOf.set(block.block.id, blockChips);
      const fitSlots: BlockFitSlot[] = [];
      const slots = [...block.slots]
        .filter((slot) => slot.workItemId !== null)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      for (const slot of slots) {
        const item = items.get(slot.workItemId!);
        if (!item) continue;
        const tier = slot.tier ?? "primary";
        fitSlots.push({
          tier,
          topMin: topMinutes({
            lengthMin: slot.lengthMin,
            lengthMaxMin: item.lengthMaxMin,
            size: item.size,
          }),
        });
        const dates = [
          ...(sessionDates.get(item.id) ?? weekDatesOf.get(item.id) ?? []),
        ].sort();
        const place =
          dates.length > 1
            ? { n: dates.indexOf(dateKey) + 1, of: dates.length }
            : null;
        const session = place ? `session ${place.n} of ${place.of}` : null;
        const size = item.size ? SIZE_WORDS[item.size] : null;
        const meta =
          [item.linearIdentifier, session ?? size]
            .filter(Boolean)
            .join(" · ") || null;
        let due = dueBadge(item.dueOn, dateKey);
        // A past column badges only a date that is that day or later.
        if (past && item.dueOn !== null && item.dueOn < dateKey) due = null;
        const chip: ChipView = {
          id: slot.id,
          workItemId: item.id,
          tier,
          title: item.title,
          emoji: item.icon?.kind === "emoji" ? item.icon.value : null,
          meta,
          due,
          session: place,
          label: [
            item.title,
            TIER_WORDS[tier],
            weekday,
            session,
            due ? due.word.replace(/^Due/, "due") : null,
          ]
            .filter(Boolean)
            .join(", "),
        };
        cells[tier].push(chip);
        blockChips.push(chip);
      }
      fitsBlocks.push({
        startsAt: block.startsAt,
        endsAt: block.endsAt,
        slots: fitSlots,
      });
    }

    const fits = fitsLine({ workBlocks: fitsBlocks, events: day.events });
    // A day with no Work block is its line alone, as the strip's card
    // (USE-58): its events at their times, no blocks [ASSUMPTION: as drawn].
    const { timeBlocks, looseEvents } = timeLensDay({
      blocks: workBlocks.length > 0 ? day.blocks : [],
      events: day.events,
      chipsOf,
      fits,
    });

    return {
      dateKey,
      head: `${WEEKDAY_SHORT[index]} ${dayOfMonth(dateKey)}`,
      weekday,
      isToday: dateKey === todayKey,
      past,
      hasWork: workBlocks.length > 0,
      checklistName:
        day.blocks.find((b) => b.block.checklist)?.block.name ?? null,
      events: [...day.events]
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
        .map((event) => ({
          id: event.id,
          time: clock(event.startsAt),
          title: event.title,
        })),
      cells,
      fits,
      timeBlocks,
      looseEvents,
    };
  });

  return {
    weekKey: input.weekKey,
    range: weekRange(days.map((day) => day.dateKey)),
    hasUrgent: days.some((day) => day.cells.urgent.length > 0),
    days,
  };
}

const TIER_ORDER: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

interface TimeLensDayInput {
  blocks: SetUpWeek["days"][number]["blocks"];
  events: SetUpWeek["days"][number]["events"];
  /** Each Work block's chips, by block id, in the date's order. */
  chipsOf: ReadonlyMap<string, ChipView[]>;
  fits: string;
}

/**
 * One day on the Time lens (USE-73, D-USE-41): every timed block at its own
 * minutes from `readDay`'s occurrences (an all-day checklist is the day's
 * line, never a block), clipped to 8:00 to 18:00; a Work block's chips tier
 * by tier; each event inside the block its start falls in, never splitting
 * it, or on its own; the Fits line in the day's last Work block.
 */
export function timeLensDay(input: TimeLensDayInput): {
  timeBlocks: TimeBlockView[];
  looseEvents: (TimeEventView & { topMin: number })[];
} {
  const { startMin, endMin } = TIME_HOURS;
  const clip = (minutes: number) =>
    Math.min(endMin, Math.max(startMin, minutes));
  const timed = input.blocks
    .filter((b) => !b.block.checklist)
    .map((b) => ({
      b,
      from: clockMinutes(b.startsAt),
      to: clockMinutes(b.endsAt),
    }))
    .filter(({ from, to }) => clip(to) > clip(from))
    .sort((x, y) => x.from - y.from || x.to - y.to);
  const lastWork = timed.filter(({ b }) => b.block.kind === "work").at(-1);

  const placed = new Set<string>();
  const timeBlocks = timed.map(({ b, from, to }): TimeBlockView => {
    const events = input.events
      .filter((event) => {
        const at = clockMinutes(event.startsAt);
        return !placed.has(event.id) && at >= from && at < to;
      })
      .sort((x, y) => x.startsAt.localeCompare(y.startsAt))
      .map((event) => {
        placed.add(event.id);
        return eventView(event, from);
      });
    const chips = [...(input.chipsOf.get(b.block.id) ?? [])].sort(
      (x, y) => TIER_ORDER.indexOf(x.tier) - TIER_ORDER.indexOf(y.tier),
    );
    return {
      id: b.block.id,
      kind: b.block.kind,
      name: b.block.name,
      label: `${b.block.name}, ${clock(b.startsAt)} to ${clock(b.endsAt)}`,
      topMin: clip(from) - startMin,
      lengthMin: clip(to) - clip(from),
      chips,
      events,
      fits: lastWork?.b === b ? input.fits : null,
    };
  });

  const looseEvents = input.events
    .filter((event) => !placed.has(event.id))
    .filter((event) => {
      const at = clockMinutes(event.startsAt);
      return at >= startMin && at < endMin;
    })
    .sort((x, y) => x.startsAt.localeCompare(y.startsAt))
    .map((event) => ({
      ...eventView(event, clockMinutes(event.startsAt)),
      topMin: clockMinutes(event.startsAt) - startMin,
    }));

  return { timeBlocks, looseEvents };
}

function eventView(
  event: SetUpWeek["days"][number]["events"][number],
  fromMin: number,
): TimeEventView {
  const at = clockMinutes(event.startsAt);
  return {
    id: event.id,
    label: `${clock(event.startsAt)} ${event.title}`,
    offsetMin: at - fromMin,
    lengthMin: Math.max(0, clockMinutes(event.endsAt) - at),
  };
}
