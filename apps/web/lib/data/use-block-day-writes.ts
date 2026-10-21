"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SlotRecord } from "@syn/validators";
import type { FixtureServer } from "@/lib/fixtures/server";
import type { Tick } from "./optimistic-day";
import { useDataSource } from "./source";
import { sendTick, tickOf, tickOptions } from "./tick-write";
import type { BlockViewItem } from "./use-block-view";
import { nextItemInput, usePlannerWrites } from "./use-planner-writes";

/**
 * Block view's writes from the day (USE-48): every one today's only, through
 * the date-only writes (C-USE-block-view-4). Remove skips the item's slot on
 * the date (a date's own item goes); a reorder writes the date's order; an
 * add is a dated item, 5 minutes, after the last (D-USE-81); Delete block is
 * the date's `skipped` change. The weekday's usual block and items are never
 * written. Each returns what its Undo takes.
 *
 * A check is the slot's own write (D-USE-13): done now, the planned length
 * as the time taken, as Done records it; the slot is placed on first touch.
 * It shows at once and rolls back on a failure, as Now's (tick-write.ts).
 * Offline it lands on the phone and syncs later (D-USE-64).
 */

/** The slot calls a check makes, so a test drives the same code. */
export type BlockCheckServer = Pick<FixtureServer, "writeSlots">;

export function blockCheckTick(
  place: { blockId: string; date: string },
  item: BlockViewItem,
  done: boolean,
  at: Date,
): Tick {
  const change = done
    ? { doneAt: at.toISOString(), tookMin: item.lengthMin }
    : { doneAt: null, tookMin: null };
  return tickOf(
    { dateKey: place.date, blockId: place.blockId },
    {
      slotId: item.slotId,
      blockItemId: item.id,
      todoId: null,
      sortOrder: item.sortOrder,
    },
    change,
  );
}

export function writeBlockCheck(
  server: BlockCheckServer,
  place: { blockId: string; date: string },
  item: BlockViewItem,
  done: boolean,
  at: Date,
): Promise<SlotRecord> {
  return sendTick(server, blockCheckTick(place, item, done, at));
}

export function useBlockDayWrites(place: { blockId: string; date: string }) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();

  // Optimistic (tick-write.ts): the box shows at once on the week's day.
  const check = useMutation(tickOptions(source, queryClient));

  return {
    /** The box: done as planned, or the record withdrawn. */
    check: (item: BlockViewItem, done: boolean) =>
      check.mutateAsync(blockCheckTick(place, item, done, source.now())),
    /** Off today only; resolves to the Undo token. */
    remove: async (item: BlockViewItem) =>
      (await planner.removeBlockItem({ id: item.id, date: place.date })).undo,
    /** The whole order after a drop or a Move, on the date only. */
    reorder: (ids: string[]) =>
      planner.reorderItems({
        blockId: place.blockId,
        ids,
        date: place.date,
      }),
    /** "Add to Wellness": a dated item, 5 min, after the last. */
    add: (title: string, items: readonly BlockViewItem[]) =>
      planner.writeBlockItem(
        nextItemInput({
          blockId: place.blockId,
          title,
          items,
          date: place.date,
        }),
      ),
    /** Delete block (D-USE-69): today's occurrence skipped; the usual keeps it. */
    deleteBlock: async () =>
      (
        await planner.writeBlockChange({
          blockId: place.blockId,
          onDate: place.date,
          skipped: true,
        })
      ).undo,
    undo: (token: string) => planner.undo(token),
  };
}
