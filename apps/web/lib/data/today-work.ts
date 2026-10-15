import type { StoredBlockKind, WorkTier } from "@syn/types";
import {
  activeBlock,
  clockAt,
  clockFromMinutes,
  clockToMinutes,
  compareInTiers,
  instantToWallClockMinutes,
  parseRule,
  pickWhileItFires,
  resolveWorkNext,
  weekdayIndex,
  type SlotClockState,
  type WorkNext,
} from "@syn/utils";
import type {
  ClientRecord,
  SlotRecord,
  TodoRecord,
  WorkItemRecord,
} from "@syn/validators";
import type { WorkRowView } from "@/components/work";
import type { Today } from "./derive-today";
import type { LinearIssueJoin } from "./integration-records";
import type { TrayRowView } from "./use-todos";
import { TIER_WORDS, type WeekDayView } from "./week-view";
import { workMinutes, workRowView } from "./work-row-view";

/**
 * Today's work (USE-57; work/today/index.md): the date's work slots in the
 * tiers, Next, the reminder line and the To-dos, as Today at the desk and Now
 * inside a Work block both draw them. Pure, so a test reads what the screen
 * draws, and every order here is USE-8's: Next is `resolveWorkNext`, the rows
 * `compareInTiers`, never anything a component sorts (C-USE-today-3).
 *
 * A firing item stays in its tier and place, its form `firing` with "firing"
 * and whole minutes from the derived clock (C-USE-today-working-1, D-USE-29).
 */

export const TODAY_WORK_COPY = {
  firing: "firing",
  worked: (minutes: string) => `worked ${minutes}`,
  whileItFires: "While it fires:",
  daily: "daily",
  /** "9:30 to 12:00". */
  span: (startsAt: string, endsAt: string) =>
    `${clockWords(startsAt)} to ${clockWords(endsAt)}`,
  /** "Kestrel weekly at 11:00". */
  eventAt: (title: string, startsAt: string) =>
    `${title} at ${clockWords(startsAt)}`,
  /** ", in 40 min": the desk band's lead time to the event. */
  inMinutes: (minutes: number) => `, in ${workMinutes(minutes)}`,
  /** Outside Work: "Work starts at 9:30". */
  workStarts: (startsAt: string) => `Work starts at ${clockWords(startsAt)}`,
  joined: (parts: readonly string[]) => parts.join(" · "),
} as const;

const TIERS: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

/** "9:30" from "09:30". */
export function clockWords(clock: string): string {
  return clock.replace(/^0(\d)/, "$1");
}

export interface TodayWorkTier {
  tier: WorkTier;
  word: string;
  rows: WorkRowView[];
}

/** The current block, as the desk's band and the phone's header name it. */
export interface TodayWorkBand {
  id: string;
  kind: StoredBlockKind;
  name: string;
  isWork: boolean;
  /** The desk band: "9:30 to 12:00 · Kestrel weekly at 11:00, in 40 min". */
  detail: string;
  /** The phone header: "9:30 to 12:00 · Kestrel weekly at 11:00". */
  headerDetail: string;
}

/** "While it fires: Kegels · daily", under the first firing row (D-USE-47). */
export interface WhileItFiresView {
  rowId: string;
  /** "While it fires:" */
  lead: string;
  todoId: string;
  title: string;
  meta: string | null;
}

/** One To-do at the desk: the tray's row with its repeat and time. */
export interface TodayTodoView {
  id: string;
  title: string;
  emoji: string | null;
  checked: boolean;
  /** "daily · 14:00", "From Sunday", "14:00". */
  meta: string | null;
}

export interface TodayWorkView {
  dateKey: string;
  timeZone: string;
  /** "Monday, 12 October". */
  title: string;
  /** "10:20". */
  time: string;
  band: TodayWorkBand | null;
  next: WorkNext;
  /** Next's row, for the desk's strip; null when nothing is Next. */
  nextRow: (WorkRowView & { tierWord: string }) | null;
  /**
   * Next lifts as the card with Start and Done: inside a Work block, with
   * nothing in hand (D-USE-45). Outside one it is a shaded row only (D-USE-65).
   */
  lift: boolean;
  tiers: TodayWorkTier[];
  whileItFires: WhileItFiresView | null;
  /** Each row's slot clock state, by slot id: what USE-59's writes read. */
  states: ReadonlyMap<string, SlotClockState>;
  /** Each row's work item, by slot id: the Item sheet opens the item. */
  workItemIds: ReadonlyMap<string, string>;
}

export interface TodayWorkInput {
  today: Today;
  /** The Week's view of the date: each slot's session place. */
  day: WeekDayView | null;
  now: Date;
  clientFor: (item: WorkItemRecord) => ClientRecord | null;
  issueFor: (item: WorkItemRecord) => LinearIssueJoin | null;
  subIssuesFor?: (
    item: WorkItemRecord,
  ) => { id: string; title: string; done: boolean }[];
}

const WEEKDAY_LONG = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const MONTH_LONG = [
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
];

/** "Monday, 12 October". */
export function dayTitle(dateKey: string): string {
  return `${WEEKDAY_LONG[weekdayIndex(dateKey)]}, ${Number(dateKey.slice(8, 10))} ${MONTH_LONG[Number(dateKey.slice(5, 7)) - 1]}`;
}

/** An instant to the day's "10:20" in its zone. */
export function wallWords(at: Date, timeZone: string): string {
  return clockWords(clockFromMinutes(instantToWallClockMinutes(at, timeZone)));
}

function emojiOf(item: WorkItemRecord): string | null {
  return item.icon?.kind === "emoji" ? item.icon.value : null;
}

/** The date's work slots: a tier, on the date, in a Work block that runs. */
function workSlotsOf(today: Today): SlotRecord[] {
  return today.occurrences.blocks
    .filter((occurrence) => occurrence.block.kind === "work")
    .flatMap((occurrence) => occurrence.slots)
    .filter(
      (slot) => slot.workItemId !== null && slot.tier !== null && !slot.skipped,
    );
}

/** A slot's state: the clock's, or done by its own stamp (a check, a sync). */
function stateOf(today: Today, slot: SlotRecord): SlotClockState {
  if (slot.doneAt !== null) return "done";
  return today.clock.slots.get(slot.id)?.state ?? "idle";
}

function bandOf(today: Today, now: Date): TodayWorkBand | null {
  const { occurrences, records } = today;
  const spans = occurrences.blocks.map((occurrence) => ({
    id: occurrence.block.id,
    start: occurrence.start,
    end: occurrence.end,
    occurrence,
  }));
  const current = activeBlock(spans, now)?.occurrence;
  if (!current) return null;
  const { block, startsAt, endsAt } = current;
  const span = TODAY_WORK_COPY.span(startsAt, endsAt);
  const nowMin = instantToWallClockMinutes(now, records.timeZone);

  if (block.kind === "work") {
    // The next event inside the block from now (a meeting, D-USE-41).
    const event = records.dayEvents
      .filter(
        (row) =>
          row.startsAt >= startsAt &&
          row.startsAt < endsAt &&
          clockToMinutes(row.startsAt) >= nowMin,
      )
      .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0];
    const eventWords = event
      ? TODAY_WORK_COPY.eventAt(event.title, event.startsAt)
      : null;
    const lead = event ? clockToMinutes(event.startsAt) - nowMin : 0;
    return {
      id: block.id,
      kind: block.kind,
      name: block.name,
      isWork: true,
      detail: eventWords
        ? TODAY_WORK_COPY.joined([span, eventWords]) +
          (lead >= 1 ? TODAY_WORK_COPY.inMinutes(lead) : "")
        : span,
      headerDetail: eventWords
        ? TODAY_WORK_COPY.joined([span, eventWords])
        : span,
    };
  }

  // Outside Work the band names the block and when Work starts (not-a-work-block.md).
  const work = occurrences.blocks.find(
    (occurrence) =>
      occurrence.block.kind === "work" && occurrence.start >= current.end,
  );
  const detail = work
    ? TODAY_WORK_COPY.joined([span, TODAY_WORK_COPY.workStarts(work.startsAt)])
    : span;
  return {
    id: block.id,
    kind: block.kind,
    name: block.name,
    isWork: false,
    detail,
    headerDetail: detail,
  };
}

function isDaily(todo: TodoRecord): boolean {
  if (todo.rrule === null) return false;
  const parsed = parseRule(todo.rrule);
  return parsed.ok && parsed.rule.freq === "DAILY";
}

export function deriveTodayWork(input: TodayWorkInput): TodayWorkView {
  const { today, day, now } = input;
  const { records } = today;
  const dateKey = records.date;
  const items = new Map(records.workItems.map((item) => [item.id, item]));
  const sessions = new Map(
    TIERS.flatMap((tier) => day?.cells[tier] ?? []).map((chip) => [
      chip.id,
      chip.session,
    ]),
  );

  const slots = workSlotsOf(today)
    .filter((slot) => items.has(slot.workItemId!))
    .sort((a, b) =>
      compareInTiers(
        { id: a.id, tier: a.tier!, sortOrder: a.sortOrder },
        { id: b.id, tier: b.tier!, sortOrder: b.sortOrder },
      ),
    );
  const states = new Map(slots.map((slot) => [slot.id, stateOf(today, slot)]));
  // [ASSUMPTION] nothing is waiting until Linear's Waiting group (USE-63).
  const next = resolveWorkNext({
    slots: slots.map((slot) => ({
      id: slot.id,
      tier: slot.tier!,
      sortOrder: slot.sortOrder,
      waiting: false,
    })),
    states,
  });
  const nextId = next.kind === "slot" ? next.slotId : null;
  const band = bandOf(today, now);
  const inHand = [...states.values()].some(
    (state) => state === "running" || state === "paused",
  );

  const dayEnd = records.dayWindow.end;
  const rowOf = (slot: SlotRecord): WorkRowView => {
    const item = items.get(slot.workItemId!)!;
    const state = states.get(slot.id)!;
    const form =
      state === "done"
        ? "done"
        : state === "firing"
          ? "firing"
          : slot.id === nextId
            ? "next"
            : "idle";
    const row = workRowView({
      id: slot.id,
      item,
      emoji: emojiOf(item),
      form,
      session: sessions.get(slot.id) ?? null,
      client: input.clientFor(item),
      issue: input.issueFor(item),
      subIssues: input.subIssuesFor?.(item),
    });
    const clock = today.clock.slots.get(slot.id);
    if (form !== "firing" || !clock) return row;
    const figures = clockAt(clock, now, dayEnd);
    const workedMin = Math.floor(figures.workMs / 60_000);
    return {
      ...row,
      // Firing reads from 1 min, in whole minutes (C-USE-firing-1, D-USE-29).
      firing: {
        word: TODAY_WORK_COPY.firing,
        time: workMinutes(Math.max(1, figures.firingMs / 60_000)),
      },
      worked:
        workedMin >= 1 ? TODAY_WORK_COPY.worked(workMinutes(workedMin)) : null,
    };
  };

  const tiers = TIERS.flatMap((tier): TodayWorkTier[] => {
    const rows = slots.filter((slot) => slot.tier === tier).map(rowOf);
    if (tier === "urgent" && rows.length === 0) return [];
    return [{ tier, word: TIER_WORDS[tier], rows }];
  });
  const flat = tiers.flatMap((group) =>
    group.rows.map((row) => ({ row, word: group.word })),
  );
  const nextEntry = flat.find(({ row }) => row.id === nextId);

  const firingCount = [...states.values()].filter(
    (state) => state === "firing",
  ).length;
  const reminderId = pickWhileItFires({
    todos: records.todos,
    dateKey,
    next,
    firingCount,
  });
  const reminder = records.todos.find((todo) => todo.id === reminderId);
  const firstFiring = flat.find(({ row }) => row.form === "firing");

  return {
    dateKey,
    timeZone: records.timeZone,
    title: dayTitle(dateKey),
    time: wallWords(now, records.timeZone),
    band,
    next,
    nextRow: nextEntry ? { ...nextEntry.row, tierWord: nextEntry.word } : null,
    lift: band?.isWork === true && !inHand && nextEntry !== undefined,
    tiers,
    whileItFires:
      reminder && firstFiring
        ? {
            rowId: firstFiring.row.id,
            lead: TODAY_WORK_COPY.whileItFires,
            todoId: reminder.id,
            title: reminder.title,
            meta: TODAY_WORK_COPY.daily,
          }
        : null,
    states,
    workItemIds: new Map(slots.map((slot) => [slot.id, slot.workItemId!])),
  };
}

/** The desk's To-dos, the tray's rows with "daily · 14:00" where they repeat. */
export function todayTodos(
  rows: readonly TrayRowView[],
  todos: readonly TodoRecord[],
): TodayTodoView[] {
  const byId = new Map(todos.map((todo) => [todo.id, todo]));
  return rows.map((row) => {
    const todo = byId.get(row.id);
    const time = row.reminderAt ? clockWords(row.reminderAt) : null;
    const repeat = todo && isDaily(todo) ? TODAY_WORK_COPY.daily : null;
    const meta =
      row.carriedLabel ??
      (repeat && time
        ? TODAY_WORK_COPY.joined([repeat, time])
        : (repeat ?? time));
    return {
      id: row.id,
      title: row.title,
      emoji: row.icon?.kind === "emoji" ? row.icon.value : null,
      checked: row.checked,
      meta,
    };
  });
}
