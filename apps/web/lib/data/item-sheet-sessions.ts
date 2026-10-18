import type { WorkTier } from "@syn/types";
import {
  clockAt,
  fitInBlock,
  instantToWallClockMinutes,
  topMinutes,
  wallClockToInstant,
  type SlotClock,
} from "@syn/utils";
import type { SlotRecord, WorkItemRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { WorkSheetView, WorkSheetWrite } from "./item-sheet-work";
import { issueLength } from "./linear-size";
import type { SetUpDay } from "./use-set-up-day";
import { workMinutes } from "./work-row-view";

/**
 * A session's Item sheet (USE-67; day/item-sheet/states/tier-and-sessions.md,
 * sub-issue-alone.md, while-firing.md, interactions/sessions.md): its
 * sessions, its sub-issues, the consequence lines and the firing panel, and
 * the writes they make. Pure over the day's records, the pool's slots and
 * the week's read, so a test drives the same code the sheet does.
 *
 * A SESSION IS ONE DAY'S SHARE (D-USE-40). A tier change on one session asks
 * This session (the default) or All sessions, naming where each other session
 * whose tier changes would end at the top of its ranges (D-USE-57). × drops
 * that day's slot and nothing else; Add a day places another. Nothing here
 * writes to Linear but a sub-issue's check.
 *
 * A SUB-ISSUE is a checkbox under its issue. Placed on a day by itself it
 * becomes a work item with `parentWorkItemId` and its own slot, and stays a
 * checkbox under its issue (D-USE-51 (6)); checking it in either place checks
 * it in Linear, and Linear's state is what both places read.
 *
 * Session numbers are `countSessions`'s, never stored.
 */

/* --------------------------------------------------------- sub-issues -- */

export interface SubIssueView {
  /** The Linear sub-issue's id. */
  issueId: string;
  title: string;
  done: boolean;
  /** Its work item once placed (or checked from its own row). */
  workItemId: string | null;
  /** Placed alone: its open slot's day, muted under its issue. */
  placed: { slotId: string; dateKey: string; tier: WorkTier | null } | null;
  /** Linear's estimate, for its top on the day it is placed. */
  estimate: number | null;
  /** Its team's estimate scale, which the estimate is read on (USE-112). */
  estimationType?: string | null;
}

export function deriveSubIssues(input: {
  /** `subIssuesOf` over the snapshot: Linear's order, done by its state. */
  subs: readonly { id: string; title: string; done: boolean }[];
  estimates?: ReadonlyMap<string, number | null>;
  /** Each sub-issue's team's estimate scale (USE-112). */
  scales?: ReadonlyMap<string, string | null>;
  workItems: readonly WorkItemRecord[];
  slots: readonly SlotRecord[];
}): SubIssueView[] {
  return input.subs.map((sub) => {
    const item = input.workItems.find(
      (row) => row.linearIssueId === sub.id && row.archivedAt === null,
    );
    const slot = item
      ? input.slots
          .filter(
            (row) =>
              row.workItemId === item.id &&
              row.onDate !== null &&
              !row.skipped &&
              row.doneAt === null,
          )
          .sort((a, b) => (a.onDate! < b.onDate! ? -1 : 1))[0]
      : undefined;
    return {
      issueId: sub.id,
      title: sub.title,
      done: sub.done || (item?.doneAt ?? null) !== null,
      workItemId: item?.id ?? null,
      placed: slot
        ? { slotId: slot.id, dateKey: slot.onDate!, tier: slot.tier }
        : null,
      estimate: input.estimates?.get(sub.id) ?? null,
      estimationType: input.scales?.get(sub.id) ?? null,
    };
  });
}

/* ------------------------------------------------------- the week's fit -- */

export interface DayPick {
  dateKey: string;
  /** The day's first Work block, where an added day or a sub-issue lands. */
  block: { id: string; startsAt: string; endsAt: string } | null;
  past: boolean;
  /** Already one of the item's sessions: Add a day leaves it out. */
  taken: boolean;
}

/** The week's seven days as the one-day pick reads them. */
export function dayPicks(
  days: readonly SetUpDay[],
  today: string,
  takenDates: readonly string[] = [],
): DayPick[] {
  return days.flatMap((day) => {
    if (day.date === null) return [];
    const work = day.blocks.find((entry) => entry.block.kind === "work");
    return [
      {
        dateKey: day.date,
        block: work
          ? { id: work.block.id, startsAt: work.startsAt, endsAt: work.endsAt }
          : null,
        past: day.date < today,
        taken: takenDates.includes(day.date),
      },
    ];
  });
}

export function canPickDay(pick: DayPick): boolean {
  return pick.block !== null && !pick.past && !pick.taken;
}

export interface DayFit {
  /** "11:20", where the tier ends at the top of its ranges; null with no top. */
  runsTo: string | null;
  fits: boolean;
  /** The block's end, "12:00", for the past-the-end words. */
  endsAt: string;
}

/** "11:20" from minutes into the day. */
function clockOf(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/**
 * Where `tier` ends on `dateKey`'s block with an item of `topMin` in it, the
 * item's own slot there left out (it moves, it isn't added twice). USE-8's
 * `fitInBlock`: the tiers at and above it count, at the top of their ranges.
 */
export function dayFit(input: {
  days: readonly SetUpDay[];
  dateKey: string;
  /** The block it sits in; the day's first Work block otherwise. */
  blockId?: string;
  tier: WorkTier;
  topMin: number | null;
  /** The item whose slot on the day moves rather than adds. */
  leaveOut?: string;
  workItems: readonly WorkItemRecord[];
  timeZone: string;
}): DayFit | null {
  const day = input.days.find((row) => row.date === input.dateKey);
  if (!day) return null;
  const works = day.blocks.filter((entry) => entry.block.kind === "work");
  const entry =
    works.find((row) => row.block.id === input.blockId) ?? works[0] ?? null;
  if (entry === null) return null;
  const at = (clock: string) =>
    wallClockToInstant(input.dateKey, clock, input.timeZone);
  const items = new Map(input.workItems.map((row) => [row.id, row]));
  const slots = entry.slots.flatMap((slot) => {
    if (slot.tier === null || slot.workItemId === null) return [];
    if (slot.workItemId === input.leaveOut) return [];
    const item = items.get(slot.workItemId);
    if (!item) return [];
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
  });
  const fit = fitInBlock({
    block: { start: at(entry.startsAt), end: at(entry.endsAt) },
    slots,
    busy: day.events.map((event) => ({
      start: at(event.startsAt),
      end: at(event.endsAt),
    })),
    tier: input.tier,
    topMin: input.topMin,
  });
  return {
    runsTo:
      fit.runsTo === null
        ? null
        : clockOf(instantToWallClockMinutes(fit.runsTo, input.timeZone)),
    fits: fit.fits,
    endsAt: clockOf(
      instantToWallClockMinutes(at(entry.endsAt), input.timeZone),
    ),
  };
}

/** A session's top: its own length, then the item's range, then its size's. */
export function sessionTop(
  item: Pick<WorkItemRecord, "lengthMaxMin" | "size">,
  lengthMin: number | null,
): number | null {
  return topMinutes({
    lengthMin,
    lengthMaxMin: item.lengthMaxMin,
    size: item.size,
  });
}

/**
 * A sub-issue's top on its day: its estimate's range (USE-52's sizes), read
 * on its team's scale (USE-112).
 */
export function subIssueTop(
  estimate: number | null,
  estimationType?: string | null,
): number | null {
  const length = issueLength(estimate, estimationType);
  return topMinutes({
    lengthMin: null,
    lengthMaxMin: length.lengthMaxMin,
    size: length.size,
  });
}

/**
 * The ask's All sessions line, part by part: each other open session whose
 * tier changes, where it would end on its day. Sessions outside the week
 * read are named with no time [ASSUMPTION].
 */
export function allSessionsFits(input: {
  view: WorkSheetView;
  tier: WorkTier;
  days: readonly SetUpDay[];
  workItems: readonly WorkItemRecord[];
  slots: readonly SlotRecord[];
  timeZone: string;
}): { dateKey: string; fit: DayFit | null }[] {
  const { view, tier } = input;
  const item = input.workItems.find((row) => row.id === view.item.id);
  if (!item) return [];
  return view.sessions
    .filter((session) => !session.thisOne && !session.done)
    .filter((session) => session.tier !== tier)
    .map((session) => {
      const slot = input.slots.find((row) => row.id === session.slotId);
      return {
        dateKey: session.dateKey,
        fit: dayFit({
          days: input.days,
          dateKey: session.dateKey,
          blockId: session.blockId,
          tier,
          topMin: sessionTop(item, slot?.lengthMin ?? null),
          leaveOut: item.id,
          workItems: input.workItems,
          timeZone: input.timeZone,
        }),
      };
    });
}

/* ------------------------------------------------------ the firing panel -- */

export interface FiringPanelView {
  /** "22 min", past an hour "1 h 20"; from 1 min (D-USE-29). */
  firing: string;
  /** "11:58": when the open firing span began. */
  sentAt: string;
  /** "40 min" of work before it; null when it never ran. */
  worked: string | null;
}

/** The firing panel's figures from the derived clock (D-USE-44). */
export function firingPanel(
  clock: SlotClock | undefined,
  now: Date,
  dayEnd: Date,
  timeZone: string,
): FiringPanelView | null {
  if (!clock || clock.state !== "firing") return null;
  const open = clock.firing.find((span) => span.end === null);
  if (!open) return null;
  const figures = clockAt(clock, now, dayEnd);
  const workedMin = Math.floor(figures.workMs / 60_000);
  return {
    firing: workMinutes(Math.max(1, figures.firingMs / 60_000)),
    sentAt: clockOf(instantToWallClockMinutes(open.start, timeZone)),
    worked: workedMin >= 1 ? workMinutes(workedMin) : null,
  };
}

/* ------------------------------------------------------------- writes -- */

export type SessionsServer = Pick<
  FixtureServer,
  | "setWorkTier"
  | "placeWork"
  | "unplaceWork"
  | "moveWork"
  | "placeIssues"
  | "markTaskDone"
  | "reopenTask"
  | "writeLinearDone"
  | "undo"
>;

/** × on a session: that day's slot only; the task and Linear stay (D-USE-54). */
export async function writeDropSession(
  server: SessionsServer,
  view: WorkSheetView,
  slotId: string,
): Promise<WorkSheetWrite | null> {
  const session = view.sessions.find((row) => row.slotId === slotId);
  if (!session || session.thisOne) return null;
  const written = await server.unplaceWork({ slotId });
  return { undo: written.undo, linearDone: false };
}

/** Add a day: one more session, at the end of that day's Work block. */
export async function writeAddSessionDay(
  server: SessionsServer,
  view: WorkSheetView,
  place: { dateKey: string; blockId: string; tier: WorkTier },
  sortOrder: number,
): Promise<WorkSheetWrite> {
  const written = await server.placeWork({
    workItemId: view.item.id,
    dateKey: place.dateKey,
    blockId: place.blockId,
    tier: place.tier,
    sortOrder,
  });
  return { undo: written.undo, linearDone: false };
}

/** A sub-issue's check's way back: its work item's and Linear's. */
export interface SubIssueWrite {
  undo: (() => Promise<void>) | null;
}

/**
 * Checking a sub-issue (C-USE-item-sheet-sub-issue-alone-2): placed, its
 * work item closes (or opens) with its slot, and Linear's done row is written
 * on it; not placed, Linear's row is written on its issue's item. Either way
 * the snapshot moves first, so both places read the same.
 */
export async function writeCheckSubIssue(
  server: SessionsServer,
  view: WorkSheetView,
  sub: SubIssueView,
  done: boolean,
): Promise<SubIssueWrite> {
  if (sub.workItemId !== null) {
    const id = sub.workItemId;
    const written = done
      ? await server.markTaskDone({ workItemId: id })
      : await server.reopenTask({ workItemId: id });
    await server.writeLinearDone({ workItemId: id, done });
    return {
      undo: async () => {
        await server.undo(written.undo);
        await server.writeLinearDone({ workItemId: id, done: !done });
      },
    };
  }
  await server.writeLinearDone({
    workItemId: view.item.id,
    done,
    issueId: sub.issueId,
  });
  return {
    undo: async () => {
      await server.writeLinearDone({
        workItemId: view.item.id,
        done: !done,
        issueId: sub.issueId,
      });
    },
  };
}

/**
 * Place on a day by itself: the sub-issue's own work item (its issue's item
 * as parent) and a slot in the tier on that day, through From Linear's write;
 * already placed, its slot moves there. Linear is not written.
 */
export async function writePlaceSubIssue(
  server: SessionsServer,
  view: WorkSheetView,
  sub: SubIssueView,
  place: { dateKey: string; blockId: string; tier: WorkTier },
): Promise<WorkSheetWrite> {
  if (sub.placed !== null) {
    const written = await server.moveWork({
      slotId: sub.placed.slotId,
      dateKey: place.dateKey,
      blockId: place.blockId,
      tier: place.tier,
    });
    return { undo: written.undo, linearDone: false };
  }
  const written = await server.placeIssues({
    issueIds: [sub.issueId],
    dateKey: place.dateKey,
    blockId: place.blockId,
    tier: place.tier,
    parentWorkItemId: view.item.id,
  });
  return { undo: written.undo, linearDone: false };
}
