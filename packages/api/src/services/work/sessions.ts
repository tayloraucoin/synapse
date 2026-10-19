import {
  placeSlotInput,
  removeSlotInput,
  slotRecord,
  slotUpdateInput,
  workItemInput,
  workItemRecord,
  type MoveWorkInput,
  type PlaceOnDaysInput,
  type PlaceWorkInput,
  type SetWorkTierInput,
  type SlotRecord,
  type SpreadWorkInput,
  type UnplaceWorkInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import { parseOrRefuse, patch } from "../planner/write-plan";
import { findWorkItem } from "./items";
import type { WorkJournal, WorkScope } from "./work-rows";

/**
 * A work item's sessions (USE-99): Place, Move to, the tier drag, Spread
 * across the week and a tier change, each a pure plan over the caller's rows
 * through the journal, ported from the fixture `WorkServer`'s
 * (`lib/fixtures/work/index.ts`) with its refusal reasons and words.
 * `runWorkWrite` applies each in one transaction with one Undo, however many
 * days it names. Nothing here writes to Linear (C-USE-spread-1).
 *
 * D-USE-40: each day is its own session, and one item sits once a day
 * (`slots_work_item_id_on_date_key`). A second place on a date is refused,
 * never merged; the plan reads every session of the item to know.
 */

/** The fixture's words for a date that holds the item already. */
export const ALREADY_PLACED = "That item is already placed.";

const NO_SESSION_LENGTH = "A session needs a length.";

type WorkSlot = SlotRecord & { workItemId: string };

function findWorkSlot(journal: WorkJournal, id: string): WorkSlot {
  const slot = journal.rows.slots.find((row) => row.id === id);
  if (!slot) throw refuse("unknown", "No slot with that id.");
  if (slot.workItemId === null) {
    throw refuse("invalid", "Only a work item takes a tier.");
  }
  return slot as WorkSlot;
}

function requireBlock(journal: WorkJournal, id: string) {
  if (!journal.rows.blocks.some((block) => block.id === id)) {
    throw refuse("unknown", "No block with that id.");
  }
}

/** Another slot holds the item on the date. */
function holdsOn(
  journal: WorkJournal,
  workItemId: string,
  onDate: string,
  except?: string,
): boolean {
  return journal.rows.slots.some(
    (s) =>
      s.id !== except && s.workItemId === workItemId && s.onDate === onDate,
  );
}

/** After the block's own slots on the date. */
function nextSortOrder(journal: WorkJournal, blockId: string, onDate: string) {
  return (
    journal.rows.slots
      .filter((s) => s.blockId === blockId && s.onDate === onDate)
      .reduce((top, s) => Math.max(top, s.sortOrder), -1) + 1
  );
}

/** One new session; the slot's own rules refuse first, in their words. */
function putSession(
  journal: WorkJournal,
  session: {
    workItemId: string;
    blockId: string;
    onDate: string;
    sortOrder: number;
    tier: SlotRecord["tier"];
    lengthMin?: number;
  },
): SlotRecord {
  const input = parseOrRefuse(placeSlotInput, session);
  requireBlock(journal, input.blockId);
  if (holdsOn(journal, session.workItemId, input.onDate)) {
    throw refuse("duplicate", ALREADY_PLACED);
  }
  return journal.put(
    "slots",
    slotRecord.parse({
      ...journal.stamps(),
      blockId: input.blockId,
      onDate: input.onDate,
      skipped: false,
      sortOrder: input.sortOrder,
      blockItemId: null,
      todoId: null,
      workItemId: session.workItemId,
      tier: input.tier ?? null,
      lengthMin: input.lengthMin ?? null,
      tookMin: null,
      doneAt: null,
    }),
  );
}

/** The rows each write reads: its item's sessions, its blocks' slots. */
export const sessionScope = {
  place: (input: PlaceWorkInput): WorkScope => ({
    workItemIds: [input.workItemId],
  }),
  slot: (input: { slotId: string }): WorkScope => ({
    workItemIds: [],
    slotIds: [input.slotId],
  }),
  days: (input: {
    workItemId: string;
    days?: readonly { blockId: string }[];
    sessions?: readonly { blockId: string }[];
  }): WorkScope => ({
    workItemIds: [input.workItemId],
    blockIds: [...(input.days ?? []), ...(input.sessions ?? [])].map(
      (day) => day.blockId,
    ),
  }),
};

/** Place, or a drop from the pool: one session where the sheet put it. */
export function planPlaceWork(
  journal: WorkJournal,
  input: PlaceWorkInput,
): { id: string } {
  findWorkItem(journal, input.workItemId);
  const row = putSession(journal, {
    workItemId: input.workItemId,
    blockId: input.blockId,
    onDate: input.dateKey,
    sortOrder: input.sortOrder,
    tier: input.tier,
  });
  return { id: row.id };
}

/**
 * The place sheet's Place (USE-80): a session on every picked day, in the
 * one tier, after each block's own slots. A day picked twice, or one that
 * holds the item already, refuses them all.
 */
export function planPlaceOnDays(
  journal: WorkJournal,
  input: PlaceOnDaysInput,
): { id: string } {
  findWorkItem(journal, input.workItemId);
  for (const day of input.days) {
    putSession(journal, {
      workItemId: input.workItemId,
      blockId: day.blockId,
      onDate: day.dateKey,
      sortOrder:
        day.sortOrder ?? nextSortOrder(journal, day.blockId, day.dateKey),
      tier: input.tier,
    });
  }
  return { id: input.workItemId };
}

/**
 * Move to, or the tier drag (USE-71): only the keys sent change, and the
 * session stays one session. A drop where it started is the hook's to skip.
 */
export function planMoveWork(
  journal: WorkJournal,
  raw: MoveWorkInput,
): { id: string } {
  const { id, ...change } = parseOrRefuse(slotUpdateInput, {
    id: raw.slotId,
    onDate: raw.dateKey,
    blockId: raw.blockId,
    tier: raw.tier,
    sortOrder: raw.sortOrder,
  });
  const slot = findWorkSlot(journal, id);
  if (change.blockId !== undefined) requireBlock(journal, change.blockId);
  if (holdsOn(journal, slot.workItemId, change.onDate ?? slot.onDate, id)) {
    throw refuse("duplicate", ALREADY_PLACED);
  }
  journal.put(
    "slots",
    slotRecord.parse(patch(slot, { ...change, updatedAt: journal.stamp() })),
  );
  return { id };
}

/** A session's ×: the slot goes, the item stays in the pool. */
export function planUnplaceWork(
  journal: WorkJournal,
  raw: UnplaceWorkInput,
): Record<string, never> {
  const { id } = parseOrRefuse(removeSlotInput, { id: raw.slotId });
  findWorkSlot(journal, id);
  journal.remove("slots", id);
  return {};
}

/**
 * Spread across the week (USE-77, C-USE-spread-1): a session a picked day,
 * each its length, after the block's own slots, and the item's hours when
 * Work left was changed, all in the one write; a refusal on any day writes
 * none of them.
 */
export function planSpreadWork(
  journal: WorkJournal,
  input: SpreadWorkInput,
): { id: string } {
  const item = findWorkItem(journal, input.workItemId);
  for (const session of input.sessions) {
    if (!(session.lengthMin > 0)) {
      throw refuse("invalid", NO_SESSION_LENGTH);
    }
    putSession(journal, {
      workItemId: input.workItemId,
      blockId: session.blockId,
      onDate: session.dateKey,
      sortOrder: nextSortOrder(journal, session.blockId, session.dateKey),
      tier: input.tier,
      lengthMin: Math.round(session.lengthMin),
    });
  }
  if (
    input.lengthMaxMin !== undefined &&
    input.lengthMaxMin !== item.lengthMaxMin
  ) {
    const lengthMaxMin = Math.round(input.lengthMaxMin);
    const next = patch(item, {
      lengthMaxMin,
      lengthMinMin:
        item.lengthMinMin === null
          ? null
          : Math.min(item.lengthMinMin, lengthMaxMin),
      updatedAt: journal.stamp(),
    });
    parseOrRefuse(workItemInput, next);
    journal.put("workItems", workItemRecord.parse(next));
  }
  return { id: input.workItemId };
}

/**
 * A tier change (D-USE-57, rabbit hole 13): This session, or All the item's
 * open sessions in one write. A done session keeps the tier it was done in.
 */
export function planSetWorkTier(
  journal: WorkJournal,
  raw: SetWorkTierInput,
): { id: string } {
  const input = parseOrRefuse(slotUpdateInput, {
    id: raw.slotId,
    tier: raw.tier,
    sessions: raw.sessions,
  });
  const slot = findWorkSlot(journal, input.id);
  const moved =
    input.sessions === "all"
      ? journal.rows.slots.filter(
          (s) => s.workItemId === slot.workItemId && s.doneAt === null,
        )
      : [slot];
  const at = journal.stamp();
  for (const session of moved) {
    if (session.tier === input.tier) continue;
    journal.put(
      "slots",
      slotRecord.parse({ ...session, tier: input.tier, updatedAt: at }),
    );
  }
  return { id: input.id };
}
