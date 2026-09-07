import { TRPCError } from "@trpc/server";

import {
  decideInput,
  habitWeekInput,
  reviewDayInput,
  reviewHistoryInput,
  reviewWeekInput,
  saveChangesInput,
} from "@syn/validators";

import { resolveTodayFor } from "../services/day/today";
import { decide } from "../services/review/decide";
import {
  UndecidedItemsError,
  finishReview,
} from "../services/review/finish-review";
import { getReviewDay } from "../services/review/get-review-day";
import { getReviewHistory } from "../services/review/get-review-history";
import { getHabitWeek } from "../services/review/habit-week";
import { getReviewWeek } from "../services/review/get-review-week";
import { pendingDays } from "../services/review/pending-days";
import { saveReviewChanges } from "../services/review/save-changes";
import { protectedProcedure, router } from "../trpc";

/**
 * The three review reads. READ-ONLY in this slice — REV-2 adds the writes.
 *
 * Every number they return was computed from rows at the moment of the call.
 * Nothing about adherence is stored anywhere (official spec §3.11), so there is
 * no cache to invalidate and no way for the number to be stale.
 */
export const reviewRouter = router({
  day: protectedProcedure
    .input(reviewDayInput)
    .query(async ({ ctx, input }) => {
      const today = await requireToday(ctx);
      return getReviewDay(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        now: new Date(),
      });
    }),

  week: protectedProcedure
    .input(reviewWeekInput)
    .query(async ({ ctx, input }) => {
      const today = await requireToday(ctx);
      return getReviewWeek(
        ctx.rls,
        ctx.authContext.userId,
        input.week,
        today.todayKey,
        today.timeZone,
      );
    }),

  /** WR-02 — one habit's week and its four-week fact. */
  habitWeek: protectedProcedure
    .input(habitWeekInput)
    .query(async ({ ctx, input }) => {
      const view = await getHabitWeek(
        ctx.rls,
        ctx.authContext.userId,
        input.week,
        input.habitId,
      );
      if (view === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "That habit was not assigned this week.",
        });
      }
      return view;
    }),

  history: protectedProcedure
    .input(reviewHistoryInput)
    .query(async ({ ctx, input }) =>
      getReviewHistory(ctx.rls, ctx.authContext.userId, input),
    ),

  /** RV-00's middle region, and the same count the shell's dot reads. */
  pendingDays: protectedProcedure.query(async ({ ctx }) => {
    const today = await requireToday(ctx);
    return pendingDays(ctx.rls, ctx.authContext.userId, today.todayKey);
  }),

  /**
   * One decision, written as it is made. A carry writes `carried` at once;
   * only tomorrow's row waits for finish.
   */
  decide: protectedProcedure
    .input(decideInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await decide(
          ctx.rls,
          ctx.authContext.userId,
          input.itemId,
          input.decision,
        );
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  /**
   * *Finish review* — closes the day, ends a running timer, carries what was
   * carried, and stamps `reviewed_at`. Returns the whole view so DR-07 needs
   * no second fetch.
   */
  finish: protectedProcedure
    .input(reviewDayInput)
    .mutation(async ({ ctx, input }) => {
      const today = await requireToday(ctx);
      try {
        await finishReview(ctx.rls, ctx.authContext.userId, input.date, {
          timeZone: today.timeZone,
          dayCloseTime: today.dayCloseTime,
          now: new Date(),
        });
      } catch (error) {
        throw asTrpcError(error);
      }

      return getReviewDay(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        now: new Date(),
      });
    }),

  /**
   * Edit mode's *Save changes* — REV-3.
   *
   * The whole batch in one transaction, stamped once. Returns the recomputed
   * view for the same reason `finish` does: the number is never stored, so the
   * only honest way to show the effect of a change is to read it back.
   */
  saveChanges: protectedProcedure
    .input(saveChangesInput)
    .mutation(async ({ ctx, input }) => {
      const today = await requireToday(ctx);
      try {
        await saveReviewChanges(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }

      return getReviewDay(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        now: new Date(),
      });
    }),
});

function asTrpcError(error: unknown): TRPCError {
  if (error instanceof UndecidedItemsError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      // Not shown: the client disables the button, so reaching this means a
      // race or a malformed call, and the panels are the real explanation.
      message: `${error.count} still to decide.`,
    });
  }
  if (error instanceof Error && /no such (item|day)/.test(error.message)) {
    return new TRPCError({ code: "NOT_FOUND", message: "No such day." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}

async function requireToday(ctx: {
  rls: Parameters<typeof resolveTodayFor>[0];
  authContext: { userId: string };
}) {
  const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
  if (!today) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
  }
  return today;
}
