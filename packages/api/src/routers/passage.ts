import { TRPCError } from "@trpc/server";

import {
  passageFormSchema,
  passageIdInput,
  reorderPassagesInput,
} from "@syn/validators";

import {
  PassageRuleError,
  archivePassage,
  listPassages,
  reorderPassages,
  savePassage,
} from "../services/library/passages";
import { protectedProcedure, router } from "../trpc";

/**
 * Passages — UX v1.2 §3.12, §4.6. Owner-private CRUD; another person's id
 * is `NOT_FOUND`, never `FORBIDDEN`. A foreign image path or a reorder that
 * leaves a hole is a `BAD_REQUEST` with the rule's name.
 */
const NOT_FOUND = { code: "NOT_FOUND" as const, message: "No such passage." };

function rethrow(error: unknown): never {
  if (error instanceof PassageRuleError) {
    throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
  }
  throw error;
}

export const passageRouter = router({
  list: protectedProcedure.query(async ({ ctx }) =>
    listPassages(ctx.rls, ctx.authContext.userId),
  ),

  save: protectedProcedure
    .input(passageFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const saved = await savePassage(ctx.rls, ctx.authContext.userId, input);
        if (!saved) throw new TRPCError(NOT_FOUND);
        return saved;
      } catch (error) {
        rethrow(error);
      }
    }),

  archive: protectedProcedure
    .input(passageIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archivePassage(ctx.rls, ctx.authContext.userId, input.id, true);
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { archived: true };
    }),

  restore: protectedProcedure
    .input(passageIdInput)
    .mutation(async ({ ctx, input }) => {
      const ok = await archivePassage(ctx.rls, ctx.authContext.userId, input.id, false);
      if (!ok) throw new TRPCError(NOT_FOUND);
      return { restored: true };
    }),

  reorder: protectedProcedure
    .input(reorderPassagesInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await reorderPassages(ctx.rls, ctx.authContext.userId, input.ids);
      } catch (error) {
        rethrow(error);
      }
    }),
});
