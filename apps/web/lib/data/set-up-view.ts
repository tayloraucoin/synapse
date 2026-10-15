import type { StoredBlockKind, WorkTier } from "@syn/types";
import { clockFromMinutes, clockMinutes } from "@syn/utils";
import type {
  DayColumnBlock,
  DayColumnItem,
  DayColumnTier,
} from "@/components/planner";
import type { SetUpBlock, SetUpDay } from "./use-set-up-day";

/**
 * Set my days drawn from a set-up day (USE-39): a week row's one line and a
 * day's column, each in words, never a count. Pure: the hooks' `select`
 * decided what runs, its edges and its strip; this only says it.
 */

const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export function weekdayName(weekday: number): string {
  return WEEKDAYS[weekday] ?? "";
}

/** "7:05" from "07:05". */
export function clockWords(clock: string): string {
  const [hour = "0", minute = "00"] = clock.split(":");
  return `${Number(hour)}:${minute}`;
}

/** "7:00 to 22:30" */
export function spanWords(startsAt: string, endsAt: string): string {
  return `${clockWords(startsAt)} to ${clockWords(endsAt)}`;
}

function dateParts(date: string): { day: number; month: string } {
  const [, month = "1", day = "1"] = date.split("-");
  return { day: Number(day), month: MONTHS[Number(month) - 1] ?? "" };
}

/** A week row's day: "Monday", or dated "Mon 12". */
export function rowDayLabel(day: Pick<SetUpDay, "weekday" | "date">): string {
  const name = weekdayName(day.weekday);
  if (day.date === null) return name;
  return `${name.slice(0, 3)} ${dateParts(day.date).day}`;
}

/** A day's title: "Every Thursday", or dated "Monday, 12 October". */
export function dayTitle(day: Pick<SetUpDay, "weekday" | "date">): string {
  const name = weekdayName(day.weekday);
  if (day.date === null) return `Every ${name}`;
  const { day: n, month } = dateParts(day.date);
  return `${name}, ${n} ${month}`;
}

/** The week stepper's range, "12 to 18 Oct" (the month once, or both when it turns). */
export function weekRangeWords(dates: readonly string[]): string {
  const first = dates[0];
  const last = dates.at(-1);
  if (first === undefined || last === undefined) return "";
  const a = dateParts(first);
  const b = dateParts(last);
  const short = (month: string) => month.slice(0, 3);
  return a.month === b.month
    ? `${a.day} to ${b.day} ${short(b.month)}`
    : `${a.day} ${short(a.month)} to ${b.day} ${short(b.month)}`;
}

/** A checklist over the whole date: "One checklist, no times" (the-week.md). */
export function isAllDay(block: Pick<SetUpBlock, "startsAt" | "endsAt">) {
  return block.startsAt === "00:00" && block.endsAt === "24:00";
}

const KIND_WORD: Partial<Record<StoredBlockKind, string>> = {
  life: "Life",
  todos: "To-dos",
};

/** The names a kind is called by default; any other name is said on the line. */
const DEFAULT_NAMES: Partial<Record<StoredBlockKind, readonly string[]>> = {
  wellness: ["Wellness"],
  training: ["Training"],
  work: ["Work"],
  break: ["Break", "Breakfast", "Lunch", "Dinner"],
  evening: ["Evening"],
};

const TIER_ORDER: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];
const TIER_WORD: Record<WorkTier, string> = {
  urgent: "Urgent",
  primary: "Primary",
  secondary: "Secondary",
  stretch: "Stretch",
};

/** "abs and yoga"; "a, b and c". */
function listWords(words: readonly string[]): string {
  if (words.length <= 1) return words.join("");
  return `${words.slice(0, -1).join(", ")} and ${words.at(-1)}`;
}

function slotTitle(day: SetUpDay, slot: SetUpBlock["slots"][number]): string {
  if (slot.workItemId !== null) {
    return (
      day.records.workItems.find((w) => w.id === slot.workItemId)?.title ?? ""
    );
  }
  if (slot.todoId !== null) {
    return day.records.todos.find((t) => t.id === slot.todoId)?.title ?? "";
  }
  return "";
}

/**
 * A week row's line (words-and-access.md): what is there by kind and name,
 * in sentences joined with ". ", never a count. [ASSUMPTION] The rule
 * behind the boards' hand-written lines: an all-day checklist first; Life
 * and To-dos by kind, name and span; a block with a name of its own by its
 * items; then, in a dated week, the Work tiers slotted or "No work slotted
 * yet" and the day's events; and with no Life or To-dos to name, Evening's
 * start, the wind-down.
 */
export function rowLine(day: SetUpDay): string {
  if (!day.isSet) return "";
  const parts: string[] = [];
  const timed = day.blocks.filter((b) => !isAllDay(b));
  if (day.blocks.some(isAllDay)) parts.push("One checklist, no times");

  for (const b of timed) {
    const kindWord = KIND_WORD[b.block.kind];
    if (kindWord !== undefined) {
      parts.push(
        `${kindWord}: ${b.block.name}, ${spanWords(b.startsAt, b.endsAt)}`,
      );
      continue;
    }
    const defaults = DEFAULT_NAMES[b.block.kind] ?? [];
    if (!defaults.includes(b.block.name) && b.items.length > 0) {
      const titles = b.items.map((item) => item.title.toLowerCase());
      parts.push(`${b.block.name}: ${listWords(titles)}`);
    }
  }

  const works = timed.filter((b) => b.block.kind === "work");
  if (day.date !== null) {
    const slots = works.flatMap((b) => b.slots);
    for (const tier of TIER_ORDER) {
      const titles = slots
        .filter((slot) => slot.tier === tier)
        .map((slot) => slotTitle(day, slot))
        .filter((title) => title !== "");
      if (titles.length > 0) {
        parts.push(`${TIER_WORD[tier]}: ${titles.join(", ")}`);
      }
    }
    for (const event of day.events) {
      parts.push(`${event.title} at ${clockWords(event.startsAt)}`);
    }
    if (works.length > 0 && slots.length === 0) {
      parts.push("No work slotted yet");
    }
  }

  // With no Life or To-dos to name, the usual day says when it winds down.
  const byKind = timed.some((b) => KIND_WORD[b.block.kind] !== undefined);
  const evening = timed.find((b) => b.block.kind === "evening");
  if (evening && !byKind && (day.date === null || parts.length === 0)) {
    parts.push(`Evening at ${clockWords(evening.startsAt)}, the wind-down`);
  } else if (parts.length === 0) {
    parts.push(timed.map((b) => b.block.name).join(", "));
  }
  return parts.join(". ");
}

/** A row's bounds: "7:00 to 22:30", "All day", or "Not set yet". */
export function rowBounds(day: SetUpDay): string {
  if (day.bounds) return spanWords(day.bounds.upAt, day.bounds.lightsOut);
  if (day.blocks.some(isAllDay)) return "All day";
  return "Not set yet";
}

/** A week row's button name: "<day>, <bounds>, <its line>". */
export function rowName(day: SetUpDay): string {
  const line = rowLine(day);
  return [weekdayName(day.weekday), rowBounds(day), line]
    .filter((part) => part !== "")
    .join(", ");
}

/* ------------------------------------------------------------- column -- */

export interface SetUpColumnBlock extends DayColumnBlock {
  /** D-USE-32 / D-USE-87: kept, not run, with its line. */
  outOfBounds?: "before_up_at" | "after_lights_out";
}

export interface SetUpColumn {
  hours: { startMin: number; endMin: number };
  orient: { atMin: number; lengthMin: number; label?: string } | null;
  blocks: SetUpColumnBlock[];
  /** "Free until 19:00." in each open hour or more, near the time it names. */
  openLines: { atMin: number; text: string }[];
  /** An all-day checklist, drawn above the column. */
  allDay: SetUpBlock[];
}

const ORIENT_MIN = 5;
/** An open stretch shorter than this says nothing. */
const OPEN_LINE_MIN = 60;
/** "Free until 19:00." sits this far above the block it names (drawn at 17). */
const OPEN_LINE_LEAD_MIN = 120;

function itemOf(item: SetUpBlock["items"][number]): DayColumnItem {
  return {
    id: item.id,
    label: item.title,
    tone: item.isTransition ? "transition" : "dot",
  };
}

function tiersOf(day: SetUpDay, b: SetUpBlock): DayColumnTier[] {
  return TIER_ORDER.flatMap((tier) => {
    const items = b.slots
      .filter((slot) => slot.tier === tier)
      .map((slot): DayColumnItem => {
        const work = day.records.workItems.find(
          (w) => w.id === slot.workItemId,
        );
        const title = slotTitle(day, slot);
        return {
          id: slot.id,
          label: work?.linearIdentifier
            ? `${title} · ${work.linearIdentifier}`
            : title,
          tone: "dot",
        };
      });
    return items.length > 0 ? [{ tier, items }] : [];
  });
}

/** In the usual week a Work or To-dos block holds its rule, not its contents. */
function usualLines(b: SetUpBlock, weekday: number): string[] | undefined {
  if (b.block.kind === "work") {
    return ["The time is kept every week.", "Work goes in on This week."];
  }
  if (b.block.fill === "from_todos") {
    return [
      `Fills from To-dos each ${weekdayName(weekday)}, any type, picked on the day.`,
    ];
  }
  return undefined;
}

export const EDGE_LINE = {
  before_up_at: "Before Up at. Kept, not run.",
  after_lights_out: "After Lights out. Kept, not run.",
} as const;

/**
 * The column (layout.md 4): the axis from the earlier of Up at and the first
 * block to the later of Lights out and the last, on whole hours; Orient at
 * Up at (labelled with its time when Up at is not on the hour it was, as
 * "Orient · 7:45"); every block at its true times.
 */
export function setUpColumn(day: SetUpDay): SetUpColumn {
  const allDay = day.blocks.filter(isAllDay);
  const timed = day.blocks.filter((b) => !isAllDay(b));
  const starts = timed.map((b) => clockMinutes(b.startsAt));
  const ends = timed.map((b) => clockMinutes(b.endsAt));
  const upAt = day.bounds ? clockMinutes(day.bounds.upAt) : null;
  const lightsOut = day.bounds ? clockMinutes(day.bounds.lightsOut) : null;
  const first = Math.min(...starts, upAt ?? Infinity);
  const last = Math.max(...ends, lightsOut ?? -Infinity);
  const startMin = Number.isFinite(first) ? Math.floor(first / 60) * 60 : 420;
  const endMin = Number.isFinite(last)
    ? Math.min(24 * 60, Math.ceil(last / 60) * 60)
    : startMin + 6 * 60;

  // Orient names its time when a block sits before it (out-of-bounds.md).
  const moved = timed.some((b) => b.edge === "before_up_at");
  const orient =
    upAt === null
      ? null
      : {
          atMin: upAt,
          lengthMin: ORIENT_MIN,
          ...(moved
            ? { label: `Orient · ${clockWords(day.bounds!.upAt)}` }
            : {}),
        };

  const blocks = timed.map((b): SetUpColumnBlock => {
    const form = b.block.meal
      ? "meal"
      : b.block.kind === "work"
        ? "work"
        : "items";
    const tiers = form === "work" ? tiersOf(day, b) : [];
    // A dated Work block with nothing slotted says so (tap-a-time.md).
    const lines =
      day.date === null
        ? usualLines(b, day.weekday)
        : form === "work" && tiers.length === 0
          ? ["No work slotted yet"]
          : undefined;
    return {
      id: b.block.id,
      kind: b.block.kind,
      name: b.block.name,
      startsAt: b.startsAt,
      endsAt: b.endsAt,
      form,
      items: b.items.map(itemOf),
      tiers,
      ...(lines ? { lines } : {}),
      ...(b.edge ? { outOfBounds: b.edge } : {}),
    };
  });

  const openLines: SetUpColumn["openLines"] = [];
  if (upAt !== null && lightsOut !== null) {
    let cursor = upAt + ORIENT_MIN;
    const sorted = [...timed].sort(
      (a, b) => clockMinutes(a.startsAt) - clockMinutes(b.startsAt),
    );
    for (const b of sorted) {
      const start = clockMinutes(b.startsAt);
      if (start - cursor >= OPEN_LINE_MIN && start <= lightsOut) {
        // Near the time it names, never before the gap opens [ASSUMPTION].
        openLines.push({
          atMin: Math.max(cursor, start - OPEN_LINE_LEAD_MIN),
          text: `Free until ${clockWords(b.startsAt)}.`,
        });
      }
      cursor = Math.max(cursor, clockMinutes(b.endsAt));
    }
  }

  return { hours: { startMin, endMin }, orient, blocks, openLines, allDay };
}

/** A tapped minute on the rail, as "HH:MM", within the column. */
export function railClock(minutes: number): string {
  return clockFromMinutes(Math.max(0, Math.min(24 * 60 - 1, minutes)));
}
