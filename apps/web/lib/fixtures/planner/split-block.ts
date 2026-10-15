import type { z } from "zod";
import { splitRule } from "@syn/utils";
import {
  blockChangeRecord,
  blockItemRecord,
  blockRecord,
  slotRecord,
  type BlockRecord,
  type editBlockInput,
} from "@syn/validators";
import type { FixtureRecords } from "../records";
import type { Journal } from "./journal";

/**
 * This and following (USE-47; custom-recurrence.md): a repeating block cut
 * at a date it runs on. The old block keeps its rule up to the day before
 * (`splitRule`: UNTIL, or COUNT recounted); a new block takes the change
 * from the date on, with what is left of the rule. No date is dropped or
 * doubled. From the rule's first date there is nothing before, so the
 * block itself takes the change, as All.
 *
 * What belongs to the dates from the cut moves with them: the date's own
 * items, slots (onto the new block's copies of the usual items) and
 * changes. A time change on the cut date itself goes: the new times are
 * that date's now.
 */

/** What the following dates take: a block's own fields, never its repeat. */
export type SplitPatch = Omit<
  z.input<typeof editBlockInput>,
  "id" | "rrule" | "onDate"
>;

export interface SplitStamps {
  stamp: () => string;
  stamps: () => { id: string; createdAt: string; updatedAt: string };
}

export type SplitOutcome =
  { ok: true; id: string; whole: boolean } | { ok: false; reason: string };

export function splitInto(
  journal: Journal,
  records: FixtureRecords,
  block: BlockRecord,
  fromDate: string,
  patch: SplitPatch,
  { stamp, stamps }: SplitStamps,
): SplitOutcome {
  if (block.rrule === null) {
    return { ok: false, reason: "A block on one date has no following dates." };
  }
  const split = splitRule(block.rrule, fromDate);
  if (!split.ok) return split;

  const changed = { ...patch, updatedAt: stamp() };
  if (split.before === null) {
    journal.put("blocks", blockRecord.parse({ ...block, ...changed }));
    return { ok: true, id: block.id, whole: true };
  }

  journal.put(
    "blocks",
    blockRecord.parse({ ...block, rrule: split.before, updatedAt: stamp() }),
  );
  const next = journal.put(
    "blocks",
    blockRecord.parse({
      ...block,
      ...stamps(),
      ...patch,
      rrule: split.after,
      onDate: null,
      archivedAt: null,
    }),
  );

  // The usual items, copied; a date's own items from the cut, moved.
  const copies = new Map<string, string>();
  for (const item of records.blockItems.filter((i) => i.blockId === block.id)) {
    if (item.onDate === null) {
      const copy = journal.put(
        "blockItems",
        blockItemRecord.parse({ ...item, ...stamps(), blockId: next.id }),
      );
      copies.set(item.id, copy.id);
    } else if (item.onDate >= fromDate) {
      journal.put(
        "blockItems",
        blockItemRecord.parse({
          ...item,
          blockId: next.id,
          updatedAt: stamp(),
        }),
      );
    }
  }

  for (const slot of records.slots.filter(
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
        updatedAt: stamp(),
      }),
    );
  }

  const timed = patch.startsAt !== undefined || patch.endsAt !== undefined;
  for (const change of records.blockChanges.filter(
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
        updatedAt: stamp(),
      }),
    );
  }

  return { ok: true, id: next.id, whole: false };
}
