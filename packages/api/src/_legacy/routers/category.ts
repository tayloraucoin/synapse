import { TRPCError } from "@trpc/server";

import {
  CATEGORY_NAME_TAKEN,
  categoryIdInput,
  createCategoryInput,
  updateCategoryInput,
} from "@syn/validators";

import { listHabits } from "../services/library/list-habits";
import {
  CategoryNameTakenError,
  createCategory,
  deleteCategory,
  updateCategory,
} from "../services/library/save-category";
import { protectedProcedure, router } from "../trpc";

/**
 * Categories — CT-01 and CT-02.
 *
 * A duplicate name is `CONFLICT` carrying the document's own sentence, so the
 * sheet can put it under the field without translating a code into copy. The
 * sheet also pre-checks against the list it has loaded; the server check is
 * what holds under a race, and both say the same words.
 */

function asConflict(error: unknown): never {
  if (error instanceof CategoryNameTakenError) {
    throw new TRPCError({ code: "CONFLICT", message: CATEGORY_NAME_TAKEN });
  }
  throw error;
}

export const categoryRouter = router({
  /**
   * The list, with each category's habit count for CT-01's *{n} habits*.
   * It reuses `listHabits` because the count is a fact about habits, and a
   * second query that grouped them separately could disagree with the library.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const { categories } = await listHabits(ctx.rls, ctx.authContext.userId);
    return categories;
  }),

  create: protectedProcedure
    .input(createCategoryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await createCategory(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        asConflict(error);
      }
    }),

  update: protectedProcedure
    .input(updateCategoryInput)
    .mutation(async ({ ctx, input }) => {
      try {
        const saved = await updateCategory(
          ctx.rls,
          ctx.authContext.userId,
          input,
        );
        if (!saved) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "No such category.",
          });
        }
        return saved;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        asConflict(error);
      }
    }),

  /**
   * One of the four things the product deletes (cross-cutting §8.4). Safe
   * because a category carries no mechanic: the FK unassigns the habits and
   * nothing about a day changes.
   */
  delete: protectedProcedure
    .input(categoryIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await deleteCategory(
        ctx.rls,
        ctx.authContext.userId,
        input.id,
      );
      if (!ok) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such category." });
      }
      return { deleted: true };
    }),
});
