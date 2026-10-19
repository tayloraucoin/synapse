import type { DayClock } from "@syn/utils";
import type { SlotEventInput } from "@syn/validators";

/**
 * Step away and Resume all as batches (D-USE-46), composed from the derived
 * clock. Step away pauses every running work timer under one id; firing is
 * not running, so it keeps counting. Resume all resumes exactly the slots
 * that id still holds; a card's own Pause carries no id and is never resumed.
 */

export function stepAwayInputs(
  clock: DayClock,
  at: Date,
  newId: () => string,
): { stepAwayId: string; inputs: SlotEventInput[] } {
  const stepAwayId = newId();
  const inputs = [...clock.slots]
    .filter(([, slot]) => slot.state === "running")
    .map(([slotId]) => ({
      slotId,
      kind: "paused" as const,
      clientEventId: newId(),
      at: at.toISOString(),
      stepAwayId,
    }));
  return { stepAwayId, inputs };
}

export function resumeAllInputs(
  clock: DayClock,
  stepAwayId: string,
  at: Date,
  newId: () => string,
): SlotEventInput[] {
  return [...clock.slots]
    .filter(([, slot]) => slot.heldBy === stepAwayId)
    .map(([slotId]) => ({
      slotId,
      kind: "resumed" as const,
      clientEventId: newId(),
      at: at.toISOString(),
      stepAwayId,
    }));
}
