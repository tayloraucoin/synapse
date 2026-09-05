import { TRPCError } from "@trpc/server";

import {
  createFromStarterSetInput,
  createHabitInput,
  habitIdInput,
  listHabitsInput,
  slotsOutsideRangeInput,
  updateHabitInput,
} from "@syn/validators";

import {
  archiveHabit,
  duplicateHabit,
  restoreHabit,
} from "../services/library/archive-habit";
import { getHabit } from "../services/library/get-habit";
import {
  countSlotsOutsideRange,
  countTemplatesUsing,
  readHabitUsage,
} from "../services/library/habit-usage";
import { listHabits } from "../services/library/list-habits";
import { createHabit, updateHabit } from "../services/library/save-habit";
import { createFromStarterSet } from "../services/library/starter-set";
import { readPreferences } from "../services/user/preferences";
import { protectedProcedure, router } from "../trpc";

/**
 * The habit library.
 *
 * ANOTHER PERSON'S ID IS `NOT_FOUND`, NEVER `FORBIDDEN`
 * (`trpc-foundation-patterns.md`): a probe must not be able to learn that
 * something exists. RLS already makes the row unreachable; the code the
 * resolver returns is what stops the response from saying so.
 *
 * There is no `habit.delete`. Archiving is the only exit (official spec §3.3).
 */
export const habitRouter = router({
  list: protectedProcedure
    .input(listHabitsInput)
    .query(async ({ ctx, input }) =>
      listHabits(ctx.rls, ctx.authContext.userId, {
        includeArchived: input?.includeArchived ?? true,
      }),
    ),

  get: protectedProcedure.input(habitIdInput).query(async ({ ctx, input }) => {
    const habit = await getHabit(ctx.rls, ctx.authContext.userId, input.id);
    if (!habit) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
    }
    return habit;
  }),

  create: protectedProcedure
    .input(createHabitInput)
    .mutation(async ({ ctx, input }) =>
      createHabit(ctx.rls, ctx.authContext.userId, input),
    ),

  update: protectedProcedure
    .input(updateHabitInput)
    .mutation(async ({ ctx, input }) => {
      // The re-snapshot predicate needs the person's zone to know which days
      // are still ahead of them.
      const prefs = await readPreferences(ctx.rls, ctx.authContext.userId);
      const saved = await updateHabit(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
        input.habit,
        prefs?.timezone ?? "UTC",
      );
      if (!saved) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
      }
      return saved;
    }),

  archive: protectedProcedure
    .input(habitIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archiveHabit(ctx.rls, ctx.authContext.userId, input.id);
      if (!ok) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
      }
      return { archived: true };
    }),

  restore: protectedProcedure
    .input(habitIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await restoreHabit(ctx.rls, ctx.authContext.userId, input.id);
      if (!ok) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
      }
      return { restored: true };
    }),

  duplicate: protectedProcedure
    .input(habitIdInput)
    .mutation(async ({ ctx, input }) => {
      const copy = await duplicateHabit(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!copy) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
      }
      return copy;
    }),

  /** LB-03's two sections. */
  usage: protectedProcedure
    .input(habitIdInput)
    .query(async ({ ctx, input }) => {
      const usage = await readHabitUsage(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!usage) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
      }
      return usage;
    }),

  /** The archive dialog's "It's in {n} templates" line. */
  templateCount: protectedProcedure
    .input(habitIdInput)
    .query(async ({ ctx, input }) =>
      countTemplatesUsing(ctx.rls, ctx.authContext.userId, input.id),
    ),

  /** LB-02's warning before saving a narrowed range. Zero until SET-5. */
  slotsOutsideRange: protectedProcedure
    .input(slotsOutsideRangeInput)
    .query(async ({ ctx, input }) =>
      countSlotsOutsideRange(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
        input.min,
        input.max,
      ),
    ),

  createFromStarterSet: protectedProcedure
    .input(createFromStarterSetInput)
    .mutation(async ({ ctx, input }) =>
      createFromStarterSet(ctx.rls, ctx.authContext.userId, input.titles),
    ),
});
