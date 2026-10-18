import type {
  PlaceSlotInput,
  RemoveSlotInput,
  SlotRecord,
  SlotUpdateInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import type { WriteJournal } from "./write-journal";
import { findBlock, patch, type PlanOut } from "./write-plan";

/**
 * The slot writes (USE-94), each as the fixture server has it: `placeSlot`
 * and `removeSlot` (`lib/fixtures/planner/index.ts`) and `writeSlots`' change
 * (`lib/fixtures/server.ts`), with the same refusal words. A slot is placed,
 * moved and done; its clock is `slot_events`', never a column here.
 *
 * The plan reads the slots `runPlannerWrite` read for it (`slotKeys`): the
 * named block's, the slot's own, and every slot of the same item, to-do or
 * work item, so the one-per-date keys are tested on every row they reach.
 */

/** A place refused by `slots`' unique keys: one per item and per work item on a date. */
export const ALREADY_PLACED = "That item is already placed.";

const NO_SLOT = "No slot with that id.";

type SlotTargets = Pick<SlotRecord, "blockItemId" | "todoId" | "workItemId">;

/** `slots_*_on_date_key`: another slot holds the same target on the date. */
export function slotClash(
  slots: readonly SlotRecord[],
  input: { onDate: string } & Partial<SlotTargets>,
  except?: string,
): boolean {
  const same = (a: string | null | undefined, b: string | null) =>
    a != null && a === b;
  return slots.some(
    (s) =>
      s.id !== except &&
      s.onDate === input.onDate &&
      (same(input.blockItemId, s.blockItemId) ||
        same(input.todoId, s.todoId) ||
        same(input.workItemId, s.workItemId)),
  );
}

/** The slots a write must read beyond its block's: the slot's own, its target's. */
export interface SlotKeys {
  ids?: readonly string[];
  blockItemIds?: readonly string[];
  todoIds?: readonly string[];
  workItemIds?: readonly string[];
}

export function placeKeys(input: PlaceSlotInput): SlotKeys {
  return {
    blockItemIds: input.blockItemId ? [input.blockItemId] : [],
    todoIds: input.todoId ? [input.todoId] : [],
    workItemIds: input.workItemId ? [input.workItemId] : [],
  };
}

export function planPlaceSlot(
  journal: WriteJournal,
  input: PlaceSlotInput,
): PlanOut {
  const { rows } = journal;
  findBlock(rows, input.blockId);
  if (slotClash(rows.slots, input)) {
    throw refuse("duplicate", ALREADY_PLACED);
  }
  const row = journal.put<SlotRecord>("slots", {
    ...journal.stamps(),
    blockId: input.blockId,
    onDate: input.onDate,
    skipped: input.skipped ?? false,
    sortOrder: input.sortOrder,
    blockItemId: input.blockItemId ?? null,
    todoId: input.todoId ?? null,
    workItemId: input.workItemId ?? null,
    tier: input.tier ?? null,
    lengthMin: input.lengthMin ?? null,
    tookMin: null,
    doneAt: null,
    notes: input.notes || null,
    atTime: input.atTime ?? null,
    icon: input.icon ?? null,
  });
  return { id: row.id, slot: row };
}

export function planRemoveSlot(
  journal: WriteJournal,
  { id }: RemoveSlotInput,
): PlanOut {
  if (!journal.rows.slots.some((s) => s.id === id)) {
    throw refuse("unknown", NO_SLOT);
  }
  journal.remove("slots", id);
  return {};
}

/**
 * Only the keys sent change; `null` clears (doneAt, tookMin). Sessions move
 * a work item's tier (USE-99's), not a slot column, so they are dropped.
 */
export function planWriteSlot(
  journal: WriteJournal,
  input: SlotUpdateInput,
): PlanOut {
  const { rows } = journal;
  const { id, ...change } = input;
  delete change.sessions;
  const row = rows.slots.find((s) => s.id === id);
  if (!row) throw refuse("unknown", NO_SLOT);
  if (change.blockId !== undefined) findBlock(rows, change.blockId);
  const next: SlotRecord = {
    ...patch(row, change),
    updatedAt: journal.stamp(),
  };
  if (slotClash(rows.slots, next, id)) {
    throw refuse("duplicate", ALREADY_PLACED);
  }
  journal.put("slots", next);
  return { id, slot: next };
}
