import { TRPCError } from "@trpc/server";

import { addDays } from "@syn/utils";
import {
  addFromLibraryInput,
  applyWorkTypeInput,
  confirmDayInput,
  getDayInput,
  moveBlockInput,
  orientInput,
  previewFitInput,
  quickPickInput,
  removeWorkTypeInput,
  saveMorningInput,
  setWakeTimeInput,
} from "@syn/validators";

import { AddFromLibraryError, addFromLibrary } from "../services/day/add-from-library";
import { WorkTypeError, applyWorkType, removeWorkType } from "../services/day/apply-work-type";
import { ConfirmRuleError, confirmDay } from "../services/day/confirm-day";
import { getDay } from "../services/day/get-day";
import { setWakeTime } from "../services/day/item-fields";
import { readDay } from "../services/day/materialize-day";
import { moveBlock } from "../services/day/move-item";
import { readOrient, saveMorning } from "../services/day/orient";
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

/** *Working today*'s refusals, as sentences (UX v1.2 §3.9, TD-19). [COPY — needs Vesper sign-off] */
function workTypeError(error: WorkTypeError): TRPCError {
  switch (error.code) {
    case "closed":
      return new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
    case "past":
      return new TRPCError({ code: "CONFLICT", message: "That day has been.", cause: error });
    case "already_working":
      return new TRPCError({ code: "CONFLICT", message: "That day already has work.", cause: error });
    case "not_working":
      return new TRPCError({ code: "CONFLICT", message: "That day has no work to remove.", cause: error });
    case "no_such_template":
      return new TRPCError({ code: "NOT_FOUND", message: "No such work-day type.", cause: error });
    case "not_work_type":
      return new TRPCError({ code: "BAD_REQUEST", message: "That is not a work-day type.", cause: error });
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
  /**
   * Which day today is, and its waking state — `wokeAt`, `closedAt`,
   * `confirmedAt` — so the entry tree can put the orient frame first (v1.1
   * §5.1, DYN-13) without a second read.
   */
  today: protectedProcedure.query(async ({ ctx }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    const day = await ctx.rls.execute((tx) => readDay(tx, ctx.authContext.userId, today.todayKey));
    return {
      todayKey: today.todayKey,
      wokeAt: day?.wokeAt ?? null,
      closedAt: day?.closedAt ?? null,
      confirmedAt: day?.confirmedAt ?? null,
    };
  }),

  /* ------------------------------------------------- UX v1.1 (DYN-13) -- */

  /** The orient frame's words; opening stamps the wake once (R11). */
  orient: protectedProcedure.input(orientInput).query(async ({ ctx, input }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return readOrient(ctx.rls, ctx.authContext.userId, input?.date ?? today.todayKey, new Date());
  }),

  /**
   * The frame's optional lines, autosaved — and, with `andSetDay`, *Set from
   * the plan* (UX v1.2 R37, TD-17): the day is set through `confirmDay` with
   * the pick's own defaults, or the response says which question is open.
   */
  saveMorning: protectedProcedure
    .input(saveMorningInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await saveMorning(ctx.rls, ctx.authContext.userId, input, {
          todayKey: today.todayKey,
          timeZone: today.timeZone,
          dayCloseTime: today.dayCloseTime,
          now: new Date(),
        });
      } catch (error) {
        if (error instanceof ConfirmRuleError) throw confirmError(error);
        throw error;
      }
    }),

  /* -------------------------------------------------- UX v1.2 (RUN-6) -- */

  /** *Working today* — a work-day type onto a day that has none (§3.9, R40, TD-19). */
  applyWorkType: protectedProcedure
    .input(applyWorkTypeInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await applyWorkType(ctx.rls, ctx.authContext.userId, input, {
          todayKey: today.todayKey,
        });
      } catch (error) {
        if (error instanceof WorkTypeError) throw workTypeError(error);
        throw error;
      }
    }),

  /** The reverse: the work block *not today*, its items parked, the day's own work anchors cleared. */
  removeWorkType: protectedProcedure
    .input(removeWorkTypeInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await removeWorkType(ctx.rls, ctx.authContext.userId, input, {
          todayKey: today.todayKey,
        });
      } catch (error) {
        if (error instanceof WorkTypeError) throw workTypeError(error);
        throw error;
      }
    }),

  /* ------------------------------------------------- UX v1.1 (DYN-15) -- */

  /** *Add from the library* — a habit-day item into the block the person picked (§6.2). */
  addFromLibrary: protectedProcedure
    .input(addFromLibraryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await addFromLibrary(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        if (error instanceof AddFromLibraryError) {
          switch (error.code) {
            case "no_such_habit":
              throw new TRPCError({ code: "NOT_FOUND", message: "No such habit.", cause: error });
            case "no_such_block":
              // [COPY — needs Vesper sign-off.]
              throw new TRPCError({ code: "NOT_FOUND", message: "That block isn't on this day.", cause: error });
            case "closed":
              throw new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
          }
        }
        throw error;
      }
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
});
