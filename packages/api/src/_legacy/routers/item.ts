import { TRPCError } from "@trpc/server";

import {
  deferItemInput,
  doNowInput,
  habitDayEditInput,
  itemIdInput,
  moveItemInput,
  rateItemInput,
  setDoneInput,
  setNoteInput,
  setQuantityInput,
} from "@syn/validators";

import { bringBackItem, doItemAnyway } from "../services/day/bring-back";
import { ChooseAlternateError, chooseAlternate } from "../services/day/choose-alternate";
import { DoNowError, doNow } from "../services/day/do-now";
import { EditHabitDayError, editHabitDay } from "../services/day/edit-habit-day";
import { getItem } from "../services/day/get-item";
import {
  deferItem,
  rateItem,
  setItemNote,
  setItemQuantity,
} from "../services/day/item-fields";
import { MoveError, moveItem } from "../services/day/move-item";
import { setItemDone } from "../services/day/set-done";
import { resolveTodayFor } from "../services/day/today";
import { protectedProcedure, router } from "../trpc";

// [COPY — needs Vesper sign-off: v1.1 §6.5's line, reused for every refusal
// of a pin or a fixture.]
const FIXED_MESSAGE = "Fixed things don't move by drag.";

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

  /* -------------------------------------------------- UX v1.1 (DYN-6) -- */

  /**
   * *Do now* — §6.3 (1). Moves the item to now, starts it, slides what
   * follows by the minimum. When the slide would push something into a pin
   * or past the anchor, nothing is written and `overflow` names it; the
   * sheet offers *Do now anyway* (`anyway: true`) or *Adjust instead*.
   */
  doNow: protectedProcedure
    .input(doNowInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await doNow(ctx.rls, ctx.authContext.userId, input, {
          todayKey: today.todayKey,
          now: new Date(),
        });
      } catch (error) {
        if (error instanceof DoNowError) {
          switch (error.code) {
            case "not_found":
              throw new TRPCError({ code: "NOT_FOUND", message: "No such item.", cause: error });
            case "fixed":
              throw new TRPCError({ code: "BAD_REQUEST", message: FIXED_MESSAGE, cause: error });
            case "closed":
              throw new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
            case "unconfirmed":
              // [COPY — needs Vesper sign-off.]
              throw new TRPCError({ code: "CONFLICT", message: "Set the day first.", cause: error });
          }
        }
        throw asNotFound(error);
      }
    }),

  /** *Edit today's* — §6.4. Changes the day, not the habit; no clamp (R21). */
  editToday: protectedProcedure
    .input(habitDayEditInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await editHabitDay(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        if (error instanceof EditHabitDayError) {
          switch (error.code) {
            case "not_found":
              throw new TRPCError({ code: "NOT_FOUND", message: "No such item.", cause: error });
            case "fixture":
              throw new TRPCError({ code: "BAD_REQUEST", message: FIXED_MESSAGE, cause: error });
            case "travel":
              throw new TRPCError({
                code: "BAD_REQUEST",
                // [COPY — needs Vesper sign-off: UX v1.2 §3.7, the travel row is the workout's.]
                message: "The travel goes with the workout; edit that.",
                cause: error,
              });
            case "done":
              throw new TRPCError({
                code: "BAD_REQUEST",
                // [COPY — needs Vesper sign-off.]
                message: "That one has happened; its length and time are the record.",
                cause: error,
              });
            case "unknown_version":
              throw new TRPCError({
                code: "BAD_REQUEST",
                // [COPY — needs Vesper sign-off: UX v1.2 §3.5.]
                message: "That version is not on this habit.",
                cause: error,
              });
            case "closed":
              throw new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
          }
        }
        throw asNotFound(error);
      }
    }),

  /** *One of*, after the pick — §6.3 (3). The row takes the other member; prep re-flows. */
  chooseAlternate: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await chooseAlternate(ctx.rls, ctx.authContext.userId, { itemId: input.id });
      } catch (error) {
        if (error instanceof ChooseAlternateError) {
          switch (error.code) {
            case "not_found":
              throw new TRPCError({ code: "NOT_FOUND", message: "No such item.", cause: error });
            case "not_alternate":
              // [COPY — needs Vesper sign-off.]
              throw new TRPCError({ code: "BAD_REQUEST", message: "That one has no other.", cause: error });
            case "done":
              throw new TRPCError({
                code: "BAD_REQUEST",
                // [COPY — needs Vesper sign-off.]
                message: "That one has happened; its length and time are the record.",
                cause: error,
              });
            case "closed":
              throw new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
          }
        }
        throw asNotFound(error);
      }
    }),

  /** The Schedule's item drag — §6.5. Snaps to five; the displaced re-stack. */
  move: protectedProcedure
    .input(moveItemInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await moveItem(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asMoveError(error);
      }
    }),
});

export function asMoveError(error: unknown): TRPCError {
  if (error instanceof MoveError) {
    switch (error.code) {
      case "not_found":
        return new TRPCError({ code: "NOT_FOUND", message: "No such item.", cause: error });
      case "fixed":
        return new TRPCError({ code: "BAD_REQUEST", message: FIXED_MESSAGE, cause: error });
      case "done":
        return new TRPCError({
          code: "BAD_REQUEST",
          // [COPY — needs Vesper sign-off.]
          message: "That one has happened; it stays where it was done.",
          cause: error,
        });
      case "closed":
        return new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
      case "past_close":
        return new TRPCError({
          code: "BAD_REQUEST",
          // [COPY — needs Vesper sign-off.]
          message: "That is past the end of the day.",
          cause: error,
        });
    }
  }
  return asNotFound(error);
}

function asNotFound(error: unknown): TRPCError {
  if (error instanceof Error && /no such (item|day)/.test(error.message)) {
    return new TRPCError({ code: "NOT_FOUND", message: "No such item." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
