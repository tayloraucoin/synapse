import type { IconValue, WorkSize, WorkTier } from "@syn/types";
import { countSessions } from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import { SIZE_RANGE } from "@/components/work/add/new-task/form";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { Today } from "./derive-today";

/**
 * A work item's Item sheet (USE-65; day/item-sheet/states/size-and-length.md,
 * work-more-open.md): the item, its slot on the date, its sessions, and the
 * writes its fields and ··· make. Pure over the day's records and the pool's
 * slots, so a test reads what the sheet reads and drives the same writes.
 *
 * SIZE IS LINEAR'S POINTS (the size dev note). A size card writes the size
 * and resets the range from its defaults; on a linked item it also writes
 * Linear's estimate, once, through the outbox. The steppers then change the
 * range freely. Exact is one length: `lengthMinMin = lengthMaxMin`.
 *
 * THE DAY PLANS WITH THE TOP (D-USE-42): the range's top, else the size's;
 * unsized with no length has no top (USE-8 counts it 0).
 *
 * ··· (D-USE-57): Mark the task done closes the task and every open session,
 * and on a linked item moves the issue to Done; Back to the pool takes every
 * open session off its day; Remove from Synapse archives it here and writes
 * nothing to Linear. Each has its Undo.
 */

/** Linear's points per size, both ways (the size dev note). */
export const SIZE_POINTS: Record<WorkSize, number> = {
  quick: 1,
  small: 2,
  medium: 3,
  large: 5,
  huge: 8,
};

/** The longest a length goes: a long day's Work, twice [ASSUMPTION]. */
const LENGTH_MAX_MIN = 960;
const LENGTH_MIN_MIN = 5;

/**
 * The steppers' steps (the size dev note): five minutes under 90, then half
 * hours. A value between half hours meets the next one first.
 */
export function stepLength(minutes: number, by: -1 | 1): number | null {
  let next: number;
  if (by === 1)
    next = minutes < 90 ? minutes + 5 : (Math.floor(minutes / 30) + 1) * 30;
  else next = minutes <= 90 ? minutes - 5 : (Math.ceil(minutes / 30) - 1) * 30;
  if (next < LENGTH_MIN_MIN || next > LENGTH_MAX_MIN) return null;
  return next;
}

/** "45 min", "1 h", "1 h 30": minutes under the hour, then hours. */
export function lengthWords(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const rest = minutes % 60;
  const hours = Math.floor(minutes / 60);
  return rest === 0
    ? `${hours} h`
    : `${hours} h ${String(rest).padStart(2, "0")}`;
}

export interface WorkSheetSlot {
  id: string;
  tier: WorkTier | null;
  dateKey: string;
  blockName: string;
  /** "HH:MM" on its date. */
  startsAt: string;
  endsAt: string;
  /** On the sheet's date, so Start and Done may show. */
  today: boolean;
  done: boolean;
}

/** One of the item's sessions, for the sheet's Sessions (USE-67, D-USE-54). */
export interface WorkSheetSession {
  slotId: string;
  dateKey: string;
  blockId: string;
  tier: WorkTier | null;
  done: boolean;
  /** The session the sheet is open on: "this one", and no ×. */
  thisOne: boolean;
}

export interface WorkSheetView {
  date: string;
  /** The day has begun (Ready, go): Start and Done may show (C-USE-item-sheet-linear-linked-1). */
  ready: boolean;
  item: {
    id: string;
    title: string;
    icon: IconValue | null;
    size: WorkSize | null;
    /** The range as the steppers show it: the item's, else its size's. */
    lengthMinMin: number | null;
    lengthMaxMin: number | null;
    notes: string;
    /** Linked to a Linear issue: Notes give way to Description (USE-66). */
    linked: boolean;
    /** The issue's page, for Open in Linear; null on a Synapse-only item. */
    url: string | null;
  };
  /** The date's session, else the next open one; null in the pool. */
  slot: WorkSheetSlot | null;
  /** "session 1 of 3"; null for a one-day item. */
  session: { n: number; of: number } | null;
  /** The other open sessions' dates, in order: "Closes Wed's and Thu's sessions". */
  otherSessions: string[];
  /** Every placed session, by date; one for a one-day item. */
  sessions: WorkSheetSession[];
  /** A sub-issue's work item (USE-67): its issue's item; null otherwise. */
  parentId: string | null;
  /** The item's own Linear issue, for its sub-issues; null on a Synapse-only item. */
  linear: { connectionId: string; issueId: string } | null;
  /** What the day plans with, minutes; null with no size and no length. */
  topMin: number | null;
  /** One length, not a range. */
  exact: boolean;
}

/** The range a size sets (the size dev note's defaults). */
export function sizeRange(size: WorkSize): {
  min: number;
  max: number | null;
} {
  return SIZE_RANGE[size];
}

/** The top the day plans with (D-USE-42); null when nothing sets one. */
export function topOf(min: number | null, max: number | null): number | null {
  return max ?? min;
}

export interface WorkSheetInput {
  today: Today;
  workItemId: string;
  /** Every open item's sessions (the pool's slots); the date's alone until read. */
  sessions?: readonly SlotRecord[];
  issue: { url: string } | null;
}

export function deriveWorkSheet(input: WorkSheetInput): WorkSheetView | null {
  const { today, workItemId, issue } = input;
  const { records } = today;
  const record = records.workItems.find((item) => item.id === workItemId);
  if (!record || record.archivedAt !== null) return null;

  const preset = record.size ? sizeRange(record.size) : null;
  const lengthMinMin = record.lengthMinMin ?? preset?.min ?? null;
  const lengthMaxMin =
    record.lengthMinMin !== null || record.lengthMaxMin !== null
      ? record.lengthMaxMin
      : (preset?.max ?? null);

  // The pool's slots, and the date's as read with the day, once each.
  const sessions = new Map<string, SlotRecord>();
  for (const slot of [...(input.sessions ?? []), ...records.slots]) {
    if (slot.workItemId !== workItemId || slot.skipped) continue;
    if (slot.onDate === null) continue;
    sessions.set(slot.id, slot);
  }
  const placed = [...sessions.values()].sort((a, b) =>
    a.onDate! < b.onDate! ? -1 : a.onDate! > b.onDate! ? 1 : 0,
  );
  const counted = countSessions(placed.map((row) => ({ ...row, workItemId })));

  // The date's session, else the next open one.
  const shown =
    placed.find((row) => row.onDate === records.date) ??
    placed.find((row) => row.onDate! > records.date && row.doneAt === null) ??
    null;

  let slot: WorkSheetSlot | null = null;
  if (shown !== null) {
    const occurrence =
      shown.onDate === records.date
        ? today.occurrences.blocks.find(
            (entry) => entry.block.id === shown.blockId,
          )
        : undefined;
    const block =
      occurrence?.block ??
      records.blocks.find((row) => row.id === shown.blockId);
    if (block) {
      slot = {
        id: shown.id,
        tier: shown.tier,
        dateKey: shown.onDate!,
        blockName: block.name,
        startsAt: occurrence?.startsAt ?? block.startsAt,
        endsAt: occurrence?.endsAt ?? block.endsAt,
        today: shown.onDate === records.date,
        done: shown.doneAt !== null,
      };
    }
  }

  const count = shown === null ? undefined : counted.get(shown.id);
  const otherSessions = placed
    .filter((row) => row.id !== shown?.id && row.doneAt === null)
    .map((row) => row.onDate!);

  return {
    date: records.date,
    ready: records.dayRecord?.readyAt != null,
    item: {
      id: record.id,
      title: record.title,
      icon: record.icon,
      size: record.size,
      lengthMinMin,
      lengthMaxMin,
      notes: record.notes ?? "",
      linked: record.linearIssueId !== null,
      url: issue?.url ?? null,
    },
    slot,
    session: count && count.of > 1 ? count : null,
    otherSessions,
    sessions: placed.map((row) => ({
      slotId: row.id,
      dateKey: row.onDate!,
      blockId: row.blockId,
      tier: row.tier,
      done: row.doneAt !== null,
      thisOne: row.id === shown?.id,
    })),
    parentId: record.parentWorkItemId,
    linear:
      record.linearConnectionId !== null && record.linearIssueId !== null
        ? {
            connectionId: record.linearConnectionId,
            issueId: record.linearIssueId,
          }
        : null,
    topMin: topOf(lengthMinMin, lengthMaxMin),
    exact: lengthMinMin !== null && lengthMinMin === lengthMaxMin,
  };
}

/* ------------------------------------------------------------- writes -- */

/** The server calls the work sheet's writes use, so a test drives the same code. */
export type WorkSheetServer = Pick<
  FixtureServer,
  | "editWorkItem"
  | "setWorkTier"
  | "markTaskDone"
  | "backToPool"
  | "removeFromSynapse"
  | "writeLinearIssue"
  | "writeLinearDone"
  | "undo"
>;

/** A write's Undo: the work write's token, and Linear's way back when it moved. */
export interface WorkSheetWrite {
  undo: PlannerWrite["undo"];
  /** Mark the task done moved the issue to Done: Undo moves it back. */
  linearDone: boolean;
}

/**
 * A size card (C-USE-item-sheet-size-and-length-1): the size and its default
 * range, then on a linked item Linear's estimate, once.
 */
export async function writeSize(
  server: WorkSheetServer,
  view: WorkSheetView,
  size: WorkSize,
): Promise<WorkSheetWrite> {
  const range = sizeRange(size);
  const written = await server.editWorkItem({
    id: view.item.id,
    size,
    lengthMinMin: range.min,
    lengthMaxMin: range.max,
  });
  if (view.item.linked) {
    await server.writeLinearIssue({
      workItemId: view.item.id,
      estimate: SIZE_POINTS[size],
    });
  }
  return { undo: written.undo, linearDone: false };
}

/** Length as Exact (one length) or a range; the range never inverts. */
export async function writeLength(
  server: WorkSheetServer,
  view: WorkSheetView,
  range: { min: number; max: number | null },
): Promise<WorkSheetWrite> {
  const max = range.max === null ? null : Math.max(range.min, range.max);
  const written = await server.editWorkItem({
    id: view.item.id,
    lengthMinMin: range.min,
    lengthMaxMin: max,
  });
  return { undo: written.undo, linearDone: false };
}

/** Notes on a Synapse-only item (D-USE-36): the item's own column. */
export async function writeNotes(
  server: WorkSheetServer,
  view: WorkSheetView,
  notes: string,
): Promise<WorkSheetWrite> {
  const written = await server.editWorkItem({
    id: view.item.id,
    notes: notes.trim() === "" ? null : notes,
  });
  return { undo: written.undo, linearDone: false };
}

/**
 * A tier segment: this session's tier, or with `sessions` "all" every
 * session's (USE-67's ask, D-USE-57; This session is the default).
 */
export async function writeTier(
  server: WorkSheetServer,
  view: WorkSheetView,
  tier: WorkTier,
  sessions: "this" | "all" = "this",
): Promise<WorkSheetWrite | null> {
  if (view.slot === null) return null;
  const written = await server.setWorkTier({
    slotId: view.slot.id,
    tier,
    sessions,
  });
  return { undo: written.undo, linearDone: false };
}

/** Mark the task done: the task and every open session, and the issue on a linked item. */
export async function writeMarkTaskDone(
  server: WorkSheetServer,
  view: WorkSheetView,
): Promise<WorkSheetWrite> {
  const written = await server.markTaskDone({ workItemId: view.item.id });
  if (view.item.linked) {
    await server.writeLinearDone({ workItemId: view.item.id, done: true });
  }
  return { undo: written.undo, linearDone: view.item.linked };
}

/** Back to the pool: off every day; a done session stays. */
export async function writeBackToPool(
  server: WorkSheetServer,
  view: WorkSheetView,
): Promise<WorkSheetWrite> {
  const written = await server.backToPool({ workItemId: view.item.id });
  return { undo: written.undo, linearDone: false };
}

/** Remove from Synapse: archived here; Linear is never written. */
export async function writeRemoveFromSynapse(
  server: WorkSheetServer,
  view: WorkSheetView,
): Promise<WorkSheetWrite> {
  const written = await server.removeFromSynapse({ workItemId: view.item.id });
  return { undo: written.undo, linearDone: false };
}

/** A write's Undo: Synapse first, then the issue back to the status it left. */
export async function undoWorkSheetWrite(
  server: WorkSheetServer,
  view: WorkSheetView,
  write: WorkSheetWrite,
): Promise<void> {
  await server.undo(write.undo);
  if (write.linearDone) {
    await server.writeLinearDone({ workItemId: view.item.id, done: false });
  }
}
