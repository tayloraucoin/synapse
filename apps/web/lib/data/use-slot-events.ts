"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { SlotEventKind } from "@syn/types";
import type { SlotEventInput, SlotEventRecord } from "@syn/validators";
import { useDataSource } from "./source";
import { resumeAllInputs, stepAwayInputs } from "./step-away";
import { todayQueryKey, useToday } from "./use-today";

/**
 * The clock's writes (USE-7): one batch of slot events per action, through
 * the fixture server now and `writeSlotEvents` on tRPC in wave 3. Every way
 * to fire writes one `prompt_sent` (C-USE-firing-1). The day is invalidated
 * after each write and the clock derived again; nothing is set by hand.
 */
export function useSlotEvents(dateKey: string) {
  const source = useDataSource();
  const queryClient = useQueryClient();
  const { today } = useToday(dateKey);

  const mutation = useMutation<SlotEventRecord[], Error, SlotEventInput[]>({
    mutationFn: (inputs) => source.server.writeSlotEvents(inputs),
    onSettled: () =>
      queryClient.invalidateQueries({
        queryKey: todayQueryKey(source.scenario.name),
      }),
  });

  const newId = () => crypto.randomUUID();

  /** One event on one slot, at the clock's now. */
  function write(slotId: string, kind: SlotEventKind) {
    return mutation.mutateAsync([
      { slotId, kind, clientEventId: newId(), at: source.now().toISOString() },
    ]);
  }

  /** Pause every running slot under one Step away id; null when none ran. */
  async function stepAway(): Promise<string | null> {
    if (!today) return null;
    const { stepAwayId, inputs } = stepAwayInputs(
      today.clock,
      source.now(),
      newId,
    );
    if (inputs.length === 0) return null;
    await mutation.mutateAsync(inputs);
    return stepAwayId;
  }

  /** Resume exactly what that Step away still holds. */
  async function resumeAll(stepAwayId: string) {
    if (!today) return [];
    const inputs = resumeAllInputs(
      today.clock,
      stepAwayId,
      source.now(),
      newId,
    );
    if (inputs.length === 0) return [];
    return mutation.mutateAsync(inputs);
  }

  return { ...mutation, write, stepAway, resumeAll };
}
