import { TRPCError } from "@trpc/server";

import {
  reviewDayInput,
  reviewHistoryInput,
  reviewWeekInput,
} from "@syn/validators";

import { resolveTodayFor } from "../services/day/today";
import { getReviewDay } from "../services/review/get-review-day";
import { getReviewHistory } from "../services/review/get-review-history";
import { getReviewWeek } from "../services/review/get-review-week";
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
      );
    }),

  history: protectedProcedure
    .input(reviewHistoryInput)
    .query(async ({ ctx, input }) =>
      getReviewHistory(ctx.rls, ctx.authContext.userId, input),
    ),
});

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
