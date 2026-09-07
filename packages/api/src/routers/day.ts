import { TRPCError } from "@trpc/server";

import { addDays } from "@syn/utils";
import { applyTrimInput, getDayInput, setWakeTimeInput } from "@syn/validators";

import { applyTrim, previewTrim } from "../services/day/apply-trim";
import { getDay } from "../services/day/get-day";
import { setWakeTime } from "../services/day/item-fields";
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

  /**
   * DH-02 — when the day really started.
   *
   * A hand-set wake time outranks the anchor habit: `woke_at_source = manual`
   * is what stops un-ticking a checkbox from erasing a time somebody typed.
   */
  setWakeTime: protectedProcedure
    .input(setWakeTimeInput)
    .mutation(async ({ ctx, input }) =>
      setWakeTime(ctx.rls, ctx.authContext.userId, input),
    ),

  /* ------------------------------------------------------------- TR-01 -- */

  /**
   * What a capacity would set aside. Writes nothing.
   *
   * TR-01 itself previews CLIENT-SIDE, over the day it already has, so typing a
   * number does not cost a round trip per keystroke. This exists because the
   * rule must be reachable from the future mobile client too, and because a
   * second implementation of the trim order is the one thing that would make
   * the sheet and the write disagree.
   */
  previewTrim: protectedProcedure
    .input(applyTrimInput)
    .query(async ({ ctx, input }) => {
      const result = await previewTrim(ctx.rls, ctx.authContext.userId, input);
      if (result === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such day." });
      }
      return result;
    }),

  /** Sets `capacity_min`, trims what no longer fits, returns what came back. */
  applyTrim: protectedProcedure
    .input(applyTrimInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await applyTrim(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        if (error instanceof Error && /no such day/.test(error.message)) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No such day." });
        }
        if (error instanceof Error && /day is closed/.test(error.message)) {
          throw new TRPCError({
            code: "CONFLICT",
            message: "That day is closed.",
          });
        }
        throw error;
      }
    }),
});
