import { TRPCError } from "@trpc/server";

import { addDays } from "@syn/utils";
import {
  applyTrimInput,
  confirmDayInput,
  getDayInput,
  moveBlockInput,
  previewFitInput,
  quickPickInput,
  setWakeTimeInput,
} from "@syn/validators";

import { applyTrim, previewTrim } from "../services/day/apply-trim";
import { backfillBlocks } from "../services/day/backfill-blocks";
import { ConfirmRuleError, confirmDay } from "../services/day/confirm-day";
import { getDay } from "../services/day/get-day";
import { setWakeTime } from "../services/day/item-fields";
import { moveBlock } from "../services/day/move-item";
import { previewFit } from "../services/day/preview-fit";
import { getQuickPick } from "../services/day/quick-pick";
import { resolveTodayFor } from "../services/day/today";
import { protectedProcedure, router } from "../trpc";
import { asMoveError } from "./item";

/** The two refusals *Set the day* makes, as sentences (UX v1.1 §3.7, R25). */
function confirmError(error: ConfirmRuleError): TRPCError {
  switch (error.code) {
    case "closed":
      return new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
    case "workout_unplaced":
      return new TRPCError({
        code: "BAD_REQUEST",
        // [COPY — needs Vesper sign-off: v1.1 §5.3's primary label, as a refusal.]
        message: `Choose a time for ${error.subject ?? "the workout"}.`,
        cause: error,
      });
    case "trade_day_set":
      return new TRPCError({
        code: "CONFLICT",
        // [COPY — needs Vesper sign-off.]
        message: `${error.subject ?? "That day"} is already set.`,
        cause: error,
      });
    case "no_such_habit":
      return new TRPCError({ code: "NOT_FOUND", message: "No such habit.", cause: error });
  }
}

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

  /* -------------------------------------------------- UX v1.1 (DYN-5) -- */

  /** The quick-pick's sections, each already answered with today's default. */
  quickPick: protectedProcedure
    .input(quickPickInput)
    .query(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      return getQuickPick(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: today.todayKey,
        timeZone: today.timeZone,
        dayCloseTime: today.dayCloseTime,
        now: new Date(),
      });
    }),

  /**
   * *Set the day* — the moment the record begins (R23). Idempotent: a day
   * already set returns itself. Refuses only a closed day, an unplaced
   * workout, and a trade with a day already set.
   */
  confirm: protectedProcedure
    .input(confirmDayInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await confirmDay(ctx.rls, ctx.authContext.userId, input, {
          todayKey: today.todayKey,
          timeZone: today.timeZone,
          dayCloseTime: today.dayCloseTime,
          now: new Date(),
        });
      } catch (error) {
        if (error instanceof ConfirmRuleError) throw confirmError(error);
        if (error instanceof Error && error.message === "no such template") {
          throw new TRPCError({ code: "NOT_FOUND", message: "No such template." });
        }
        throw error;
      }
    }),

  /**
   * The one-time move of v1.0 days into blocks (TD-2). Idempotent; run once
   * per tier after `0005` — see `docs/developer-guides/migrations.md`.
   */
  backfillBlocks: protectedProcedure.mutation(async ({ ctx }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return backfillBlocks(ctx.rls, ctx.authContext.userId, today.todayKey);
  }),

  /* -------------------------------------------------- UX v1.1 (DYN-6) -- */

  /** The Schedule's band drag — §6.5. Every movable item and the band, by the same minutes. */
  moveBlock: protectedProcedure
    .input(moveBlockInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await moveBlock(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asMoveError(error);
      }
    }),

  /** *Shorten to fit* — §5.3. `fitToBudget` against the day's budget; writes nothing. */
  previewFit: protectedProcedure
    .input(previewFitInput)
    .query(async ({ ctx, input }) => previewFit(ctx.rls, ctx.authContext.userId, input)),

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
