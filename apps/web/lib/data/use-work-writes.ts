"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PlannerRefusal, type PlannerWrite } from "@/lib/fixtures/planner";
import type { WorkServer } from "@/lib/fixtures/work";
import { offlineWrite } from "@/lib/offline/writes";
import { useDataSource } from "./source";
import { linearQueryKey } from "./use-linear";
import { usePlannerWrites } from "./use-planner-writes";
import { poolQueryKey } from "./use-pool";
import { todayQueryKey } from "./use-today";
import { weekQueryKey } from "./use-week";

/**
 * The work writes (USE-55; USE-51 adds `createTask`, USE-52 `placeIssues`):
 * New task, place, move and unplace a session, change a tier for
 * this session or all, edit the item, mark the task done, send it back to the
 * pool, remove it from Synapse and set client order. Each is a mutation that
 * invalidates the day, the week and the pool; its Undo is USE-36's `undo`.
 * Nothing here writes to Linear (D-USE-57). Offline a write pauses under its
 * key and replays in order after a reload (USE-106).
 */

export type WorkMethod = Exclude<keyof WorkServer, "readPool">;

type WorkCall = {
  [M in WorkMethod]: { method: M; args: Parameters<WorkServer[M]> };
}[WorkMethod];

export function useWorkWrites() {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const planner = usePlannerWrites();
  const scenario = source.scenario.name;

  function invalidate() {
    for (const queryKey of [
      todayQueryKey(scenario),
      weekQueryKey(scenario),
      poolQueryKey(scenario),
      // From Linear's placed rows fade, and the pool's notInPool shrinks.
      linearQueryKey(scenario),
    ]) {
      void queryClient.invalidateQueries({ queryKey });
    }
  }

  const mutation = useMutation<PlannerWrite, Error, WorkCall>({
    ...offlineWrite("work", scenario),
    onSettled: invalidate,
  });

  const write =
    <M extends WorkMethod>(method: M) =>
    (...args: Parameters<WorkServer[M]>): Promise<PlannerWrite> =>
      mutation.mutateAsync({ method, args } as WorkCall);

  return {
    placeWork: write("placeWork"),
    /** The place sheet's Place: a session each picked day, one Undo for all. */
    placeOnDays: write("placeOnDays"),
    moveWork: write("moveWork"),
    unplaceWork: write("unplaceWork"),
    /** Spread: the one item's sessions on several days, one Undo for all. */
    spreadWork: write("spreadWork"),
    setWorkTier: write("setWorkTier"),
    editWorkItem: write("editWorkItem"),
    markTaskDone: write("markTaskDone"),
    reopenTask: write("reopenTask"),
    backToPool: write("backToPool"),
    removeFromSynapse: write("removeFromSynapse"),
    setClientOrder: write("setClientOrder"),
    /** New task: one work item, then a slot a picked day; no days is the pool. */
    createTask: write("createTask"),
    /** From Linear: each ticked issue's work item and its slot in the tier. */
    placeIssues: write("placeIssues"),
    /** A write's Undo, from its `PlannerWrite.undo`: USE-36's, then the pool reads again. */
    undo: (token: PlannerWrite["undo"]) =>
      planner.undo(token).finally(invalidate),
    isPending: mutation.isPending,
    error: mutation.error,
  };
}

/** A refusal's words, for the form to show; null for any other failure. */
export function refusalWords(error: unknown): string | null {
  return error instanceof PlannerRefusal ? error.message : null;
}
