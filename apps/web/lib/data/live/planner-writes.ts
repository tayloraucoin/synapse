import type { z } from "zod";
import {
  blockChangeInput,
  blockItemInput,
  copyBlockInput,
  copyDayInput,
  dayBoundsInput,
  dayEventInput,
  dayRefInput,
  editBlockInput,
  editBlockItemInput,
  newBlockInput,
  newTransitionInput,
  removeBlockItemInput,
  reorderItemsInput,
  resetDayInput,
  splitBlockInput,
} from "@syn/validators";
import { PlannerRefusal } from "@/lib/data/refusals";
import type { LiveDomain } from "./domains";
import { callLive } from "./errors";

/**
 * The planner's writes, live (USE-92): Set my days, the New block sheet,
 * Block view and Review the day write through `planner.*`, Copy from, Clear
 * the day and Reset to usual among them (USE-93), and every Undo
 * goes through `planner.undo` with the write's signed token. Each input is
 * parsed here first, so a bad one is refused "invalid" with the schema's
 * words, as the fixture refuses it, before any call. The results keep the
 * fixture's shape, `{ undo, id?, reach? }`.
 *
 * [ASSUMPTION] Undo is one method for every write: outside production, a
 * work or to-do write still on fixtures hands back a token the live undo
 * refuses, until USE-95, 98 and 99 make those writes live too.
 */

function parsed<S extends z.ZodTypeAny>(schema: S, raw: unknown): z.output<S> {
  const result = schema.safeParse(raw);
  if (!result.success) {
    throw new PlannerRefusal(
      "invalid",
      result.error.issues[0]?.message ?? "Invalid input.",
    );
  }
  return result.data;
}

/** One write: the input parsed, then the call, its refusal mapped. */
function send<T>(parse: () => unknown, call: (input: never) => Promise<T>) {
  try {
    const input = parse();
    return callLive("planner", () => call(input as never));
  } catch (error) {
    return Promise.reject(error);
  }
}

export const plannerWrites: LiveDomain = {
  name: "planner-writes",
  methods: (client) => {
    const p = client.planner;
    return {
      writeBounds: (raw) =>
        send(
          () => parsed(dayBoundsInput, raw),
          (input) => p.writeBounds.mutate(input),
        ),
      createBlock: (raw, scope) =>
        send(
          () => parsed(newBlockInput, raw),
          (input) => p.createBlock.mutate({ input, scope }),
        ),
      createTransition: (raw, scope) =>
        send(
          () => parsed(newTransitionInput, raw),
          (input) => p.createTransition.mutate({ input, scope }),
        ),
      editBlock: (raw, scope) =>
        send(
          () => parsed(editBlockInput, raw),
          (input) => p.editBlock.mutate({ input, scope }),
        ),
      splitBlock: (raw) =>
        send(
          () => parsed(splitBlockInput, raw),
          (input) => p.splitBlock.mutate(input),
        ),
      writeBlockChange: (raw) =>
        send(
          () => parsed(blockChangeInput, raw),
          (input) => p.writeBlockChange.mutate(input),
        ),
      writeBlockItem: (raw, scope) =>
        send(
          () => parsed(blockItemInput, raw),
          (input) => p.writeBlockItem.mutate({ input, scope }),
        ),
      editBlockItem: (raw, scope) =>
        send(
          () => parsed(editBlockItemInput, raw),
          (input) => p.editBlockItem.mutate({ input, scope }),
        ),
      removeBlockItem: (raw, scope) =>
        send(
          () => parsed(removeBlockItemInput, raw),
          (input) => p.removeBlockItem.mutate({ input, scope }),
        ),
      reorderItems: (raw, scope) =>
        send(
          () => parsed(reorderItemsInput, raw),
          (input) => p.reorderItems.mutate({ input, scope }),
        ),
      writeDayEvent: ({ id, ...raw }, scope) =>
        send(
          () => parsed(dayEventInput, raw),
          (input) => p.writeDayEvent.mutate({ input, id, scope }),
        ),
      copyDay: (raw) =>
        send(
          () => parsed(copyDayInput, raw),
          (input) => p.copyDay.mutate(input),
        ),
      copyBlock: (raw) =>
        send(
          () => parsed(copyBlockInput, raw),
          (input) => p.copyBlock.mutate(input),
        ),
      clearDay: (raw) =>
        send(
          () => parsed(dayRefInput, raw),
          (input) => p.clearDay.mutate(input),
        ),
      resetDay: (raw) =>
        send(
          () => parsed(resetDayInput, raw),
          (input) => p.resetDay.mutate(input),
        ),
      undo: (token) =>
        callLive("planner", () => p.undo.mutate({ token })).then(() => {}),
    };
  },
};
