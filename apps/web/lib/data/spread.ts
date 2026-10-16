import {
  clockMinutes,
  countSessions,
  topMinutes,
  weekdayIndex,
  type SpreadDay,
  type SpreadRow,
  type WorkTier,
} from "@syn/utils";
import type { SlotRecord, WorkItemRecord } from "@syn/validators";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { WorkServer } from "@/lib/fixtures/work";
import { workBlocksOf } from "./place";
import type { SetUpWeek } from "./use-week";

/**
 * Spread across the week (USE-77; interactions/spread): the week read as
 * `spreadPreview`'s days, the item's work left, and the one write that places
 * the preview's rows as sessions of the one item (D-USE-40), each "n of N"
 * with N the sessions placed so far (D-USE-102). Nothing reaches Linear, the
 * estimate included (D-USE-57). Pure over the server, so the test drives the
 * same calls.
 */

/** Huge's floor, when the item names no hours ("8 Huge means 4 h or more"). */
export const HUGE_FLOOR_MIN = 240;

/** The item's hours: its top, then its floor, then its size's top. */
export function hoursOf(item: WorkItemRecord): number {
  return (
    item.lengthMaxMin ??
    item.lengthMinMin ??
    topMinutes({ lengthMin: null, lengthMaxMin: null, size: item.size }) ??
    HUGE_FLOOR_MIN
  );
}

/** What its sessions don't yet hold: its hours less every session's length. */
export function workLeftOf(
  item: WorkItemRecord,
  slots: readonly SlotRecord[],
): number {
  const placed = slots
    .filter((slot) => slot.workItemId === item.id && slot.onDate !== null)
    .reduce((sum, slot) => sum + (slot.lengthMin ?? 0), 0);
  return Math.max(0, hoursOf(item) - placed);
}

/** The minutes the item's sessions already hold. */
export function placedMinOf(
  workItemId: string,
  slots: readonly SlotRecord[],
): number {
  return slots
    .filter((slot) => slot.workItemId === workItemId && slot.onDate !== null)
    .reduce((sum, slot) => sum + (slot.lengthMin ?? 0), 0);
}

/**
 * The week as Spread reads it: each date's Work blocks with their slots at
 * the top of their ranges, labelled "n/N" across every week's sessions, and
 * the meetings inside them; today's blocks begun once their start has passed.
 */
export function spreadDaysOf(input: {
  week: SetUpWeek;
  /** Every slot, for the sessions' n of N. */
  slots: readonly SlotRecord[];
  workItems: readonly WorkItemRecord[];
  workItemId: string;
  todayKey: string;
  /** Wall-clock minutes now, today. */
  nowMin: number;
}): SpreadDay[] {
  const items = new Map(input.workItems.map((item) => [item.id, item]));
  const sessions = countSessions(
    input.slots.flatMap((slot) =>
      slot.workItemId === null
        ? []
        : [{ ...slot, workItemId: slot.workItemId }],
    ),
  );
  return input.week.days.flatMap((day): SpreadDay[] => {
    const dateKey = day.date;
    if (dateKey === null) return [];
    const blocks = workBlocksOf(day);
    const holds = blocks.some((b) =>
      b.slots.some((slot) => slot.workItemId === input.workItemId),
    );
    return [
      {
        dateKey,
        past: dateKey < input.todayKey,
        holds,
        blocks: blocks.map((b) => ({
          id: b.block.id,
          start: b.startsAt,
          end: b.endsAt,
          begun:
            dateKey === input.todayKey &&
            input.nowMin >= clockMinutes(b.startsAt),
          busy: day.events.map((e) => ({ start: e.startsAt, end: e.endsAt })),
          slots: b.slots.flatMap((slot) => {
            if (slot.workItemId === null) return [];
            const item = items.get(slot.workItemId);
            const session = sessions.get(slot.id);
            return [
              {
                title: item?.title ?? "",
                sessionLabel:
                  session && session.of > 1
                    ? `${session.n}/${session.of}`
                    : null,
                topMin: topMinutes({
                  lengthMin: slot.lengthMin,
                  lengthMaxMin: item?.lengthMaxMin ?? null,
                  size: item?.size ?? null,
                }),
              },
            ];
          }),
        })),
      },
    ];
  });
}

/**
 * Add <n> sessions: the rows as the one item's sessions in the tier, in one
 * write. A Work left changed in the dialog becomes the item's hours (what is
 * placed plus what is left); left as read, the item is untouched.
 */
export function writeSpread(
  server: Pick<WorkServer, "spreadWork">,
  input: {
    item: WorkItemRecord;
    slots: readonly SlotRecord[];
    tier: WorkTier;
    rows: readonly SpreadRow[];
    workLeftMin: number;
  },
): Promise<PlannerWrite> {
  const hours = placedMinOf(input.item.id, input.slots) + input.workLeftMin;
  return server.spreadWork({
    workItemId: input.item.id,
    tier: input.tier,
    sessions: input.rows.map((row) => ({
      dateKey: row.dateKey,
      blockId: row.blockId,
      lengthMin: row.getsMin,
    })),
    ...(hours === hoursOf(input.item) ? {} : { lengthMaxMin: hours }),
  });
}

const SHORT_DAY = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** "Tue 13". */
export const shortDate = (dateKey: string) =>
  `${SHORT_DAY[weekdayIndex(dateKey)]} ${Number(dateKey.slice(8))}`;

/** "Tue to Fri" for a run of days, else "Tue, Thu, Fri". */
export function daysWords(dateKeys: readonly string[]): string {
  const sorted = [...dateKeys].sort();
  const days = sorted.map(weekdayIndex);
  const run =
    days.length > 2 &&
    days.every((day, i) => i === 0 || day === days[i - 1]! + 1);
  const names = days.map((day) => SHORT_DAY[day]!);
  return run ? `${names[0]} to ${names.at(-1)}` : names.join(", ");
}

/** "45 min", "1 h", "2 h 30", "20 h": the board's lengths, never a percentage. */
export function lengthWords(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")}`;
}

export const SPREAD_WORDS = {
  /** [ASSUMPTION] The toast, as the index's. */
  added: (n: number, days: string) =>
    `${n} ${n === 1 ? "session" : "sessions"} added, ${days}`,
  undo: "Undo",
  undone: "Undone",
} as const;
