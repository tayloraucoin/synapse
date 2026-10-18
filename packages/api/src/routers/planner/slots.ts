import {
  placeSlotInput,
  removeSlotInput,
  slotUpdateInput,
  slotWriteOutput,
} from "@syn/validators";
import { refuse } from "../../errors";
import { runPlannerWrite } from "../../services/planner/run-write";
import {
  ALREADY_PLACED,
  placeKeys,
  planPlaceSlot,
  planRemoveSlot,
  planWriteSlot,
} from "../../services/planner/write-slots";
import { protectedProcedure } from "../../trpc";

/**
 * The slot writes (USE-94): the fixture server's `placeSlot`, `removeSlot`
 * and `writeSlots`' change, live, each a plan applied in one `rls.execute`
 * with its Undo token. `writeSlot` takes only a change; the web app's
 * `writeSlots` sends a place to `placeSlot`. Each hands back the slot as
 * stored beside `{ undo, id? }`.
 *
 * A slot that slipped past the plan's own one-per-date test (a race) meets
 * `slots_*_on_date_key` and is refused as the plan refuses it.
 */

const UNIQUE_VIOLATION = "23505";

function isSlotClash(error: unknown): boolean {
  for (let e = error; e instanceof Error; e = e.cause) {
    const { code, constraint_name } = e as {
      code?: string;
      constraint_name?: string;
    };
    if (code === UNIQUE_VIOLATION) {
      return constraint_name?.startsWith("slots_") ?? false;
    }
  }
  return false;
}

async function refusingClash<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    if (isSlotClash(error)) throw refuse("duplicate", ALREADY_PLACED);
    throw error;
  }
}

const none = () => [];

const write = protectedProcedure.output(slotWriteOutput);

export const plannerSlots = {
  placeSlot: write.input(placeSlotInput).mutation(({ ctx, input }) =>
    refusingClash(
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: () => [input.blockId],
        slots: placeKeys(input),
        plan: (journal) => planPlaceSlot(journal, input),
      }),
    ),
  ),

  removeSlot: write.input(removeSlotInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: none,
      slots: { ids: [input.id] },
      plan: (journal) => planRemoveSlot(journal, input),
    }),
  ),

  writeSlot: write.input(slotUpdateInput).mutation(({ ctx, input }) =>
    refusingClash(
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: none,
        slots: { ids: [input.id] },
        plan: (journal) => planWriteSlot(journal, input),
      }),
    ),
  ),
};
