import type { IconValue, StoredBlockKind, WorkTier } from "@syn/types";
import {
  clockFromMinutes,
  clockMinutes,
  fitInBlock,
  topMinutes,
  type BlockFitSlot,
} from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { Today } from "./derive-today";

/**
 * Move to (USE-69; interactions/move-to): one item off its place today,
 * each target with its consequence before the tap. Pure, so a test reads and
 * writes what the step does.
 *
 * FOR TODAY ONLY (C-USE-move-to-3). The usual week is never written: a set
 * item moves by its slots alone, as Block complete's Later does (USE-25). On
 * today its slot changes block; to another day it is skipped today (a
 * `skipped` slot, USE-14's column) and its slot is written on that date. A
 * day with no block of its kind takes it into that day's to-dos (D-USE-37).
 *
 * A WORK ITEM keeps its tier (C-USE-move-to-2): its session moves block or
 * date through the work writes, or Back to the pool takes its open sessions
 * off. Nothing is written to Linear.
 *
 * FIT is USE-8's `fitInBlock` at the top of every range: a Work block counts
 * the tiers at and above the item's, less the meetings in it; any other
 * block counts its items' lengths (each one tier, so all count). The item
 * goes at the end. Lengths only here; the step words them.
 */

type Occurrence = Today["occurrences"]["blocks"][number];

/** D-USE-81: an item with no length counts 5 minutes. */
const DEFAULT_LENGTH_MIN = 5;
const MIN_MS = 60_000;
const at = (time: string) => new Date(clockMinutes(time) * MIN_MS);

interface MoveFrom {
  blockId: string;
  blockName: string;
  blockKind: StoredBlockKind;
  /** "HH:MM" on today's date. */
  startsAt: string;
  endsAt: string;
}

export type MoveSubject =
  | (MoveFrom & {
      type: "set";
      /** The set item (a block item). */
      id: string;
      title: string;
      icon: IconValue | null;
      lengthMin: number;
      /** The block it belongs to in the usual week. */
      homeBlockId: string;
      /** Today's slot, when it has one. */
      slot: SlotRecord | null;
      sortOrder: number;
    })
  | (MoveFrom & {
      type: "work";
      /** The work item. */
      id: string;
      title: string;
      /** Today's session. */
      slot: SlotRecord;
      tier: WorkTier;
      /** The session's top (`topMinutes`); null for no top. */
      topMin: number | null;
      /** "ENG-123" when linked. */
      identifier: string | null;
      lengthMinMin: number | null;
      lengthMaxMin: number | null;
    });

/** Where a block target lands and what it costs. */
export interface MoveFit {
  fits: boolean;
  /** Free minutes after it, when it fits. */
  freeMin: number | null;
  /** Minutes past the block's end, when it does not. */
  overMin: number | null;
  /** "HH:MM" where the block's items run to with it in. */
  runsTo: string | null;
}

export type MoveTarget =
  | {
      kind: "block";
      /** "later" today, "tomorrow", or a "picked" day. */
      when: "later" | "tomorrow" | "picked";
      dateKey: string;
      blockId: string;
      blockName: string;
      blockKind: StoredBlockKind;
      startsAt: string;
      endsAt: string;
      /** At the end of the block (of its tier, for work). */
      sortOrder: number;
      fit: MoveFit;
      /** The last item it goes after; null in an empty block. */
      after: { title: string; meal: boolean } | null;
      /** The item's slot already on that date, moved rather than placed. */
      existing: SlotRecord | null;
    }
  /** A day with no block of its kind: the item waits in that day's to-dos. */
  | { kind: "todos"; dateKey: string; blockKind: StoredBlockKind }
  /** A work item on a day with no Work block, or already on it: nothing to move to. */
  | {
      kind: "none";
      dateKey: string;
      blockKind: StoredBlockKind;
      reason: "no-block" | "holds";
    }
  | { kind: "pool" };

export interface MoveToView {
  subject: MoveSubject;
  later: MoveTarget[];
  tomorrow: MoveTarget | null;
}

function lengthOf(lengthMin: number | null | undefined): number {
  return lengthMin ?? DEFAULT_LENGTH_MIN;
}

function fromOf(occurrence: Occurrence): MoveFrom {
  return {
    blockId: occurrence.block.id,
    blockName: occurrence.block.name,
    blockKind: occurrence.block.kind,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
  };
}

/** The item to move, on today's records; null when it is not on the day. */
export function deriveMoveSubject(
  today: Today,
  id: string,
): MoveSubject | null {
  const { records, occurrences } = today;
  const item = records.blockItems.find((row) => row.id === id);
  if (item) {
    const slot =
      records.slots.find(
        (row) => row.blockItemId === id && row.onDate === records.date,
      ) ?? null;
    const blockId = slot && !slot.skipped ? slot.blockId : item.blockId;
    const occurrence = occurrences.blocks.find((o) => o.block.id === blockId);
    if (!occurrence || slot?.skipped) return null;
    return {
      ...fromOf(occurrence),
      type: "set",
      id,
      title: item.title,
      icon: item.icon,
      lengthMin: lengthOf(slot?.lengthMin ?? item.lengthMin),
      homeBlockId: item.blockId,
      slot,
      sortOrder: slot?.sortOrder ?? item.sortOrder,
    };
  }
  const work = records.workItems.find((row) => row.id === id);
  const slot = records.slots.find(
    (row) =>
      row.workItemId === id && row.onDate === records.date && !row.skipped,
  );
  if (!work || !slot) return null;
  const occurrence = occurrences.blocks.find(
    (o) => o.block.id === slot.blockId,
  );
  if (!occurrence) return null;
  return {
    ...fromOf(occurrence),
    type: "work",
    id,
    title: work.title,
    slot,
    tier: slot.tier ?? "primary",
    topMin: topMinutes({
      lengthMin: slot.lengthMin,
      lengthMaxMin: work.lengthMaxMin,
      size: work.size,
    }),
    identifier: work.linearIdentifier,
    lengthMinMin: work.lengthMinMin,
    lengthMaxMin: work.lengthMaxMin,
  };
}

interface Held {
  title: string;
  meal: boolean;
  sortOrder: number;
  fit: BlockFitSlot;
}

/** What a block holds on its date, the subject left out, in order. */
function heldIn(
  day: Today,
  occurrence: Occurrence,
  subject: MoveSubject,
): Held[] {
  const { records } = day;
  const { block, slots } = occurrence;
  const works = new Map(records.workItems.map((row) => [row.id, row]));
  const items = new Map(records.blockItems.map((row) => [row.id, row]));
  // Set items whose date slot moved out (Later, or an earlier move) are not here.
  const elsewhere = new Set(
    records.slots
      .filter(
        (slot) =>
          slot.onDate === records.date &&
          slot.blockItemId !== null &&
          (slot.skipped || slot.blockId !== block.id),
      )
      .map((slot) => slot.blockItemId),
  );
  const own = records.blockItems
    .filter(
      (item) =>
        item.blockId === block.id &&
        !item.isTransition &&
        (item.onDate === null || item.onDate === records.date) &&
        !elsewhere.has(item.id) &&
        item.id !== subject.id,
    )
    .map((item): Held => {
      const slot = slots.find((row) => row.blockItemId === item.id);
      const lengthMin = lengthOf(slot?.lengthMin ?? item.lengthMin);
      return {
        title: item.title,
        meal: item.meal,
        sortOrder: slot?.sortOrder ?? item.sortOrder,
        fit: { tier: "primary", topMin: lengthMin },
      };
    });
  const placed = slots
    .filter(
      (slot) =>
        !slot.skipped &&
        !(
          slot.blockItemId !== null &&
          items.get(slot.blockItemId)?.blockId === block.id
        ) &&
        slot.blockItemId !== subject.id &&
        slot.workItemId !== subject.id,
    )
    .flatMap((slot): Held[] => {
      const work = slot.workItemId ? works.get(slot.workItemId) : undefined;
      const item = slot.blockItemId ? items.get(slot.blockItemId) : undefined;
      const todo = slot.todoId
        ? records.todos.find((row) => row.id === slot.todoId)
        : undefined;
      const title = work?.title ?? item?.title ?? todo?.title;
      if (title === undefined) return [];
      const fit: BlockFitSlot = work
        ? {
            tier: slot.tier ?? "primary",
            topMin: topMinutes({
              lengthMin: slot.lengthMin,
              lengthMaxMin: work.lengthMaxMin,
              size: work.size,
            }),
          }
        : {
            tier: "primary",
            topMin: lengthOf(
              slot.lengthMin ?? item?.lengthMin ?? todo?.lengthMin,
            ),
          };
      return [
        { title, meal: item?.meal ?? false, sortOrder: slot.sortOrder, fit },
      ];
    });
  return [...own, ...placed].sort((a, b) => a.sortOrder - b.sortOrder);
}

/** A block on its date as a target: fit at the top, the place at its end. */
export function blockTarget(
  day: Today,
  occurrence: Occurrence,
  subject: MoveSubject,
  when: "later" | "tomorrow" | "picked",
): MoveTarget {
  const { records } = day;
  const held = heldIn(day, occurrence, subject);
  const work = subject.type === "work";
  const fit = fitInBlock({
    block: { start: at(occurrence.startsAt), end: at(occurrence.endsAt) },
    slots: held.map((row) => row.fit),
    // A Work block's meetings are pinned spans; other blocks hold items only.
    busy: work
      ? records.dayEvents.map((event) => ({
          start: at(event.startsAt),
          end: at(event.endsAt),
        }))
      : [],
    tier: work ? subject.tier : "primary",
    topMin: work ? subject.topMin : subject.lengthMin,
  });
  const runsTo =
    fit.runsTo === null
      ? null
      : clockFromMinutes(Math.round(fit.runsTo.getTime() / MIN_MS));
  const last = held.at(-1);
  const existing =
    records.slots.find(
      (slot) =>
        slot.onDate === records.date &&
        (work
          ? slot.workItemId === subject.id
          : slot.blockItemId === subject.id),
    ) ?? null;
  return {
    kind: "block",
    when,
    dateKey: records.date,
    blockId: occurrence.block.id,
    blockName: occurrence.block.name,
    blockKind: occurrence.block.kind,
    startsAt: occurrence.startsAt,
    endsAt: occurrence.endsAt,
    sortOrder: held.reduce((top, row) => Math.max(top, row.sortOrder), -1) + 1,
    fit: fit.fits
      ? { fits: true, freeMin: fit.freeMin, overMin: null, runsTo }
      : { fits: false, freeMin: null, overMin: fit.overMin, runsTo },
    after: last ? { title: last.title, meal: last.meal } : null,
    existing,
  };
}

/** Whether a block can take the subject: Work for work; its kind, or a break. */
function takes(subject: MoveSubject, kind: StoredBlockKind): boolean {
  if (subject.type === "work") return kind === "work";
  return kind === subject.blockKind || kind === "break";
}

/**
 * Later today: every later block that can take the item, in time order
 * [ASSUMPTION, plain-item.md: its kind or a break; Work only for work],
 * starting after its own block and not yet over.
 */
function laterToday(
  today: Today,
  subject: MoveSubject,
  nowClock: string,
): MoveTarget[] {
  return today.occurrences.blocks
    .filter(
      (o) =>
        o.block.id !== subject.blockId &&
        takes(subject, o.block.kind) &&
        o.startsAt > subject.startsAt &&
        o.endsAt > nowClock,
    )
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
    .map((o) => blockTarget(today, o, subject, "later"));
}

/**
 * Another date's target: the subject's own block when it runs that day,
 * else the first block of its kind; with none, that day's to-dos (a work
 * item has nowhere to go).
 */
export function dayTarget(
  day: Today,
  subject: MoveSubject,
  when: "tomorrow" | "picked",
): MoveTarget {
  const kind = subject.type === "work" ? "work" : subject.blockKind;
  const blocks = day.occurrences.blocks
    .filter((o) => o.block.kind === kind)
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt));
  const block = blocks.find((o) => o.block.id === subject.blockId) ?? blocks[0];
  const dateKey = day.records.date;
  if (block) {
    const target = blockTarget(day, block, subject, when);
    // One work item sits once per date (USE-55): a day it is on is no target.
    return subject.type === "work" &&
      target.kind === "block" &&
      target.existing !== null &&
      dateKey !== subject.slot.onDate
      ? { kind: "none", dateKey, blockKind: kind, reason: "holds" }
      : target;
  }
  return subject.type === "work"
    ? { kind: "none", dateKey, blockKind: kind, reason: "no-block" }
    : { kind: "todos", dateKey, blockKind: kind };
}

/** The step's rows: later today, then tomorrow when it has a block to go to. */
export function deriveMoveTo(input: {
  today: Today;
  tomorrow: Today | null;
  id: string;
  /** "HH:MM", now on today's clock. */
  nowClock: string;
}): MoveToView | null {
  const subject = deriveMoveSubject(input.today, input.id);
  if (subject === null) return null;
  const tomorrow =
    input.tomorrow === null
      ? null
      : dayTarget(input.tomorrow, subject, "tomorrow");
  return {
    subject,
    later: laterToday(input.today, subject, input.nowClock),
    // A day with no block, or one the work item is already on, is not offered.
    tomorrow: tomorrow?.kind === "block" ? tomorrow : null,
  };
}

/* ------------------------------------------------------------- writes -- */

/** The server calls a move uses, so a test drives the same code. */
export type MoveServer = Pick<
  FixtureServer,
  | "writeSlots"
  | "removeSlot"
  | "moveWork"
  | "backToPool"
  | "writeTodo"
  | "removeTodo"
  | "undo"
>;

/** One step of a move's Undo, run last first. */
export type MoveUndoStep =
  | { kind: "token"; token: PlannerWrite["undo"] }
  | {
      kind: "slot";
      id: string;
      change: {
        blockId?: string;
        onDate?: string;
        sortOrder?: number;
        skipped?: boolean;
      };
    }
  | { kind: "remove-slot"; id: string }
  | { kind: "remove-todo"; id: string };

export interface MoveWrite {
  undo: MoveUndoStep[];
}

/** A set item off today, its usual day keeping it: its slot skipped. */
async function leaveToday(
  server: MoveServer,
  subject: Extract<MoveSubject, { type: "set" }>,
  todayKey: string,
): Promise<MoveUndoStep> {
  const { slot } = subject;
  if (slot !== null) {
    // Back in its own block, so the skip reads where the usual day has it.
    await server.writeSlots({
      id: slot.id,
      skipped: true,
      blockId: subject.homeBlockId,
    });
    return {
      kind: "slot",
      id: slot.id,
      change: { skipped: slot.skipped, blockId: slot.blockId },
    };
  }
  const placed = await server.writeSlots({
    blockId: subject.homeBlockId,
    onDate: todayKey,
    skipped: true,
    sortOrder: subject.sortOrder,
    blockItemId: subject.id,
  });
  return { kind: "remove-slot", id: placed.id };
}

/** The move: only the subject's slot (or session) changes; Undo puts it back. */
export async function writeMove(
  server: MoveServer,
  subject: MoveSubject,
  target: MoveTarget,
  todayKey: string,
): Promise<MoveWrite> {
  if (subject.type === "work") {
    if (target.kind === "pool") {
      const written = await server.backToPool({ workItemId: subject.id });
      return { undo: [{ kind: "token", token: written.undo }] };
    }
    if (target.kind !== "block") throw new Error("No Work block that day.");
    const written = await server.moveWork({
      slotId: subject.slot.id,
      dateKey: target.dateKey,
      blockId: target.blockId,
      sortOrder: target.sortOrder,
    });
    return { undo: [{ kind: "token", token: written.undo }] };
  }

  if (target.kind === "pool" || target.kind === "none") {
    throw new Error("A set item has no pool.");
  }
  if (target.kind === "todos") {
    const off = await leaveToday(server, subject, todayKey);
    const todo = await server.writeTodo({
      title: subject.title,
      type: "other",
      icon: subject.icon,
      lengthMin: subject.lengthMin,
      onDate: target.dateKey,
    });
    return { undo: [off, { kind: "remove-todo", id: todo.id }] };
  }

  // Later today: its slot changes block, or one is placed there.
  if (target.dateKey === todayKey) {
    const { slot } = subject;
    if (slot !== null) {
      await server.writeSlots({
        id: slot.id,
        blockId: target.blockId,
        sortOrder: target.sortOrder,
      });
      return {
        undo: [
          {
            kind: "slot",
            id: slot.id,
            change: { blockId: slot.blockId, sortOrder: slot.sortOrder },
          },
        ],
      };
    }
    const placed = await server.writeSlots({
      blockId: target.blockId,
      onDate: todayKey,
      sortOrder: target.sortOrder,
      blockItemId: subject.id,
    });
    return { undo: [{ kind: "remove-slot", id: placed.id }] };
  }

  // Another day: skipped today, its slot there at the end of the block.
  const off = await leaveToday(server, subject, todayKey);
  const there = target.existing;
  if (there !== null) {
    await server.writeSlots({
      id: there.id,
      blockId: target.blockId,
      sortOrder: target.sortOrder,
      skipped: false,
    });
    return {
      undo: [
        off,
        {
          kind: "slot",
          id: there.id,
          change: {
            blockId: there.blockId,
            sortOrder: there.sortOrder,
            skipped: there.skipped,
          },
        },
      ],
    };
  }
  const placed = await server.writeSlots({
    blockId: target.blockId,
    onDate: target.dateKey,
    sortOrder: target.sortOrder,
    blockItemId: subject.id,
  });
  return { undo: [off, { kind: "remove-slot", id: placed.id }] };
}

/** Undo: each step put back, last first. */
export async function undoMove(
  server: MoveServer,
  write: MoveWrite,
): Promise<void> {
  for (const step of [...write.undo].reverse()) {
    if (step.kind === "token") await server.undo(step.token);
    else if (step.kind === "slot") {
      await server.writeSlots({ id: step.id, ...step.change });
    } else if (step.kind === "remove-slot") {
      await server.removeSlot({ id: step.id });
    } else await server.removeTodo(step.id);
  }
}
