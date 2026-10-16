import type { IconValue } from "@syn/types";
import {
  clockMinutes,
  fitInBlock,
  topMinutes,
  weekdayIndex,
  type WorkTier,
} from "@syn/utils";
import type { ClientRecord, WorkItemRecord } from "@syn/validators";
import type { LinearIssueJoin } from "./integration-records";
import type {
  BlockViewItem,
  BlockView as BlockViewRead,
} from "./use-block-view";
import type { SetUpWeek } from "./use-week";
import { TIER_WORDS, type WeekDayView } from "./week-view";
import { lengthOf } from "./work-row-view";

/**
 * The Block panel's reads (USE-76; ux/work/block-panel/): one block of one
 * date at the desk, the phone's Block view widened (D-USE-41, D-USE-55). Its
 * top line, header and scope line, and the body it mounts: a Work block's
 * slice of the day's tiers (the date's slots in this block, tier by tier, the
 * Week's order) or any other block's items on their rail times, transitions
 * among them. Times and lengths only, never a count; nothing says missed
 * (C-USE-block-panel-5). Pure, so a test reads what the panel draws.
 */

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const WEEKDAY = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const TIER_ORDER: readonly WorkTier[] = [
  "urgent",
  "primary",
  "secondary",
  "stretch",
];

export const BLOCK_PANEL_WORDS = {
  today: "Today",
  /** "Tue 13". */
  day: (dateKey: string) =>
    `${WEEKDAY_SHORT[weekdayIndex(dateKey)]} ${Number(dateKey.slice(8, 10))}`,
  span: (from: string, to: string) => `${clock(from)} to ${clock(to)}`,
  /** A Work block: where its work ends at the top of the ranges. */
  workEnds: (at: string) => `ends ${at} at the top of the ranges`,
  /** Any other block: where its items end as planned. */
  itemsEnd: (at: string) => `ends ${at} as planned`,
  /** [ASSUMPTION] Past the end in words, in ink, never red (overflow.md). */
  runsPast: (min: number, end: string) => `runs ${min} min past ${end}`,
  nothingYet: "nothing slotted yet",
  workScope: (weekday: string, next: string | null) =>
    next === null
      ? // [ASSUMPTION] No later Work block that day (work-block.md › Words).
        `Tiers belong to ${weekday}, not to this block. Items here go first; what's undone stays on ${weekday}.`
      : `Tiers belong to ${weekday}, not to this block. Items here go first; what's undone carries to the ${next} Work block.`,
  dateScope: (weekday: string, day: number) =>
    `Changes apply to ${weekday} ${day} only. The usual ${weekday} stays as it is.`,
  /** [ASSUMPTION] Today's block, opened from Today (checking-today.md). */
  todayScope: (weekday: string) =>
    `Changes apply to today only. The usual ${weekday} stays as it is.`,
} as const;

/** "09:30" as the app prints a time, "9:30". */
function clock(time: string): string {
  return time.replace(/^0(\d)/, "$1");
}

function wallClock(minutes: number): string {
  const min = Math.round(minutes);
  return `${Math.floor(min / 60)}:${String(min % 60).padStart(2, "0")}`;
}

/** A Work block's row in the panel: no firing, Start, Done or checkbox. */
export interface BlockPanelWorkRow {
  /** The slot's id. */
  id: string;
  workItemId: string;
  title: string;
  emoji: string | null;
  /** "Alder · 🎨 Brand site · ALD-17 · session 2 of 3". */
  meta: string | null;
  /** "1 to 2 h". */
  range: string | null;
}

export interface BlockPanelTier {
  tier: WorkTier;
  word: string;
  rows: BlockPanelWorkRow[];
}

export interface BlockPanelHead {
  blockId: string;
  dateKey: string;
  kind: SetUpWeek["days"][number]["blocks"][number]["block"]["kind"];
  name: string;
  /** "Tue 13", or "Today" from Today. */
  day: string;
  /** "9:30 to 12:00 · ends 11:40 at the top of the ranges". */
  meta: string;
  scope: string;
}

export interface BlockPanelWorkInput {
  week: SetUpWeek;
  day: WeekDayView;
  blockId: string;
  clientFor: (item: WorkItemRecord) => ClientRecord | null;
  issueFor: (item: WorkItemRecord) => LinearIssueJoin | null;
}

type SetUpBlockOf = SetUpWeek["days"][number]["blocks"][number];

function setUpDayOf(week: SetUpWeek, dateKey: string) {
  return week.days.find((day) => day.date === dateKey) ?? null;
}

/** The block on its date, as the week reads it; null when it is not there. */
export function panelBlockOf(
  week: SetUpWeek,
  dateKey: string,
  blockId: string,
): SetUpBlockOf | null {
  return (
    setUpDayOf(week, dateKey)?.blocks.find((b) => b.block.id === blockId) ??
    null
  );
}

/** "Alder", from "Alder Studio [placeholder]" [ASSUMPTION: its first word, as drawn]. */
function shortName(name: string): string {
  return name.split(/\s+/)[0] ?? name;
}

/**
 * The block's slice of the day's tiers (work-block.md; refinement 6): the
 * date's slots in this block in the Week's order, each tier with its rows
 * and its add row. Urgent only when it holds something here (D-USE-38).
 */
export function blockPanelTiers(input: BlockPanelWorkInput): BlockPanelTier[] {
  const setUp = setUpDayOf(input.week, input.day.dateKey);
  const block = setUp?.blocks.find((b) => b.block.id === input.blockId);
  if (!setUp || !block) return [];
  const inBlock = new Set(block.slots.map((slot) => slot.id));
  const items = new Map(setUp.records.workItems.map((i) => [i.id, i]));

  return TIER_ORDER.flatMap((tier) => {
    const rows = input.day.cells[tier]
      .filter((chip) => inBlock.has(chip.id))
      .flatMap((chip): BlockPanelWorkRow[] => {
        const item = items.get(chip.workItemId);
        if (!item) return [];
        const client = input.clientFor(item);
        const issue = input.issueFor(item);
        const project = issue?.project
          ? [issue.project.icon, issue.project.name].filter(Boolean).join(" ")
          : null;
        const identifier = issue?.identifier ?? item.linearIdentifier;
        const place = chip.session
          ? `session ${chip.session.n} of ${chip.session.of}`
          : null;
        const meta = [
          client ? shortName(client.name) : null,
          project,
          identifier,
          place ?? (chip.meta?.split(" · ").at(-1) || null),
        ];
        // The chip's meta ends in the size words when there is no session.
        const unique = meta.filter(
          (part, index): part is string =>
            Boolean(part) && meta.indexOf(part) === index,
        );
        return [
          {
            id: chip.id,
            workItemId: item.id,
            title: item.title,
            emoji: chip.emoji,
            meta: unique.join(" · ") || null,
            range: lengthOf(item),
          },
        ];
      });
    if (tier === "urgent" && rows.length === 0) return [];
    return [{ tier, word: TIER_WORDS[tier], rows }];
  });
}

/** Where a Work block's work ends at the top of the ranges, the events busy. */
function workFit(
  setUp: NonNullable<ReturnType<typeof setUpDayOf>>,
  block: SetUpBlockOf,
): string {
  const items = new Map(setUp.records.workItems.map((i) => [i.id, i]));
  const at = (time: string) => new Date(clockMinutes(time) * 60_000);
  const slots = block.slots.flatMap((slot) => {
    const item = slot.workItemId ? items.get(slot.workItemId) : undefined;
    if (!item) return [];
    return [
      {
        tier: slot.tier ?? "primary",
        topMin:
          topMinutes({
            lengthMin: slot.lengthMin,
            lengthMaxMin: item.lengthMaxMin,
            size: item.size,
          }) ?? 0,
      },
    ];
  });
  if (slots.length === 0) return BLOCK_PANEL_WORDS.nothingYet;
  const fit = fitInBlock({
    block: { start: at(block.startsAt), end: at(block.endsAt) },
    slots,
    busy: setUp.events.map((event) => ({
      start: at(event.startsAt),
      end: at(event.endsAt),
    })),
    tier: "stretch",
    topMin: 0,
  });
  if (fit.fits) {
    return BLOCK_PANEL_WORDS.workEnds(wallClock(fit.runsTo.getTime() / 60_000));
  }
  return BLOCK_PANEL_WORDS.runsPast(fit.overMin ?? 0, clock(block.endsAt));
}

/** Where a block's items end as planned (`reflowItems`, through Block view's read). */
export function itemsFit(read: BlockViewRead): string {
  const end = read.block.endsAt;
  if (read.reflow.overMin > 0) {
    return BLOCK_PANEL_WORDS.runsPast(read.reflow.overMin, clock(end));
  }
  return BLOCK_PANEL_WORDS.itemsEnd(clock(read.reflow.freeFrom ?? end));
}

export interface BlockPanelHeadInput {
  week: SetUpWeek;
  dateKey: string;
  blockId: string;
  /** Opened from Today's day column on today: "Today › Wellness". */
  fromToday: boolean;
  /** Any other block's items, from Block view's read; null while it reads. */
  items: BlockViewRead | null;
}

export function blockPanelHead(
  input: BlockPanelHeadInput,
): BlockPanelHead | null {
  const setUp = setUpDayOf(input.week, input.dateKey);
  const block = setUp?.blocks.find((b) => b.block.id === input.blockId);
  if (!setUp || !block) return null;
  const weekday = WEEKDAY[weekdayIndex(input.dateKey)]!;
  const isWork = block.block.kind === "work";
  const next = isWork
    ? setUp.blocks
        .filter(
          (b) =>
            b.block.kind === "work" &&
            b.block.id !== block.block.id &&
            b.startsAt > block.startsAt,
        )
        .sort((a, b) => a.startsAt.localeCompare(b.startsAt))[0]
    : undefined;
  const fit = isWork
    ? workFit(setUp, block)
    : input.items
      ? itemsFit(input.items)
      : null;
  return {
    blockId: block.block.id,
    dateKey: input.dateKey,
    kind: block.block.kind,
    name: block.block.name,
    day: input.fromToday
      ? BLOCK_PANEL_WORDS.today
      : BLOCK_PANEL_WORDS.day(input.dateKey),
    meta: [BLOCK_PANEL_WORDS.span(block.startsAt, block.endsAt), fit]
      .filter(Boolean)
      .join(" · "),
    scope: isWork
      ? BLOCK_PANEL_WORDS.workScope(weekday, next ? clock(next.startsAt) : null)
      : input.fromToday
        ? BLOCK_PANEL_WORDS.todayScope(weekday)
        : BLOCK_PANEL_WORDS.dateScope(
            weekday,
            Number(input.dateKey.slice(8, 10)),
          ),
  };
}

/** A non-work row: Block view's row, or a transition drawn in italics. */
export interface BlockPanelItemRow extends BlockViewItem {
  icon: IconValue | null;
  transition: boolean;
}

/**
 * Any other block's rows on their rail times (non-work-block.md): Block
 * view's items with the transitions put back among them in the date's order
 * (Block view draws those as bands; the panel draws them as the board does,
 * italic and muted, each on its time).
 */
export function blockPanelItems(read: BlockViewRead): BlockPanelItemRow[] {
  const startOf = new Map(read.reflow.placed.map((p) => [p.id, p.startsAt]));
  const rows = new Map(read.items.map((row) => [row.id, row]));
  return read.block.items
    .map((item, index) => {
      const slot = read.block.slots.find((s) => s.blockItemId === item.id);
      const icon = item.icon ?? null;
      const row = rows.get(item.id);
      if (row) return { ...row, icon, transition: false };
      if (!item.isTransition) return null;
      return {
        id: item.id,
        title: item.title,
        lengthMin: slot?.lengthMin ?? item.lengthMin,
        atTime: item.atTime,
        startsAt: startOf.get(item.id) ?? read.block.startsAt,
        sortOrder: slot?.sortOrder ?? index,
        slotId: slot?.id ?? null,
        done: slot?.doneAt != null,
        onDate: item.onDate,
        icon,
        transition: true,
      };
    })
    .filter((row): row is BlockPanelItemRow => row !== null)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
}

/**
 * A tier's new order as the slot writes it takes (a grip dropped in the
 * panel): the tier's own sort orders, dealt out again in the new order, only
 * the slots whose place changed. The day's other tiers keep theirs.
 */
export function tierOrderWrites(
  slots: readonly { id: string; sortOrder: number }[],
  ids: readonly string[],
): { slotId: string; sortOrder: number }[] {
  const known = new Map(slots.map((slot) => [slot.id, slot.sortOrder]));
  const ordered = ids.filter((id) => known.has(id));
  const places = ordered.map((id) => known.get(id)!).sort((a, b) => a - b);
  return ordered.flatMap((slotId, index) =>
    known.get(slotId) === places[index]
      ? []
      : [{ slotId, sortOrder: places[index]! }],
  );
}
