import { TRPCError } from "@trpc/server";

import {
  applyChangesInput,
  applyTemplateInput,
  changeAnchorInput,
  copyWeekInput,
  dayDateInput,
  oneOffFormSchema,
  removeOneOffInput,
  restorePayloadInput,
  weekInput,
} from "@syn/validators";

import {
  appliedDaysFor,
  applyTemplateChanges,
} from "../services/day/apply-template-changes";
import { copyLastWeek } from "../services/day/copy-week";
import { getDay } from "../services/day/get-day";
import { materializeDay } from "../services/day/materialize-day";
import {
  OneOffSameStartError,
  countKeptOnRemove,
  readDayTemplateId,
  removeOneOff,
  removeTemplateFromDay,
  restoreOneOff,
  saveOneOff,
} from "../services/day/one-off";
import { resolveTodayFor } from "../services/day/today";
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

  /** Applying is immediate: the day's items exist the moment this returns. */
  applyTemplate: protectedProcedure
    .input(applyTemplateInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await materializeDay(ctx.rls, ctx.authContext.userId, {
          date: input.date,
          templateId: input.templateId,
          anchorTime: input.anchorTime,
        });
      } catch (error) {
        throw asNotFound(error);
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
    .mutation(async ({ ctx, input }) => {
      // Keep whichever template the day already has; only the start moves.
      const templateId = await readDayTemplateId(
        ctx.rls,
        ctx.authContext.userId,
        input.date,
      );
      return materializeDay(ctx.rls, ctx.authContext.userId, {
        date: input.date,
        templateId,
        anchorTime: input.anchorTime,
        recomputeTouchedTimes: true,
      });
    }),

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
