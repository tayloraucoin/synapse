import { TRPCError } from "@trpc/server";

import {
  completeDayPlanInput,
  createDayPlanInput,
  dayPlanIdInput,
  listDayPlansInput,
  updateDayPlanInput,
} from "@syn/validators";

import {
  DayPlanRuleError,
  completeDayPlan,
  createDayPlan,
  deleteDayPlan,
  duplicateDayPlan,
  getDayPlan,
  listDayPlans,
  updateDayPlan,
} from "../services/plan/day-plans";
import { protectedProcedure, router } from "../trpc";

/**
 * Day plans — UX v1.2 §3.13, §4.13 (RUN-5). Owner-private CRUD; another
 * person's id is `NOT_FOUND`, never `FORBIDDEN`. `complete`'s refusals name
 * the missing fact (`needs_days` …) for the builder's one line.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such day plan." };

export const dayPlanRouter = router({
  list: protectedProcedure
    .input(listDayPlansInput)
    .query(async ({ ctx, input }) =>
      listDayPlans(ctx.rls, ctx.authContext.userId, { state: input?.state }),
    ),

  get: protectedProcedure.input(dayPlanIdInput).query(async ({ ctx, input }) => {
    const plan = await getDayPlan(ctx.rls, ctx.authContext.userId, input.id);
    if (!plan) throw new TRPCError(NOT_FOUND);
    return plan;
  }),

  create: protectedProcedure
    .input(createDayPlanInput)
    .mutation(async ({ ctx, input }) =>
      createDayPlan(ctx.rls, ctx.authContext.userId, input ?? {}),
    ),

  update: protectedProcedure
    .input(updateDayPlanInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await updateDayPlan(ctx.rls, ctx.authContext.userId, input.id, input.patch);
        if (!result) throw new TRPCError(NOT_FOUND);
        return result;
      } catch (error) {
        // v1.3 (DAY-5): `wrong_kind` — a list FK of the wrong kind or shape.
        if (error instanceof DayPlanRuleError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
        }
        throw error;
      }
    }),

  complete: protectedProcedure
    .input(completeDayPlanInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const plan = await completeDayPlan(ctx.rls, ctx.authContext.userId, input.id, {
          noWork: input.noWork,
        });
        if (!plan) throw new TRPCError(NOT_FOUND);
        return plan;
      } catch (error) {
        if (error instanceof DayPlanRuleError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
        }
        throw error;
      }
    }),

  duplicate: protectedProcedure
    .input(dayPlanIdInput)
    .mutation(async ({ ctx, input }) => {
      const copy = await duplicateDayPlan(ctx.rls, ctx.authContext.userId, input.id);
      if (!copy) throw new TRPCError(NOT_FOUND);
      return copy;
    }),

  delete: protectedProcedure
    .input(dayPlanIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await deleteDayPlan(ctx.rls, ctx.authContext.userId, input.id);
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { deleted: true };
    }),
});
