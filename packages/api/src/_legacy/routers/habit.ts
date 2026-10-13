import { TRPCError } from "@trpc/server";

import { z } from "zod";

import {
  createFromStarterLibraryInput,
  createHabitInput,
  createStepInput,
  habitIdInput,
  iconValueSchema,
  listHabitsInput,
  patchHabitInput,
  patchWorkoutInput,
  rotationHabitSchema,
  slotsOutsideRangeInput,
  updateHabitInput,
  workoutDetailsSchema,
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
import {
  HabitRuleError,
  RotationRuleError,
  createHabit,
  createRotationHabit,
  createStep,
  patchHabit,
  patchWorkout,
  updateHabit,
  updateRotationHabit,
} from "../services/library/save-habit";
import { createFromStarterLibrary } from "../services/library/starter-library";
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
        blockKind: input?.blockKind,
        types: input?.types,
        order: input?.order,
      }),
    ),

  get: protectedProcedure.input(habitIdInput).query(async ({ ctx, input }) => {
    const habit = await getHabit(ctx.rls, ctx.authContext.userId, input.id);
    if (!habit) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
    }
    return habit;
  }),

  /** A `habit` — the library sheet's only kind (UX v1.1 §4.15, W6). */
  create: protectedProcedure
    .input(createHabitInput)
    .mutation(async ({ ctx, input }) =>
      createHabit(ctx.rls, ctx.authContext.userId, input),
    ),

  /**
   * A workout — the training screen (UX v1.1 §3.7, §4.9; UX v1.2 §4.10 adds
   * its type, where and travel, and lets the card send a glyph).
   */
  createWorkout: protectedProcedure
    .input(
      rotationHabitSchema.and(
        z.object({
          details: workoutDetailsSchema.partial().optional(),
          icon: iconValueSchema.nullable().optional(),
        }),
      ),
    )
    .mutation(async ({ ctx, input }) => {
      const { details, icon, ...rotation } = input;
      return createRotationHabit(ctx.rls, ctx.authContext.userId, "workout", rotation, {
        ...(details ?? {}),
        icon: icon ?? null,
      });
    }),

  /** A step before work — UX v1.2 R33, §4.7: a name, a glyph, a range. */
  createStep: protectedProcedure
    .input(createStepInput)
    .mutation(async ({ ctx, input }) =>
      createStep(ctx.rls, ctx.authContext.userId, input),
    ),

  /** One fact at a time on a habit — UX v1.2 §4.9 (priority, range, versions, name, glyph). */
  patch: protectedProcedure
    .input(patchHabitInput)
    .mutation(async ({ ctx, input }) => {
      const prefs = await readPreferences(ctx.rls, ctx.authContext.userId);
      try {
        const saved = await patchHabit(
          ctx.rls,
          ctx.authContext.userId,
          input.id,
          input.patch,
          prefs?.timezone ?? "UTC",
        );
        if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
        return saved;
      } catch (error) {
        if (error instanceof HabitRuleError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
        }
        throw error;
      }
    }),

  /** One fact at a time on a workout — UX v1.2 §4.10; refused on any other type. */
  patchWorkout: protectedProcedure
    .input(patchWorkoutInput)
    .mutation(async ({ ctx, input }) => {
      const prefs = await readPreferences(ctx.rls, ctx.authContext.userId);
      try {
        const saved = await patchWorkout(
          ctx.rls,
          ctx.authContext.userId,
          input.id,
          input.patch,
          prefs?.timezone ?? "UTC",
        );
        if (!saved) throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
        return saved;
      } catch (error) {
        if (error instanceof HabitRuleError) {
          throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
        }
        throw error;
      }
    }),

  /** A focus — the work screen (UX v1.1 §3.8, §4.11). */
  createFocus: protectedProcedure
    .input(rotationHabitSchema)
    .mutation(async ({ ctx, input }) =>
      createRotationHabit(ctx.rls, ctx.authContext.userId, "deep_work", input),
    ),

  /** The rotation fields; refused on a plain habit (v1.1 §11.3). */
  updateRotation: protectedProcedure
    .input(z.object({ id: z.string().uuid(), habit: rotationHabitSchema }))
    .mutation(async ({ ctx, input }) => {
      try {
        const saved = await updateRotationHabit(
          ctx.rls,
          ctx.authContext.userId,
          input.id,
          input.habit,
        );
        if (!saved) {
          throw new TRPCError({ code: "NOT_FOUND", message: "No such habit." });
        }
        return saved;
      } catch (error) {
        if (error instanceof RotationRuleError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.code,
            cause: error,
          });
        }
        throw error;
      }
    }),

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

  /** The per-block library (UX v1.1 §12.4). */
  createFromStarterLibrary: protectedProcedure
    .input(createFromStarterLibraryInput)
    .mutation(async ({ ctx, input }) =>
      createFromStarterLibrary(ctx.rls, ctx.authContext.userId, input),
    ),
});
