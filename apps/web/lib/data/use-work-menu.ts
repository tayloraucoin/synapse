"use client";

import { useQuery } from "@tanstack/react-query";
import type { WorkTier } from "@syn/types";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import { useDataSource } from "./source";
import type { TodayRecords } from "./today-records";
import type { TodayWorkView } from "./today-work";
import { useLinear } from "./use-linear";
import { todayQueryKey } from "./use-today";
import { useWorkWrites } from "./use-work-writes";

/**
 * The work menu's reads and writes on Today (USE-70; D-USE-57). Start,
 * Prompt sent and Done are the work loop's (USE-59, USE-60); this adds what
 * the loop does not hold, each through the work writes the Item sheet uses
 * (USE-55, USE-65), so the menu writes nothing of its own:
 *
 * - a slot's tier, This session only (a session with others open asks
 *   first, in its Item sheet, as USE-67 does);
 * - Back to the pool: off every day, a done session stays;
 * - each linked item's issue URL, for Open in Linear.
 */
export function useWorkMenu(dateKey: string, view: TodayWorkView | null) {
  const source = useDataSource();
  const writes = useWorkWrites();
  const { issueFor } = useLinear();
  // The day's records, already read for the tiers: the cached query.
  const items = useQuery<TodayRecords, Error, TodayRecords["workItems"]>({
    queryKey: todayQueryKey(source.scenario.name, dateKey),
    queryFn: () => source.server.readToday(dateKey),
    select: (records) => records.workItems,
  }).data;

  const itemOf = (slotId: string) => view?.workItemIds.get(slotId) ?? null;

  return {
    /** The item's issue in Linear; null on a Synapse-only item. */
    urlOf: (slotId: string): string | null => {
      const id = itemOf(slotId);
      const item = id ? items?.find((row) => row.id === id) : undefined;
      return item ? (issueFor(item)?.url ?? null) : null;
    },
    /** A session with others still to come asks This session or All. */
    asksForTier: (slotId: string): boolean =>
      view?.sessionNext.get(slotId) != null,
    setTier: (slotId: string, tier: WorkTier): Promise<PlannerWrite> =>
      writes.setWorkTier({ slotId, tier, sessions: "this" }),
    backToPool: async (slotId: string): Promise<PlannerWrite | null> => {
      const workItemId = itemOf(slotId);
      return workItemId ? writes.backToPool({ workItemId }) : null;
    },
    undo: (write: PlannerWrite) => writes.undo(write.undo),
  };
}
