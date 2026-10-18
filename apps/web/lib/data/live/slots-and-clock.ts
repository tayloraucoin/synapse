import type { z } from "zod";
import {
  placeSlotInput,
  removeSlotInput,
  slotEventInput,
  slotUpdateInput,
  type SlotRecord,
} from "@syn/validators";
import {
  PlannerRefusal,
  SlotEventRefusal,
  SlotWriteRefusal,
} from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The clock and the slots, live (USE-94): Start, Pause, Prompt sent, Bring
 * back, Done and Step away write `clock.writeEvents`; a slot is placed,
 * moved and done through `planner.placeSlot`, `planner.removeSlot` and
 * `planner.writeSlot`. Each input is parsed here first, so a bad one is
 * refused "invalid" with the schema's words, as the fixture refuses it, and
 * each refusal comes back as the class the fixture throws: a slot event's as
 * `SlotEventRefusal`, `writeSlots`' as `SlotWriteRefusal`, a place or a
 * remove as `PlannerRefusal`.
 *
 * `writeSlots` is the fixture's one method for a place and a change: with
 * `id` it is a change (`planner.writeSlot`), without one a place
 * (`planner.placeSlot`). Either way it hands back the slot as stored.
 */

type Refusal = new (reason: "invalid", message: string) => Error;

function parsed<S extends z.ZodTypeAny>(
  schema: S,
  raw: unknown,
  Refused: Refusal,
): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new Refused(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return result.data;
}

/** One write: the input parsed, then the call; a refusal as a rejection. */
function send<T>(run: () => Promise<T>): Promise<T> {
  try {
    return run();
  } catch (error) {
    return Promise.reject(error);
  }
}

function storedSlot(out: { slot?: SlotRecord }): SlotRecord {
  if (!out.slot) throw new Error("The slot write returned no slot.");
  return out.slot;
}

export const slotsAndClock = {
  name: "slots-and-clock",
  methods: (client) => {
    const p = client.planner;
    return {
      writeSlotEvents: (raws) =>
        send(() => {
          const inputs = raws.map((raw) =>
            parsed(slotEventInput, raw, SlotEventRefusal),
          );
          return callLive("slotEvent", () =>
            client.clock.writeEvents.mutate(inputs),
          );
        }),
      placeSlot: (raw) =>
        send(() => {
          const input = parsed(placeSlotInput, raw, PlannerRefusal);
          return callLive("planner", () => p.placeSlot.mutate(input));
        }),
      removeSlot: (raw) =>
        send(() => {
          const input = parsed(removeSlotInput, raw, PlannerRefusal);
          return callLive("planner", () => p.removeSlot.mutate(input));
        }),
      writeSlots: (raw) =>
        send(() => {
          if ("id" in raw) {
            const input = parsed(slotUpdateInput, raw, SlotWriteRefusal);
            return callLive("slotWrite", () => p.writeSlot.mutate(input)).then(
              storedSlot,
            );
          }
          const input = parsed(placeSlotInput, raw, SlotWriteRefusal);
          return callLive("slotWrite", () => p.placeSlot.mutate(input)).then(
            storedSlot,
          );
        }),
    };
  },
} satisfies LiveDomain;
