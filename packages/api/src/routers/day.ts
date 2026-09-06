import { TRPCError } from "@trpc/server";

import { addDays } from "@syn/utils";
import { getDayInput } from "@syn/validators";

import { getDay } from "../services/day/get-day";
import { resolveTodayFor } from "../services/day/today";
import { protectedProcedure, router } from "../trpc";

/**
 * The day, read.
 *
 * Both procedures resolve "today" first, which is also what applies a deferred
 * settings change that has come due — so the first thing a person does each
 * day is what switches their zone, with no job required.
 */
export const dayRouter = router({
  today: protectedProcedure.query(async ({ ctx }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return { todayKey: today.todayKey };
  }),

  get: protectedProcedure
    .input(getDayInput)
    .query(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }

      // A year is more than any real plan; beyond it is a bug or a probe.
      if (input.date > addDays(today.todayKey, 366)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "That date is too far ahead.",
        });
      }

      return getDay(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        now: new Date(),
        deviceZone: input.deviceZone ?? null,
      });
    }),
});
