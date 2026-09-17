import { TRPCError } from "@trpc/server";

import {
  applyChangesInput,
  applyPlanInput,
  applyTemplateInput,
  assignBlocksInput,
  changeAnchorInput,
  copyWeekInput,
  dayDateInput,
  defaultPlanInput,
  oneOffFormSchema,
  prefillWeekInput,
  removeOneOffInput,
  restorePayloadInput,
  tradeWorkoutsInput,
  weekInput,
} from "@syn/validators";
import { weekDates, weekKeyOf } from "@syn/utils";

import {
  appliedDaysFor,
  applyTemplateChanges,
} from "../services/day/apply-template-changes";
import { copyLastWeek } from "../services/day/copy-week";
import { getDay } from "../services/day/get-day";
import {
  applyTemplateToDay,
  materializeDay,
  readDayProfile,
} from "../services/day/materialize-day";
import {
  OneOffSameStartError,
  countKeptOnRemove,
  removeOneOff,
  removeTemplateFromDay,
  restoreOneOff,
  saveOneOff,
} from "../services/day/one-off";
import { ApplyPlanRuleError, applyPlan, defaultPlanFor, prefillWeek } from "../services/day/prefill-week";
import { resolveTodayFor } from "../services/day/today";
import { TradeRuleError, tradeWorkouts } from "../services/day/trade-workouts";
import { getWeek } from "../services/day/week-view";
import { mostUsedTemplate } from "../services/plan/most-used-template";
import { protectedProcedure, router } from "../trpc";

/**
 * The week build — WK-01, WK-02, WK-03, and TP-04's apply.
 *
 * Every write here goes through `materializeDay` or `saveOneOff`, so the keep
 * rules live in one place. A resolver that reconciled items itself would be a
 * second set of rules about what may be rewritten, which is the one thing this
 * ticket exists to prevent.
 */
async function today(ctx: {
  rls: Parameters<typeof resolveTodayFor>[0];
  authContext: { userId: string };
}) {
  const resolved = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
  if (!resolved) {
    throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
  }
  return resolved;
}

export const weekRouter = router({
  get: protectedProcedure.input(weekInput).query(async ({ ctx, input }) => {
    const resolved = await today(ctx);
    return getWeek(
      ctx.rls,
      ctx.authContext.userId,
      input.week,
      resolved.todayKey,
    );
  }),

  /**
   * Applying is immediate: the day's items exist the moment this returns.
   * Under v1.1 the template's kind names the block it lands in; the day's
   * other blocks are kept (DYN-5).
   */
  applyTemplate: protectedProcedure
    .input(applyTemplateInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await applyTemplateToDay(ctx.rls, ctx.authContext.userId, {
          date: input.date,
          templateId: input.templateId,
          anchorTime: input.anchorTime,
        });
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  /** The week build's per-day assignment — UX v1.1 §4.13 (DYN-5). */
  assignBlocks: protectedProcedure
    .input(assignBlocksInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await materializeDay(ctx.rls, ctx.authContext.userId, {
          date: input.date,
          blocks: input.blocks,
          shape: input.shape,
          focusHabitId: input.focusHabitId,
        });
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  /**
   * The day sheet's *Plan* row — UX v1.2 §4.15 (RUN-13): one date from one
   * plan, or *Unstructured*. A confirmed day is refused as `already_set`.
   */
  applyPlan: protectedProcedure
    .input(applyPlanInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await applyPlan(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        if (error instanceof ApplyPlanRuleError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
        }
        throw error;
      }
    }),

  /** The first week, and *Plan from your defaults* — UX v1.1 §4.13. */
  prefill: protectedProcedure
    .input(prefillWeekInput)
    .mutation(async ({ ctx, input }) =>
      prefillWeek(ctx.rls, ctx.authContext.userId, input.week),
    ),

  /**
   * What the profile would plan for one date — the day sheet's *Structured*
   * toggle reads it so the day gets the blocks the pre-fill would have given
   * it (DYN-12). Writes nothing.
   */
  defaultPlan: protectedProcedure
    .input(defaultPlanInput)
    .query(async ({ ctx, input }) =>
      ctx.rls.execute(async (tx) => {
        const profile = await readDayProfile(tx, ctx.authContext.userId);
        return defaultPlanFor(
          tx,
          ctx.authContext.userId,
          profile,
          input.date,
          weekDates(weekKeyOf(input.date)),
        );
      }),
    ),

  /**
   * The training swap between two days (v1.1 §4.13, R25): *Trade with
   * Tuesday's pull?* A set day refuses with its weekday in the sentence.
   */
  tradeWorkouts: protectedProcedure
    .input(tradeWorkoutsInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await tradeWorkouts(ctx.rls, ctx.authContext.userId, input.date, input.withDate);
      } catch (error) {
        if (error instanceof TradeRuleError) {
          throw new TRPCError({
            code: "CONFLICT",
            // [COPY — needs Vesper sign-off]
            message:
              error.code === "day_set"
                ? `${error.detail ?? "That day"} is already set.`
                : "Nothing to trade.",
            cause: error,
          });
        }
        throw error;
      }
    }),

  removeTemplate: protectedProcedure
    .input(dayDateInput)
    .mutation(async ({ ctx, input }) =>
      removeTemplateFromDay(ctx.rls, ctx.authContext.userId, input.date),
    ),

  /**
   * WK-02's keep line, asked before the choice rather than reported after it:
   * how many items would stay if this day's template were removed.
   */
  keepCount: protectedProcedure
    .input(dayDateInput)
    .query(async ({ ctx, input }) =>
      countKeptOnRemove(ctx.rls, ctx.authContext.userId, input.date),
    ),

  /**
   * The one path that writes to touched rows, and only their two scheduled
   * time columns — a done item keeps its `done_at` and its snapshots while its
   * place in the day moves with everything else (Epic 1 WK-02).
   */
  changeAnchor: protectedProcedure
    .input(changeAnchorInput)
    .mutation(async ({ ctx, input }) =>
      // Keep whichever blocks the day already has; only the start moves.
      materializeDay(ctx.rls, ctx.authContext.userId, {
        date: input.date,
        blocks: "keep",
        anchorTime: input.anchorTime,
        recomputeTouchedTimes: true,
      }),
    ),

  addOneOff: protectedProcedure
    .input(oneOffFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await saveOneOff(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asConflict(error);
      }
    }),

  updateOneOff: protectedProcedure
    .input(oneOffFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await saveOneOff(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asConflict(error);
      }
    }),

  /**
   * Returns the removed item WITH its sessions and any miss, so the undo toast
   * can put back what was actually there. Those cascade from `day_items`, so
   * they cannot be read after the delete — the service captures them first.
   */
  removeOneOff: protectedProcedure
    .input(removeOneOffInput)
    .mutation(async ({ ctx, input }) => {
      const removed = await removeOneOff(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!removed) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such item." });
      }
      return removed;
    }),

  /** The five-second undo — the same id, so every reference survives it. */
  restoreOneOff: protectedProcedure
    .input(restorePayloadInput)
    .mutation(async ({ ctx, input }) =>
      restoreOneOff(
        ctx.rls,
        ctx.authContext.userId,
        input.payload as Parameters<typeof restoreOneOff>[2],
      ),
    ),

  copyLastWeek: protectedProcedure
    .input(copyWeekInput)
    .mutation(async ({ ctx, input }) =>
      copyLastWeek(
        ctx.rls,
        ctx.authContext.userId,
        input.week,
        input.overwrite,
      ),
    ),

  /** LS-00's third door: the template this person's days usually use. */
  mostUsedTemplate: protectedProcedure.query(async ({ ctx }) => {
    const resolved = await today(ctx);
    return mostUsedTemplate(
      ctx.rls,
      ctx.authContext.userId,
      resolved.todayKey,
    );
  }),

  /** WK-02's *This day* preview — the same read model the List will use. */
  dayPreview: protectedProcedure
    .input(dayDateInput)
    .query(async ({ ctx, input }) => {
      const resolved = await today(ctx);
      return getDay(ctx.rls, ctx.authContext.userId, input.date, {
        todayKey: resolved.todayKey,
        timeZone: resolved.timeZone,
        dayCloseTime: resolved.dayCloseTime,
        now: new Date(),
      });
    }),

  /** TP-04: which days would be affected, and applying to them. */
  appliedDays: protectedProcedure
    .input(applyChangesInput.pick({ templateId: true }))
    .query(async ({ ctx, input }) => {
      const resolved = await today(ctx);
      return appliedDaysFor(
        ctx.rls,
        ctx.authContext.userId,
        input.templateId,
        resolved.todayKey,
      );
    }),

  applyChanges: protectedProcedure
    .input(applyChangesInput)
    .mutation(async ({ ctx, input }) => {
      const resolved = await today(ctx);
      return applyTemplateChanges(
        ctx.rls,
        ctx.authContext.userId,
        input.templateId,
        input.scope,
        resolved.todayKey,
      );
    }),
});

function asNotFound(error: unknown): TRPCError {
  if (error instanceof Error && error.message === "no such template") {
    return new TRPCError({ code: "NOT_FOUND", message: "No such template." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}

function asConflict(error: unknown): TRPCError {
  if (error instanceof OneOffSameStartError) {
    return new TRPCError({
      code: "CONFLICT",
      message: JSON.stringify(error.conflict),
      cause: error,
    });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
