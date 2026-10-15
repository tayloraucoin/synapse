import type { WorkSize, WorkTier } from "@syn/types";
import {
  clockMinutes,
  fitInBlock,
  instantToWallClockMinutes,
  topMinutes,
  wallClockToInstant,
  weekDates,
  weekdayIndex,
  weekKeyOf,
  type BlockSpan,
} from "@syn/utils";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import { NEW_TASK_COPY as COPY } from "../copy";

/**
 * New task's form (USE-51; add/states/new-task.md, save-to-the-pool.md,
 * D-USE-54, D-USE-57): its state, the day chips, the fit line and the
 * action, pure. The sheet renders what this returns and writes what
 * `toCreateTask` gives; nothing here reads the clock or a hook.
 *
 * Two or more days are sessions of ONE task: one work item, a slot a day.
 * No days is the pool, and nothing goes to Linear.
 */

export const SIZES = [
  "quick",
  "small",
  "medium",
  "large",
  "huge",
] as const satisfies readonly WorkSize[];

export const TIERS = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
] as const satisfies readonly WorkTier[];

/** The size dev note's default ranges [ASSUMPTION there]; Huge has no top. */
export const SIZE_RANGE: Record<WorkSize, { min: number; max: number | null }> =
  {
    quick: { min: 15, max: 30 },
    small: { min: 30, max: 60 },
    medium: { min: 60, max: 120 },
    large: { min: 120, max: 240 },
    huge: { min: 240, max: null },
  };

export interface NewTaskDraft {
  title: string;
  clientId: string | null;
  tier: WorkTier;
  size: WorkSize | null;
  /** The range, editable once a size sets it (the size dev note). */
  lengthMinMin: number | null;
  lengthMaxMin: number | null;
  /** Synapse's own date (D-USE-98); set from the pool's form. */
  dueOn: string | null;
  /** Picked dates, ascending. */
  days: string[];
}

export function emptyDraft(tier: WorkTier = "primary"): NewTaskDraft {
  return {
    title: "",
    clientId: null,
    tier,
    size: null,
    lengthMinMin: null,
    lengthMaxMin: null,
    dueOn: null,
    days: [],
  };
}

/** A size sets its default range; picking it again keeps the range. */
export function pickSize(draft: NewTaskDraft, size: WorkSize): NewTaskDraft {
  if (draft.size === size) return draft;
  const range = SIZE_RANGE[size];
  return {
    ...draft,
    size,
    lengthMinMin: range.min,
    lengthMaxMin: range.max,
  };
}

export function toggleDay(draft: NewTaskDraft, dateKey: string): NewTaskDraft {
  const days = draft.days.includes(dateKey)
    ? draft.days.filter((day) => day !== dateKey)
    : [...draft.days, dateKey].sort();
  return { ...draft, days };
}

/* ---- Words ---- */

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const WEEKDAY_LETTER = ["M", "T", "W", "T", "F", "S", "S"];

export function shortDay(dateKey: string): string {
  return WEEKDAY_SHORT[weekdayIndex(dateKey)]!;
}

/** "Mon 12". */
export function shortDate(dateKey: string): string {
  return `${shortDay(dateKey)} ${Number(dateKey.slice(8))}`;
}

/** "9:30" from "09:30": the boards' clock, no leading zero. */
export function clockWords(clock: string): string {
  const minutes = clockMinutes(clock);
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** "Mon, Wed and Fri". */
export function listWords(words: readonly string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

/** "1 to 2 h", "30 to 60 min", "45 min to 2 h", "4 h or more". */
export function rangeWords(min: number | null, max: number | null): string {
  const hours = (minutes: number) => `${String(minutes / 60)}`;
  if (min === null && max === null) return "";
  if (max === null)
    return `${min! < 90 ? `${min} min` : `${hours(min!)} h`} or more`;
  if (min === null || min === max) {
    return max < 90 ? `${max} min` : `${hours(max)} h`;
  }
  if (max < 90) return `${min} to ${max} min`;
  if (min < 60) return `${min} min to ${hours(max)} h`;
  return `${hours(min)} to ${hours(max)} h`;
}

/** "3 Medium". */
export function sizeWords(size: WorkSize): string {
  return COPY.sizes[size];
}

/* ---- The week's days, for the chips and the fit line ---- */

export interface DayChip {
  dateKey: string;
  letter: string;
  date: number;
  /** The day's first Work block, which the task lands in. */
  block: { id: string; name: string; startsAt: string; endsAt: string } | null;
  /** Before today: no longer offered [ASSUMPTION]. */
  past: boolean;
  /** "Monday 12, selected", "Saturday 17, no Work block". */
  name: string;
}

export interface WeekFit {
  chips: DayChip[];
  /** Each date's fit inputs, by date key. */
  days: Map<string, FitDay>;
  timeZone: string;
}

export interface FitDay {
  block: BlockSpan & { startsAt: string; endsAt: string };
  slots: { tier: WorkTier; topMin: number | null }[];
  busy: BlockSpan[];
}

/** The week `dateKey` sits in: Monday to Sunday. */
export function weekOf(dateKey: string): { key: string; dates: string[] } {
  const key = weekKeyOf(dateKey);
  return { key, dates: weekDates(key) };
}

/**
 * The chips and each day's fit from the set-up week's read: the day's first
 * Work block [ASSUMPTION: the morning's, the one the header names], its work
 * slots at the top of their ranges, and the events inside it.
 */
export function readWeekFit({
  days,
  today,
  timeZone,
  picked,
  blockId,
}: {
  days: readonly SetUpDay[];
  today: string;
  timeZone: string;
  picked: readonly string[];
  /** The block the sheet was opened from: it wins on its own date. */
  blockId?: string;
}): WeekFit {
  const fits = new Map<string, FitDay>();
  const chips = days.flatMap((day): DayChip[] => {
    const date = day.date;
    if (date === null) return [];
    const works = day.blocks.filter((b) => b.block.kind === "work");
    const work = works.find((b) => b.block.id === blockId) ?? works[0] ?? null;
    const past = date < today;
    const long = `${WEEKDAY_LONG[weekdayIndex(date)]} ${Number(date.slice(8))}`;
    const name =
      work === null
        ? `${long}, ${COPY.noWorkBlockName}`
        : past
          ? `${long}, ${COPY.pastName}`
          : picked.includes(date)
            ? `${long}, ${COPY.selectedName}`
            : long;

    if (work !== null) {
      const at = (clock: string) => wallClockToInstant(date, clock, timeZone);
      const start = at(work.startsAt);
      const end = at(work.endsAt);
      const items = new Map(day.records.workItems.map((i) => [i.id, i]));
      fits.set(date, {
        block: { start, end, startsAt: work.startsAt, endsAt: work.endsAt },
        slots: work.slots.flatMap((slot) => {
          const item =
            slot.workItemId === null ? undefined : items.get(slot.workItemId);
          if (slot.tier === null || item === undefined) return [];
          return [
            {
              tier: slot.tier,
              topMin: topMinutes({
                lengthMin: slot.lengthMin,
                lengthMaxMin: item.lengthMaxMin,
                size: item.size,
              }),
            },
          ];
        }),
        busy: day.events.map((event) => ({
          start: at(event.startsAt),
          end: at(event.endsAt),
        })),
      });
    }

    return [
      {
        dateKey: date,
        letter: WEEKDAY_LETTER[weekdayIndex(date)]!,
        date: Number(date.slice(8)),
        block:
          work === null
            ? null
            : {
                id: work.block.id,
                name: work.block.name,
                startsAt: work.startsAt,
                endsAt: work.endsAt,
              },
        past,
        name,
      },
    ];
  });
  return { chips, days: fits, timeZone };
}

export function canPick(chip: DayChip): boolean {
  return chip.block !== null && !chip.past;
}

/** The task's own top: the range's top, else its size's (USE-8). */
export function draftTopMin(draft: NewTaskDraft): number | null {
  return topMinutes({
    lengthMin: null,
    lengthMaxMin: draft.lengthMaxMin,
    size: draft.size,
  });
}

/**
 * The consequence line (new-task.md): where each picked day's tier ends at
 * the top of its ranges, in words, never a count; past the block's end is
 * said in words too, never red. Then the days with no Work block. With no
 * days, the pool's line (D-USE-57).
 */
export function fitLine(draft: NewTaskDraft, week: WeekFit): string {
  const noWork = week.chips.filter((chip) => chip.block === null);
  const noWorkLine =
    noWork.length === 0
      ? ""
      : COPY.noWorkBlock(listWords(noWork.map((c) => shortDay(c.dateKey))));

  if (draft.days.length === 0) return COPY.poolLine;
  if (draft.size === null && draft.lengthMaxMin === null) {
    return join(COPY.pickASize(tierWord(draft.tier)), noWorkLine);
  }

  const top = draftTopMin(draft);
  if (top === null) {
    return join(COPY.noTop(tierWord(draft.tier)), noWorkLine);
  }

  const parts = draft.days.flatMap((date, index) => {
    const day = week.days.get(date);
    if (day === undefined) return [];
    const fit = fitInBlock({
      block: day.block,
      slots: day.slots,
      busy: day.busy,
      tier: draft.tier,
      topMin: top,
    });
    const runsTo =
      fit.runsTo === null
        ? null
        : clockWords(
            minutesClock(instantToWallClockMinutes(fit.runsTo, week.timeZone)),
          );
    const past = fit.fits ? "" : COPY.pastEnd(clockWords(day.block.endsAt));
    return [
      index === 0
        ? COPY.runsToFirst(shortDay(date), tierWord(draft.tier), runsTo ?? "")
        : COPY.runsToNext(shortDay(date), runsTo ?? ""),
    ].map((words) => words + past);
  });
  return join(`${parts.join("; ")}.`, noWorkLine);
}

function minutesClock(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

function join(...lines: string[]): string {
  return lines.filter((line) => line !== "").join(" ");
}

export function tierWord(tier: WorkTier): string {
  return COPY.tiers[tier];
}

/** "Add to Primary, Mon and Wed", or "Save to the pool" with no days. */
export function actionWords(draft: NewTaskDraft): string {
  if (draft.days.length === 0) return COPY.saveToPool;
  return COPY.addTo(tierWord(draft.tier), listWords(draft.days.map(shortDay)));
}

/** The toast after it lands: where it went (D-USE-57, placed, Undo). */
export function landedWords(draft: NewTaskDraft): string {
  if (draft.days.length === 0) return COPY.savedToPool;
  return COPY.addedTo(
    tierWord(draft.tier),
    listWords(draft.days.map(shortDay)),
  );
}

/** A title is all the form needs; a picked day must have a Work block. */
export function canSave(draft: NewTaskDraft, week: WeekFit): boolean {
  if (draft.title.trim() === "") return false;
  return draft.days.every((date) => week.days.has(date));
}

export interface CreateTaskCall {
  item: {
    title: string;
    clientId: string | null;
    size: WorkSize | null;
    lengthMinMin: number | null;
    lengthMaxMin: number | null;
    dueOn: string | null;
  };
  tier: WorkTier;
  /** One slot a day, each in that day's Work block; none is the pool. */
  days: { dateKey: string; blockId: string }[];
}

/** What the write takes: one work item, then a slot per picked day. */
export function toCreateTask(
  draft: NewTaskDraft,
  week: WeekFit,
): CreateTaskCall {
  return {
    item: {
      title: draft.title.trim(),
      clientId: draft.clientId,
      size: draft.size,
      lengthMinMin: draft.lengthMinMin,
      lengthMaxMin: draft.lengthMaxMin,
      dueOn: draft.dueOn,
    },
    tier: draft.tier,
    days: draft.days.flatMap((dateKey) => {
      const chip = week.chips.find((c) => c.dateKey === dateKey);
      return chip?.block ? [{ dateKey, blockId: chip.block.id }] : [];
    }),
  };
}

/** "Mon 12 · Work, 9:30 to 12:00": the Add sheet's line under "Add". */
export function blockLine(
  dateKey: string,
  block: { name: string; startsAt: string; endsAt: string } | null,
): string {
  if (block === null) return shortDate(dateKey);
  return COPY.blockLine(
    shortDate(dateKey),
    block.name,
    clockWords(block.startsAt),
    clockWords(block.endsAt),
  );
}

/** The due date's words: "Fri 16". */
export function dueWords(dueOn: string | null): string {
  return dueOn === null ? COPY.noneYet : shortDate(dueOn);
}
