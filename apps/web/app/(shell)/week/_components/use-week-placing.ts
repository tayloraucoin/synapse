"use client";

import * as React from "react";
import { toast } from "@syn/ui";
import type { WorkTier } from "@syn/utils";
import { issueLength } from "@/lib/data/linear-size";
import {
  nextSortOrder,
  PLACE_WORDS,
  readPlaceId,
  timeDropTier,
  weekdayOf,
  workBlocksOf,
  type PlaceSource,
} from "@/lib/data/place";
import { useLinearIssues } from "@/lib/data/use-linear";
import { usePlace, usePlaceSeed } from "@/lib/data/use-place";
import { usePool } from "@/lib/data/use-pool";
import type { SetUpWeek } from "@/lib/data/use-week";

/**
 * The Week's placing (USE-75): what a drop means on this screen, decoded from
 * DragToPlace's ids into USE-75's `usePlace`. A Priority cell lands in the
 * day's first Work block, after its own slots; a Time lens Work block files
 * under the day's first tier with room (`timeDropTier`); the pool takes a
 * placed chip back. "+ Add to <tier>" opens one search per cell, and its
 * picks land as a drop does. A capture's seed stages a real placing (its
 * Undo held) or the popover open.
 */

export interface AddingAt {
  dateKey: string;
  tier: WorkTier;
}

export function useWeekPlacing(week: SetUpWeek | undefined) {
  const seed = usePlaceSeed();
  const placer = usePlace(seed?.drop ? { holdMs: Infinity } : {});
  const pool = usePool();
  const linear = useLinearIssues().data;
  const [adding, setAddingAt] = React.useState<AddingAt | null>(
    seed?.add ? { dateKey: seed.add.dateKey, tier: seed.add.tier } : null,
  );
  // A capture's words are typed once: the next opening starts empty.
  const [seededQuery, setSeededQuery] = React.useState(seed?.add?.query ?? "");
  const setAdding = (at: AddingAt | null) => {
    if (at === null) setSeededQuery("");
    setAddingAt(at);
  };
  /** '+ New item "<query>"': New task with the title, day and tier filled (D-USE-65). */
  const [newItem, setNewItem] = React.useState<
    (AddingAt & { blockId: string | undefined; title: string }) | null
  >(null);

  const dayOf = (dateKey: string) =>
    week?.days.find((day) => day.date === dateKey) ?? null;

  /** A Priority cell's landing: the day's first Work block, after its slots. */
  const cellLanding = (dateKey: string) => {
    const day = dayOf(dateKey);
    const block = day ? workBlocksOf(day)[0] : undefined;
    if (!day || !block) return null;
    return {
      blockId: block.block.id,
      sortOrder: nextSortOrder(
        day.blocks.flatMap((b) => b.slots),
        block.block.id,
        dateKey,
      ),
    };
  };

  const sizeOf = (from: PlaceSource) => {
    if ("workItemId" in from) {
      const item = pool.pool?.items.find(
        (e) => e.item.id === from.workItemId,
      )?.item;
      return {
        size: item?.size ?? null,
        lengthMaxMin: item?.lengthMaxMin ?? null,
      };
    }
    const issue = linear?.notInPool.find((i) => i.id === from.issueId);
    const length = issueLength(issue?.estimate ?? null);
    return { size: length.size, lengthMaxMin: length.lengthMaxMin };
  };

  /** A pick from the popover, or a pool row let go over a cell. */
  const placeInCell = (
    from: PlaceSource & { title?: string },
    at: AddingAt,
  ) => {
    const landing = cellLanding(at.dateKey);
    if (!landing) return;
    void placer.place(from, { dateKey: at.dateKey, tier: at.tier, ...landing });
  };

  const onPlace = (sourceId: string, targetId: string, label: string) => {
    const from = readPlaceId(sourceId);
    const to = readPlaceId(targetId);
    if (!from || !to) return;
    if (to.kind === "pool") {
      if (from.kind === "chip") void placer.unplace(from.slotId);
      return;
    }
    if (from.kind === "row" && to.kind === "cell") {
      placeInCell({ ...from.source, title: label }, to);
      return;
    }
    if (from.kind === "row" && to.kind === "block") {
      const day = dayOf(to.dateKey);
      if (!day) return;
      const tier = timeDropTier({
        day,
        blockId: to.blockId,
        item: sizeOf(from.source),
      });
      if (tier === null) {
        toast(PLACE_WORDS.full(weekdayOf(to.dateKey)));
        return;
      }
      void placer.place(
        { ...from.source, title: label },
        {
          dateKey: to.dateKey,
          blockId: to.blockId,
          tier,
          sortOrder: nextSortOrder(
            day.blocks.flatMap((b) => b.slots),
            to.blockId,
            to.dateKey,
          ),
        },
      );
      return;
    }
    if (from.kind === "chip" && to.kind === "cell") {
      const slot = pool.slots?.find((s) => s.id === from.slotId);
      const landing = cellLanding(to.dateKey);
      if (!slot || !landing) return;
      void placer.move(
        from.slotId,
        slot.onDate === to.dateKey
          ? { dateKey: to.dateKey, tier: to.tier }
          : { dateKey: to.dateKey, tier: to.tier, ...landing },
      );
    }
  };

  // A capture's moment: the board's drop, made for real once the week reads.
  const seeded = React.useRef(false);
  const placeLatest = React.useRef(placeInCell);
  placeLatest.current = placeInCell;
  const drop = seed?.drop;
  React.useEffect(() => {
    if (seeded.current || !drop || !week || !pool.pool) return;
    seeded.current = true;
    placeLatest.current({ workItemId: drop.workItemId }, drop);
  }, [drop, week, pool.pool]);

  return {
    ...placer,
    onPlace,
    adding,
    setAdding,
    placeInCell,
    cellLanding,
    newItem,
    openNewItem: (at: AddingAt, title: string) =>
      setNewItem({ ...at, blockId: cellLanding(at.dateKey)?.blockId, title }),
    closeNewItem: () => setNewItem(null),
    /** The popover's opening words, a capture's, until it first closes. */
    seededQuery,
  };
}

export type WeekPlacing = ReturnType<typeof useWeekPlacing>;
