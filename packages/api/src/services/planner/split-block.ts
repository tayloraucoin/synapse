import { splitRule } from "@syn/utils";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  slotRecord,
  type BlockRecord,
  type SplitBlockInput,
} from "@syn/validators";
import type { WriteJournal } from "./write-journal";

/**
 * This and following (USE-47; custom-recurrence.md), as the fixture's
 * `splitInto` (`lib/fixtures/planner/split-block.ts`): a repeating block cut
 * at a date it runs on. The old block keeps its rule up to the day before
 * (`splitRule`: UNTIL, or COUNT recounted); a new block takes the change
 * from the date on, with what is left of the rule. No date is dropped or
 * doubled. From the rule's first date there is nothing before, so the block
 * itself takes the change, as All.
 *
 * What belongs to the dates from the cut moves with them: the date's own
 * items, slots (onto the new block's copies of the usual items) and changes.
 * A time change on the cut date itself goes: the new times are that date's
 * now. All of it is one plan, so one transaction.
 */

export type SplitPatch = SplitBlockInput["patch"];

export type SplitOutcome =
  { ok: true; id: string; whole: boolean } | { ok: false; reason: string };

export function splitInto(
  journal: WriteJournal,
  block: BlockRecord,
  fromDate: string,
  patch: SplitPatch,
): SplitOutcome {
  const { rows } = journal;
  if (block.rrule === null) {
    return { ok: false, reason: "A block on one date has no following dates." };
  }
  const split = splitRule(block.rrule, fromDate);
  if (!split.ok) return split;

  const changed = { ...patch, updatedAt: journal.stamp() };
  if (split.before === null) {
    journal.put("blocks", blockRecord.parse({ ...block, ...changed }));
    return { ok: true, id: block.id, whole: true };
  }

  journal.put(
    "blocks",
    blockRecord.parse({
      ...block,
      rrule: split.before,
      updatedAt: journal.stamp(),
    }),
  );
  const next = journal.put(
    "blocks",
    blockRecord.parse({
      ...block,
      ...journal.stamps(),
      ...patch,
      rrule: split.after,
      onDate: null,
      archivedAt: null,
    }),
  );

  // The usual items, copied; a date's own items from the cut, moved.
  const copies = new Map<string, string>();
  for (const item of rows.blockItems.filter((i) => i.blockId === block.id)) {
    if (item.onDate === null) {
      const copy = journal.put(
        "blockItems",
        blockItemRecord.parse({
          ...item,
          ...journal.stamps(),
          blockId: next.id,
        }),
      );
      copies.set(item.id, copy.id);
    } else if (item.onDate >= fromDate) {
      journal.put(
        "blockItems",
        blockItemRecord.parse({
          ...item,
          blockId: next.id,
          updatedAt: journal.stamp(),
        }),
      );
    }
  }

  for (const slot of rows.slots.filter(
    (s) => s.blockId === block.id && s.onDate >= fromDate,
  )) {
    journal.put(
      "slots",
      slotRecord.parse({
        ...slot,
        blockId: next.id,
        blockItemId:
          slot.blockItemId === null
            ? null
            : (copies.get(slot.blockItemId) ?? slot.blockItemId),
        updatedAt: journal.stamp(),
      }),
    );
  }

  const timed = patch.startsAt !== undefined || patch.endsAt !== undefined;
  for (const change of rows.blockChanges.filter(
    (c) => c.blockId === block.id && c.onDate >= fromDate,
  )) {
    if (timed && change.onDate === fromDate && !change.skipped) {
      journal.remove("blockChanges", change.id);
      continue;
    }
    journal.put(
      "blockChanges",
      blockChangeRecord.parse({
        ...change,
        blockId: next.id,
        updatedAt: journal.stamp(),
      }),
    );
  }

  return { ok: true, id: next.id, whole: false };
}
