import {
  blockItemInput,
  blockItemRecord,
  placeSlotInput,
  slotRecord,
  type BlockItemInput,
  type BlockItemRecord,
  type EditBlockItemInput,
  type RemoveBlockItemInput,
  type ReorderItemsInput,
  type SlotRecord,
} from "@syn/validators";
import { refuse } from "../../errors";
import type { WriteJournal } from "./write-journal";
import {
  blockReach,
  findBlock,
  findItem,
  parseOrRefuse,
  patch,
  requireOn,
  type PlanOut,
  type WriteScope,
} from "./write-plan";

/**
 * The set items' plans (USE-92): add, edit, remove and reorder a block's
 * items, as the fixture server's writes of the same names. An item with
 * `onDate` is that date's own; one without is every date the block runs.
 * A date's change to a set item never touches the item: it is the date's
 * slot (skipped, or its order), made on first touch.
 */

/** A set item's slot on a date, made if it has none. */
function slotFor(
  journal: WriteJournal,
  item: BlockItemRecord,
  date: string,
  change: Partial<SlotRecord>,
): SlotRecord {
  const existing = journal.rows.slots.find(
    (s) => s.blockItemId === item.id && s.onDate === date,
  );
  if (existing) {
    return journal.put(
      "slots",
      slotRecord.parse(
        patch(existing, { ...change, updatedAt: journal.stamp() }),
      ),
    );
  }
  const input = parseOrRefuse(placeSlotInput, {
    blockId: item.blockId,
    onDate: date,
    sortOrder: item.sortOrder,
    blockItemId: item.id,
    ...change,
  });
  return journal.put(
    "slots",
    slotRecord.parse({
      ...journal.stamps(),
      blockId: input.blockId,
      onDate: input.onDate,
      skipped: input.skipped ?? false,
      sortOrder: input.sortOrder,
      blockItemId: item.id,
      todoId: null,
      workItemId: null,
      tier: null,
      lengthMin: null,
      tookMin: null,
      doneAt: null,
    }),
  );
}

/** An item on every date, or with `onDate` on that date only. */
export function planWriteBlockItem(
  journal: WriteJournal,
  input: BlockItemInput,
  scope?: WriteScope,
): PlanOut {
  const block = findBlock(journal.rows, input.blockId);
  if (input.onDate != null) requireOn(block, input.onDate);
  const row = journal.put(
    "blockItems",
    blockItemRecord.parse({
      ...journal.stamps(),
      blockId: input.blockId,
      title: input.title,
      icon: input.icon ?? null,
      isTransition: input.isTransition,
      atTime: input.atTime ?? null,
      lengthMin: input.lengthMin ?? null,
      meal: input.meal,
      onDate: input.onDate ?? null,
      sortOrder: input.sortOrder,
    }),
  );
  return {
    id: row.id,
    reach:
      input.onDate == null
        ? blockReach(journal.rows, scope, block.id)
        : undefined,
  };
}

export function planEditBlockItem(
  journal: WriteJournal,
  input: EditBlockItemInput,
  scope?: WriteScope,
): PlanOut {
  const { id, ...change } = input;
  const item = findItem(journal.rows, id);
  const next = patch(item, { ...change, updatedAt: journal.stamp() });
  // The row as it will stand passes the item's checks, in their words.
  parseOrRefuse(blockItemInput, next);
  // A move to another block reaches only one of the caller's own.
  if (next.blockId !== item.blockId) findBlock(journal.rows, next.blockId);
  journal.put("blockItems", blockItemRecord.parse(next));
  return {
    id,
    reach:
      next.onDate === null
        ? blockReach(journal.rows, scope, next.blockId)
        : undefined,
  };
}

/**
 * Without `date`, the item goes (with its slots). With `date`, a set item
 * is skipped on that date and stays usual; a date's own item just goes.
 */
export function planRemoveBlockItem(
  journal: WriteJournal,
  { id, date }: RemoveBlockItemInput,
  scope?: WriteScope,
): PlanOut {
  const item = findItem(journal.rows, id);
  if (item.onDate !== null || date === undefined) {
    journal.removeItem(id);
    return {
      reach:
        item.onDate === null
          ? blockReach(journal.rows, scope, item.blockId)
          : undefined,
    };
  }
  requireOn(findBlock(journal.rows, item.blockId), date);
  const slot = slotFor(journal, item, date, { skipped: true });
  return { id: slot.id };
}

/**
 * The block's items take the order sent. Without `date`, the usual items'
 * `sort_order`, renumbered 0, 1, 2…; with `date`, the date's slots of set
 * items and the date's own items, so the usual block keeps its order.
 */
export function planReorderItems(
  journal: WriteJournal,
  { blockId, ids, date }: ReorderItemsInput,
  scope?: WriteScope,
): PlanOut {
  findBlock(journal.rows, blockId);
  const items = ids.map((id) => {
    const item = findItem(journal.rows, id);
    if (item.blockId !== blockId) {
      throw refuse("unknown", "That item is not in the block.");
    }
    return item;
  });
  items.forEach((item, index) => {
    if (date === undefined || item.onDate !== null) {
      if (date === undefined && item.onDate !== null) {
        throw refuse("invalid", "A date's own item moves on its date.");
      }
      journal.put(
        "blockItems",
        blockItemRecord.parse({
          ...item,
          sortOrder: index,
          updatedAt: journal.stamp(),
        }),
      );
    } else {
      slotFor(journal, item, date, { sortOrder: index });
    }
  });
  return {
    reach:
      date === undefined ? blockReach(journal.rows, scope, blockId) : undefined,
  };
}
