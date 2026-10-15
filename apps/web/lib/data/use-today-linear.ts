"use client";

import { useQueryClient } from "@tanstack/react-query";
import type { LinearRowLineView } from "@/components/work";
import { slotEventFor } from "./running";
import { useDataSource } from "./source";
import type { TodayWorkView } from "./today-work";
import { useLinear } from "./use-linear";
import { useSlotEvents } from "./use-slot-events";
import { todayQueryKey } from "./use-today";
import { useWorkWrites } from "./use-work-writes";

/** A row's Linear line in the view, by slot id. */
export function linearLineFor(
  view: TodayWorkView,
  slotId: string,
): LinearRowLineView | null {
  return (
    view.tiers.flatMap((group) => group.rows).find((row) => row.id === slotId)
      ?.linear ?? null
  );
}

/**
 * Linear's two actions on Today's rows (USE-63), through `useLinear`:
 *
 * - Try again sends the same failed outbox row again; it never writes a
 *   second one. Synapse's state was never changed, so nothing else moves.
 * - Reopen, on an issue closed in Linear (D-USE-97): the slot's `undone`,
 *   the task and every session that closed with it open again
 *   (`reopenTask`), then the `reopen` outbox row, which moves the issue back
 *   to the status it had before it closed (`linear_prev_state_id`).
 *
 * Offline, both write as online; the sender holds Linear's rows until the
 * connection is back (C-USE-today-offline-1).
 */
export function useTodayLinear(dateKey: string, view: TodayWorkView | null) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const linear = useLinear();
  const events = useSlotEvents(dateKey);
  const work = useWorkWrites();

  async function retry(slotId: string) {
    const line = view ? linearLineFor(view, slotId) : null;
    if (line?.kind !== "failed") return;
    await linear.retry(line.writeId);
  }

  async function reopen(slotId: string) {
    const workItemId = view?.workItemIds.get(slotId);
    if (!workItemId) return;
    await events.mutateAsync([slotEventFor(slotId, "undone", source.now())]);
    await work.reopenTask({ workItemId });
    await linear.setDone(workItemId, false);
    void queryClient.invalidateQueries({
      queryKey: todayQueryKey(source.scenario.name),
    });
  }

  return { retry, reopen };
}
