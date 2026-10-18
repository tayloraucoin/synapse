import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  editBlockInput,
  type BlockChangeInput,
  type EditBlockInput,
  type NewBlockInput,
  type NewTransitionInput,
  type SplitBlockInput,
} from "@syn/validators";
import { refuse } from "../../errors";
import { splitInto } from "./split-block";
import type { WriteJournal } from "./write-journal";
import {
  blockReach,
  findBlock,
  lookOf,
  parseOrRefuse,
  patch,
  requireOn,
  type PlanOut,
  type WriteScope,
} from "./write-plan";

/**
 * The block writes' plans (USE-92): the New block sheet's add, New
 * transition, an edit to the block itself (All), This and following, and
 * one date's change (This date). Each is the fixture server's write of the
 * same name, over the caller's rows; `run-write.ts` applies it.
 *
 * THE SCOPE QUESTION (D-USE-35, through USE-47): "All" is `planEditBlock`,
 * which changes the block and so every date it runs; "This and following" is
 * `planSplitBlock`, which ends the old rule the day before and starts a new
 * block on the date; "This date" is `planBlockChange`, one `block_changes`
 * row (D-USE-80: a skipped date is that row, never an EXDATE).
 */

export function planCreateBlock(
  journal: WriteJournal,
  input: NewBlockInput,
  scope?: WriteScope,
): PlanOut {
  const row = journal.put(
    "blocks",
    blockRecord.parse({
      ...journal.stamps(),
      kind: input.kind,
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      rrule: input.rrule ?? null,
      onDate: input.onDate ?? null,
      fill: input.fill ?? null,
      checklist: input.checklist,
      meal: input.meal,
      notify: input.notify,
      archivedAt: null,
    }),
  );
  return { id: row.id, reach: scope };
}

/** In a block, a `block_items` row; between blocks, a `transition` block (USE-2). */
export function planCreateTransition(
  journal: WriteJournal,
  input: NewTransitionInput,
  scope?: WriteScope,
): PlanOut {
  if (input.placement === "in_block") {
    findBlock(journal.rows, input.blockId);
    const row = journal.put(
      "blockItems",
      blockItemRecord.parse({
        ...journal.stamps(),
        blockId: input.blockId,
        title: input.name,
        icon: input.icon ?? null,
        isTransition: true,
        atTime: input.atTime,
        lengthMin: input.lengthMin,
        meal: input.meal,
        onDate: null,
        sortOrder: input.sortOrder,
      }),
    );
    return {
      id: row.id,
      reach: blockReach(journal.rows, scope, input.blockId),
    };
  }
  const row = journal.put(
    "blocks",
    blockRecord.parse({
      ...journal.stamps(),
      kind: "transition",
      name: input.name,
      icon: input.icon ?? null,
      color: input.color ?? null,
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      rrule: input.rrule ?? null,
      onDate: input.onDate ?? null,
      fill: null,
      checklist: input.checklist,
      meal: input.meal,
      notify: input.notify,
      archivedAt: null,
    }),
  );
  return { id: row.id, reach: scope };
}

/** All: the block itself, so every date it runs. */
export function planEditBlock(
  journal: WriteJournal,
  input: EditBlockInput,
  scope?: WriteScope,
): PlanOut {
  const { id, ...change } = input;
  const block = findBlock(journal.rows, id);
  const next = patch(block, { ...change, updatedAt: journal.stamp() });
  // A lone time is checked against the stored other one.
  parseOrRefuse(editBlockInput, {
    id,
    startsAt: next.startsAt,
    endsAt: next.endsAt,
  });
  journal.put("blocks", blockRecord.parse(next));
  return { id, reach: blockReach(journal.rows, scope, id) };
}

/** This and following: the old rule ends the day before; a new block from the date. */
export function planSplitBlock(
  journal: WriteJournal,
  { id, fromDate, patch: change }: SplitBlockInput,
): PlanOut {
  const block = findBlock(journal.rows, id);
  requireOn(block, fromDate);
  const next = patch(block, change);
  // The patch passes the block's checks, in their words.
  parseOrRefuse(editBlockInput, {
    id,
    ...change,
    startsAt: next.startsAt,
    endsAt: next.endsAt,
  });
  const split = splitInto(journal, block, fromDate, change);
  if (!split.ok) throw refuse("invalid", split.reason);
  return { id: split.id };
}

/**
 * This date: one repeating block's date moved or skipped, or its own name,
 * icon and colour for the date (USE-88); an absent look is kept.
 */
export function planBlockChange(
  journal: WriteJournal,
  input: BlockChangeInput,
): PlanOut {
  requireOn(findBlock(journal.rows, input.blockId), input.onDate);
  const existing = journal.rows.blockChanges.find(
    (c) => c.blockId === input.blockId && c.onDate === input.onDate,
  );
  const skipped = input.skipped ?? false;
  const row = journal.put(
    "blockChanges",
    blockChangeRecord.parse({
      ...(existing ?? journal.stamps()),
      updatedAt: journal.stamp(),
      blockId: input.blockId,
      onDate: input.onDate,
      skipped,
      startsAt: skipped ? null : (input.startsAt ?? null),
      endsAt: skipped ? null : (input.endsAt ?? null),
      // The look merges (USE-88): absent keeps the row's, null clears it.
      name: lookOf(input.name, existing?.name),
      icon: lookOf(input.icon, existing?.icon),
      color: lookOf(input.color, existing?.color),
    }),
  );
  return { id: row.id };
}
