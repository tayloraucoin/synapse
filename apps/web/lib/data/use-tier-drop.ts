"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkTier } from "@syn/types";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import { useDataSource } from "./source";
import { tierDropMoves, type TierSlot } from "./tier-drop";
import type { TodayRecords } from "./today-records";
import { todayQueryKey } from "./use-today";
import { useWorkWrites } from "./use-work-writes";

/**
 * A row dragged between Today's tiers at the desk (USE-71): the day's work
 * slots, read from the tiers' own cached query, and the drop written through
 * the work writes' `moveWork`, this session only, one write per slot whose
 * tier or place changes. `undo` takes them all back, last first.
 */
export function useTierDrop(dateKey: string) {
  const source = useDataSource();
  const writes = useWorkWrites();
  const slots = useQuery<TodayRecords, Error, TierSlot[]>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) => {
      const work = new Set(
        records.blocks
          .filter((block) => block.kind === "work")
          .map((block) => block.id),
      );
      return records.slots.flatMap((slot) =>
        slot.onDate === dateKey &&
        slot.workItemId !== null &&
        slot.tier !== null &&
        !slot.skipped &&
        work.has(slot.blockId)
          ? [{ id: slot.id, tier: slot.tier, sortOrder: slot.sortOrder }]
          : [],
      );
    },
  }).data;

  return {
    /** The tier a slot sits in now. */
    tierOf: (slotId: string): WorkTier | null =>
      slots?.find((slot) => slot.id === slotId)?.tier ?? null,
    /** The writes made, in order; empty when the drop changed nothing. */
    drop: async (input: {
      slotId: string;
      tier: WorkTier;
      beforeId: string | null;
    }): Promise<PlannerWrite[]> => {
      const done: PlannerWrite[] = [];
      for (const move of tierDropMoves(slots ?? [], input)) {
        done.push(await writes.moveWork(move));
      }
      return done;
    },
    undo: async (written: readonly PlannerWrite[]) => {
      for (const write of [...written].reverse()) {
        await writes.undo(write.undo);
      }
    },
  };
}
