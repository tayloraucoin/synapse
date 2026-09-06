import { TRPCError } from "@trpc/server";

import { itemIdInput, setDoneInput } from "@syn/validators";

import { bringBackItem, doItemAnyway } from "../services/day/bring-back";
import { setItemDone } from "../services/day/set-done";
import { protectedProcedure, router } from "../trpc";

/**
 * The three writes the List makes.
 *
 * Every one is a single item and a single intent. There is no batch endpoint
 * and no "sync my day" call: a person taps one checkbox at a time, and a
 * mutation that could half-succeed over five rows would leave a day nobody
 * could reason about.
 */
export const itemRouter = router({
  setDone: protectedProcedure
    .input(setDoneInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await setItemDone(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  /** LS-02 — a trimmed item rejoins its own part, at its own time. */
  bringBack: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await bringBackItem(ctx.rls, ctx.authContext.userId, input.id);
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  /** LS-03 — a cut item returns as something to do today, and its miss goes. */
  doAnyway: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await doItemAnyway(ctx.rls, ctx.authContext.userId, input.id);
      } catch (error) {
        throw asNotFound(error);
      }
    }),
});

function asNotFound(error: unknown): TRPCError {
  if (error instanceof Error && /no such (item|day)/.test(error.message)) {
    return new TRPCError({ code: "NOT_FOUND", message: "No such item." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
