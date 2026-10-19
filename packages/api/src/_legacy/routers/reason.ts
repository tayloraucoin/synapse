import { TRPCError } from "@trpc/server";

import {
  reasonArchiveInput,
  reasonFormSchema,
  reasonUpdateInput,
} from "@syn/validators";

import { listReasons } from "../services/library/list-reasons";
import {
  DuplicateReasonError,
  StructuralReasonError,
  archiveReason,
  createReason,
  keepReason,
  updateReason,
} from "../services/library/save-reason";
import { protectedProcedure, router } from "../trpc";

/**
 * ST-06's reason set.
 *
 * `list` seeds on first read, so every consumer — this screen, REV-2's
 * chooser, USE-6's shift — gets a set without any of them having to know
 * whether they are the first to ask.
 */
export const reasonRouter = router({
  list: protectedProcedure.query(async ({ ctx }) =>
    listReasons(ctx.rls, ctx.authContext.userId),
  ),

  create: protectedProcedure
    .input(reasonFormSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        return await createReason(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  update: protectedProcedure
    .input(reasonUpdateInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await updateReason(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  /** Archive or restore — one procedure, because it is one switch. */
  archive: protectedProcedure
    .input(reasonArchiveInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await archiveReason(
          ctx.rls,
          ctx.authContext.userId,
          input.key,
          input.archived,
        );
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  /**
   * REV-2's *Keep this reason*. Provided here because the reason set is this
   * ticket's, and a review that wrote reasons itself would be a second author
   * of the same rows.
   */
  keep: protectedProcedure
    .input(reasonFormSchema)
    .mutation(async ({ ctx, input }) =>
      keepReason(ctx.rls, ctx.authContext.userId, input),
    ),
});

function asTrpcError(error: unknown): TRPCError {
  if (error instanceof DuplicateReasonError) {
    return new TRPCError({
      code: "CONFLICT",
      message: "You already have this reason.",
    });
  }
  if (error instanceof StructuralReasonError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message: "This one's tier can't change.",
    });
  }
  if (error instanceof Error && error.message === "no such reason") {
    return new TRPCError({ code: "NOT_FOUND", message: "No such reason." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
