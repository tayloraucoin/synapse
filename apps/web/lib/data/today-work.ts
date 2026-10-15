import type { StoredBlockKind, WorkTier } from "@syn/types";
import {
  activeBlock,
  clockAt,
  clockFromMinutes,
  clockToMinutes,
  compareInTiers,
  formatCountdown,
  instantToWallClockMinutes,
  parseRule,
  pickWhileItFires,
  resolveWorkNext,
  runningBand,
  weekdayIndex,
  type OverBand,
  type SlotClock,
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
import { SIZE_RANGE } from "@/components/work/add/new-task/form";
import type { Today } from "./derive-today";
import type { LinearIssueJoin } from "./integration-records";
import { capHelper, laterWorkBlockOf, TIER_EDGE_COPY } from "./tier-edges";
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
  fired: (minutes: string) => `fired ${minutes}`,
  took: (minutes: string) => `Took ${minutes}`,
  workTime: "WORK TIME",
  workTimePaused: "WORK TIME · PAUSED",
  workTimeOver: "WORK TIME · OVER",
  over: "over",
  leftOf: (top: string) => `left of ${top}`,
  pastTop: (top: string) => `past the top of ${top}`,
  since: (clock: string) => `since ${clock}`,
  pausedAt: (clock: string) => `paused at ${clock}`,
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
  /** "Two is the usual for Primary." past the tier's usual number (USE-61). */
  helper: string | null;
}

/** The day's later Work block, on the phone (USE-61, later-work-block.md). */
export interface TodayLaterBlock {
  /** "What's still open from the morning's Work. What was done stays in the 9:30 block." */
  line: string;
  /** Slots done before this block began: they stay in their own block. */
  doneBefore: ReadonlySet<string>;
}

/** The current block, as the desk's band and the phone's header name it. */
export interface TodayWorkBand {
  id: string;
  kind: StoredBlockKind;
  name: string;
  isWork: boolean;
  /** "09:30", "12:00": New task's day and block line read them. */
  startsAt: string;
  endsAt: string;
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
  /** The current block is the day's later Work block; null otherwise. */
  later: TodayLaterBlock | null;
  whileItFires: WhileItFiresView | null;
  /** Each row's slot clock state, by slot id: what USE-59's writes read. */
  states: ReadonlyMap<string, SlotClockState>;
  /** Each row's derived clock, by slot id, once it has events. */
  clocks: ReadonlyMap<string, SlotClock>;
  /** Each row's work item, by slot id: the Item sheet opens the item. */
  workItemIds: ReadonlyMap<string, string>;
  /**
   * The item in hand (USE-59): the running item, or the one its own Pause
   * holds. It stands as the running card in its row's place; null with
   * nothing in hand.
   */
  inHand: InHandView | null;
  /** Next has worked today, so its card reads Resume (brought-back.md). */
  nextResumes: boolean;
  /** Every work item fires: "Everything is firing." (D-USE-43). */
  allFiring: boolean;
  /** A one-day item, by slot id: its Done is the task's (a session's is USE-60). */
  oneDay: ReadonlyMap<string, boolean>;
  /** The day's close: nothing counts past it (C11). */
  dayEnd: Date;
}

export interface InHandView {
  slotId: string;
  row: WorkRowView;
  clock: SlotClock;
  /** The top of its range, minutes: WORK TIME counts down from it. */
  topMin: number;
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
      startsAt,
      endsAt,
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
    startsAt,
    endsAt,
    detail,
    headerDetail: detail,
  };
}

function isDaily(todo: TodoRecord): boolean {
  if (todo.rrule === null) return false;
  const parsed = parseRule(todo.rrule);
  return parsed.ok && parsed.rule.freq === "DAILY";
}

/** The last event written on each slot, by the clock's order. */
function lastKinds(today: Today): Map<string, string> {
  const last = new Map<
    string,
    { at: number; received: number; kind: string }
  >();
  for (const event of today.records.slotEvents) {
    const at = Date.parse(event.at);
    const received = Date.parse(event.receivedAt);
    const kept = last.get(event.slotId);
    if (
      !kept ||
      at > kept.at ||
      (at === kept.at && received >= kept.received)
    ) {
      last.set(event.slotId, { at, received, kind: event.kind });
    }
  }
  return new Map([...last].map(([id, entry]) => [id, entry.kind]));
}

/** The top of an item's range, in minutes: the clock counts down from it (D-USE-47). */
export function topOfRange(item: WorkItemRecord, slot: SlotRecord): number {
  const preset = item.size ? SIZE_RANGE[item.size] : null;
  return (
    item.lengthMaxMin ??
    preset?.max ??
    item.lengthMinMin ??
    preset?.min ??
    slot.lengthMin ??
    60
  );
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

  // One in hand inside a Work block (D-USE-43): the running item, else the
  // one its own Pause holds. A slot resting after Bring back is not in hand,
  // so it can be Next (D-USE-44).
  const kinds = lastKinds(today);
  const running = slots.find((slot) => states.get(slot.id) === "running");
  const held = running
    ? undefined
    : slots.find(
        (slot) =>
          states.get(slot.id) === "paused" && kinds.get(slot.id) === "paused",
      );
  const inHand = running ?? held ?? null;
  // The held card keeps the lift, so it is never Next (paused.md).
  const nextStates = new Map(states);
  if (inHand) nextStates.set(inHand.id, "running");
  // [ASSUMPTION] nothing is waiting until Linear's Waiting group (USE-63).
  const next = resolveWorkNext({
    slots: slots.map((slot) => ({
      id: slot.id,
      tier: slot.tier!,
      sortOrder: slot.sortOrder,
      waiting: false,
    })),
    states: nextStates,
  });
  const nextId = next.kind === "slot" ? next.slotId : null;
  const band = bandOf(today, now);

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
    if (!clock) return row;
    const figures = clockAt(clock, now, dayEnd);
    const workedMin = Math.floor(figures.workMs / 60_000);
    const firedMin = Math.floor(figures.firingMs / 60_000);
    const worked =
      workedMin >= 1 ? TODAY_WORK_COPY.worked(workMinutes(workedMin)) : null;
    if (form === "done") {
      // Took is work time only; "fired" is left off one that never fired (D-USE-48).
      const tookMin = slot.tookMin ?? (workedMin >= 1 ? workedMin : null);
      const parts = [
        tookMin !== null ? TODAY_WORK_COPY.took(workMinutes(tookMin)) : null,
        clock.firing.length > 0
          ? TODAY_WORK_COPY.fired(workMinutes(Math.max(1, firedMin)))
          : null,
      ].filter((part): part is string => part !== null);
      return {
        ...row,
        doneRecord: parts.length ? TODAY_WORK_COPY.joined(parts) : null,
      };
    }
    if (form === "firing") {
      return {
        ...row,
        // Firing reads from 1 min, in whole minutes (C-USE-firing-1, D-USE-29).
        firing: {
          word: TODAY_WORK_COPY.firing,
          time: workMinutes(Math.max(1, figures.firingMs / 60_000)),
        },
        worked,
      };
    }
    // Back in place: a length, never a caption (D-USE-44, D-USE-47).
    return {
      ...row,
      worked,
      fired:
        clock.firing.length > 0
          ? TODAY_WORK_COPY.fired(workMinutes(Math.max(1, firedMin)))
          : null,
    };
  };

  const tiers = TIERS.flatMap((tier): TodayWorkTier[] => {
    const rows = slots.filter((slot) => slot.tier === tier).map(rowOf);
    if (tier === "urgent" && rows.length === 0) return [];
    // The tier is the day's: the helper counts every row it holds today.
    return [
      {
        tier,
        word: TIER_WORDS[tier],
        rows,
        helper: capHelper(tier, rows.length),
      },
    ];
  });
  const laterBlock = laterWorkBlockOf(today, now);
  const later: TodayLaterBlock | null = laterBlock
    ? {
        line: TIER_EDGE_COPY.stillOpen(laterBlock.earlierStartsAt),
        doneBefore: new Set(
          slots
            .filter((slot) => {
              if (states.get(slot.id) !== "done") return false;
              const doneAt = slot.doneAt
                ? new Date(slot.doneAt)
                : today.clock.slots.get(slot.id)?.doneAt;
              // [ASSUMPTION] a done slot with no time is the earlier block's.
              return !doneAt || doneAt < laterBlock.start;
            })
            .map((slot) => slot.id),
        ),
      }
    : null;
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

  const handClock = inHand ? today.clock.slots.get(inHand.id) : undefined;
  const handRow = inHand
    ? flat.find(({ row }) => row.id === inHand.id)?.row
    : undefined;

  return {
    dateKey,
    timeZone: records.timeZone,
    title: dayTitle(dateKey),
    time: wallWords(now, records.timeZone),
    band,
    next,
    nextRow: nextEntry ? { ...nextEntry.row, tierWord: nextEntry.word } : null,
    lift: band?.isWork === true && inHand === null && nextEntry !== undefined,
    nextResumes:
      nextId !== null && (today.clock.slots.get(nextId)?.work.length ?? 0) > 0,
    inHand:
      inHand && handClock && handRow
        ? {
            slotId: inHand.id,
            // The clock's line says what it worked; the meta does not repeat it.
            row: { ...handRow, worked: null, fired: null },
            clock: handClock,
            topMin: topOfRange(items.get(inHand.workItemId!)!, inHand),
          }
        : null,
    allFiring: next.kind === "all_firing",
    tiers,
    later,
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
    clocks: new Map(
      slots.flatMap((slot) => {
        const clock = today.clock.slots.get(slot.id);
        return clock ? [[slot.id, clock] as const] : [];
      }),
    ),
    workItemIds: new Map(slots.map((slot) => [slot.id, slot.workItemId!])),
    oneDay: new Map(
      slots.map((slot) => [slot.id, (sessions.get(slot.id) ?? null) === null]),
    ),
    dayEnd,
  };
}

/** The running card's words at an instant (USE-59; running, paused, over). */
export interface WorkCardFigures {
  /** "WORK TIME", "WORK TIME · PAUSED", "WORK TIME · OVER". */
  label: string;
  /** "1:24:10"; past the top "12 min" with `over`. */
  figure: string;
  over: { word: string; level: OverBand } | null;
  /** "left of 2 h · worked 35 min since 9:45". */
  line: string;
  /** Paused by its own Pause: the figure holds. */
  held: boolean;
}

/**
 * The card's figures: `clockAt` over the slot's derived clock at the tick,
 * counting down from the top of the range; past it, "n min over" by Done's
 * percent bands, as the running card on Now (D-USE-72). Nothing is stored.
 */
export function workCardFigures(
  hand: InHandView,
  now: Date,
  dayEnd: Date,
  timeZone: string,
): WorkCardFigures {
  const { workMs, running } = clockAt(hand.clock, now, dayEnd);
  const countdown = formatCountdown(hand.topMin * 60_000, workMs);
  const top = workMinutes(hand.topMin);
  const worked = workMinutes(Math.floor(workMs / 60_000));
  const since = hand.clock.work[0]?.start;
  const sinceWords = since
    ? ` ${TODAY_WORK_COPY.since(wallWords(since, timeZone))}`
    : "";
  const held = !running;
  const lastEnd = hand.clock.work.at(-1)?.end ?? null;
  const line = countdown.over
    ? TODAY_WORK_COPY.joined([
        TODAY_WORK_COPY.pastTop(top),
        `${TODAY_WORK_COPY.worked(worked)}${sinceWords}`,
      ])
    : TODAY_WORK_COPY.joined([
        TODAY_WORK_COPY.leftOf(top),
        held
          ? TODAY_WORK_COPY.worked(worked)
          : `${TODAY_WORK_COPY.worked(worked)}${sinceWords}`,
        ...(held && lastEnd
          ? [TODAY_WORK_COPY.pausedAt(wallWords(lastEnd, timeZone))]
          : []),
      ]);
  return {
    label: held
      ? TODAY_WORK_COPY.workTimePaused
      : countdown.over
        ? TODAY_WORK_COPY.workTimeOver
        : TODAY_WORK_COPY.workTime,
    figure: countdown.figure,
    over: countdown.over
      ? {
          word: TODAY_WORK_COPY.over,
          level: runningBand(hand.topMin, workMs),
        }
      : null,
    line,
    held,
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
