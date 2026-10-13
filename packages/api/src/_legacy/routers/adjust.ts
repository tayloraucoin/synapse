import { TRPCError } from "@trpc/server";

import { adjustApplyInput, adjustPreviewInput, adjustScopeInput, shiftIdInput } from "@syn/validators";

import {
  AdjustError,
  DayChangedError,
  adjustScope,
  adjustUndoEligibility,
  applyAdjust,
  previewAdjust,
  undoAdjust,
} from "../services/day/adjust-day";
import { UndoRefusedError } from "../services/day/undo-eligibility";
import { protectedProcedure, router } from "../trpc";

/**
 * Adjust — UX v1.1 §6.6 (DYN-6). `preview` is a query and `commit`
 * recomputes; the sheet cannot promise a plan the database then declines.
 * `commit`, not `apply`: tRPC reserves `apply` (the `shift` router's line).
 * `scope` is for the sheet's copy — *the morning*, *the evening*.
 */
export const adjustRouter = router({
  scope: protectedProcedure
    .input(adjustScopeInput)
    .query(async ({ ctx, input }) => {
      try {
        return await adjustScope(ctx.rls, ctx.authContext.userId, input.date);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  preview: protectedProcedure
    .input(adjustPreviewInput)
    .query(async ({ ctx, input }) => {
      try {
        return await previewAdjust(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  commit: protectedProcedure
    .input(adjustApplyInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await applyAdjust(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  canUndo: protectedProcedure
    .input(shiftIdInput)
    .query(async ({ ctx, input }) => {
      const eligibility = await adjustUndoEligibility(
        ctx.rls,
        ctx.authContext.userId,
        input.shiftId,
      );
      if (eligibility === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such shift." });
      }
      return eligibility;
    }),

  undo: protectedProcedure
    .input(shiftIdInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await undoAdjust(ctx.rls, ctx.authContext.userId, input.shiftId);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),
});

function asTrpcError(error: unknown): TRPCError {
  if (error instanceof DayChangedError) {
    return new TRPCError({
      code: "CONFLICT",
      message: "The day changed while the sheet was open.",
      cause: error,
    });
  }
  if (error instanceof UndoRefusedError) {
    return new TRPCError({ code: "CONFLICT", message: error.reason, cause: error });
  }
  if (error instanceof AdjustError) {
    switch (error.code) {
      case "no_such_day":
        return new TRPCError({ code: "NOT_FOUND", message: "No such day.", cause: error });
      case "closed":
        return new TRPCError({ code: "CONFLICT", message: "That day is closed.", cause: error });
      case "unconfirmed":
        // [COPY — needs Vesper sign-off.]
        return new TRPCError({ code: "CONFLICT", message: "Set the day first.", cause: error });
      case "no_slide":
        return new TRPCError({
          code: "BAD_REQUEST",
          message: "Only the morning can start work later.",
          cause: error,
        });
      case "no_reason":
        // An archived reason between preview and apply is a stale sheet.
        return new TRPCError({ code: "CONFLICT", message: "That reason is gone.", cause: error });
    }
  }
  if (error instanceof Error && /no such (day|shift)/.test(error.message)) {
    return new TRPCError({ code: "NOT_FOUND", message: "No such day.", cause: error });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
