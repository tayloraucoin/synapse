import { TRPCError } from "@trpc/server";

import {
  deferItemInput,
  itemIdInput,
  rateItemInput,
  setDoneInput,
  setNoteInput,
  setQuantityInput,
} from "@syn/validators";

import { bringBackItem, doItemAnyway } from "../services/day/bring-back";
import { getItem } from "../services/day/get-item";
import {
  deferItem,
  rateItem,
  setItemNote,
  setItemQuantity,
} from "../services/day/item-fields";
import { setItemDone } from "../services/day/set-done";
import { resolveTodayFor } from "../services/day/today";
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
  /** IT-01's read — the sheet's own, not a widening of the row view. */
  get: protectedProcedure.input(itemIdInput).query(async ({ ctx, input }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    const item = await getItem(ctx.rls, ctx.authContext.userId, input.id, {
      todayKey: today.todayKey,
      now: new Date(),
    });
    if (!item) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No such item." });
    }
    return item;
  }),

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

  /** IT-01's four small writes. Each stamps a closed day's review. */
  defer: protectedProcedure
    .input(deferItemInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await deferItem(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  setQuantity: protectedProcedure
    .input(setQuantityInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await setItemQuantity(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  setNote: protectedProcedure
    .input(setNoteInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await setItemNote(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  rate: protectedProcedure
    .input(rateItemInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await rateItem(ctx.rls, ctx.authContext.userId, input);
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
