import { TRPCError } from "@trpc/server";

import {
  shiftApplyInput,
  shiftIdInput,
  shiftPreviewInput,
} from "@syn/validators";

import { applyShift } from "../services/day/apply-shift";
import { DayChangedError, previewShift } from "../services/day/shift-fit";
import {
  UndoRefusedError,
  shiftUndoEligibility,
  undoShift,
} from "../services/day/undo-shift";
import { protectedProcedure, router } from "../trpc";

/**
 * SF-01's four procedures — official spec §5.6.
 *
 * `preview` IS A QUERY AND `commit` RECOMPUTES. The preview is advisory: it
 * tells the sheet what would happen, and the write decides what does. Trusting
 * the preview's numbers at write time would let a day that changed in between
 * be shifted according to a plan nobody is looking at any more.
 *
 * **THE WRITE IS `commit`, NOT `apply`.** tRPC reserves `apply` — a router is
 * an object, and `apply` is `Function.prototype.apply` — and rejects it at
 * router construction, which the type-check does not see and the build does.
 * The ticket names `shift.apply`; the deviation is logged. `commit` reads
 * correctly beside `preview` anyway: preview, then commit.
 */
export const shiftRouter = router({
  /** What a shift of this size would do. Writes nothing. */
  preview: protectedProcedure
    .input(shiftPreviewInput)
    .query(async ({ ctx, input }) => {
      const preview = await previewShift(ctx.rls, ctx.authContext.userId, input);
      if (preview === null) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No such day." });
      }
      return preview;
    }),

  commit: protectedProcedure
    .input(shiftApplyInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await applyShift(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),

  /**
   * Whether SC-02 shows *Undo this shift*, and why not when it does not.
   *
   * The reason is returned rather than a bare boolean because the three
   * refusals are not the same thing — expired is a clock, a later shift is a
   * record, and *done anyway* is a person having done the work.
   */
  canUndo: protectedProcedure
    .input(shiftIdInput)
    .query(async ({ ctx, input }) => {
      const eligibility = await shiftUndoEligibility(
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
        return await undoShift(ctx.rls, ctx.authContext.userId, input.shiftId);
      } catch (error) {
        throw asTrpcError(error);
      }
    }),
});

function asTrpcError(error: unknown): TRPCError {
  if (error instanceof DayChangedError) {
    return new TRPCError({
      code: "CONFLICT",
      // The sheet re-previews on this rather than showing it; the text is for
      // a log, not a screen.
      message: "The day changed while the sheet was open.",
    });
  }
  if (error instanceof UndoRefusedError) {
    return new TRPCError({ code: "CONFLICT", message: error.reason });
  }
  if (error instanceof Error && /no such (day|shift)/.test(error.message)) {
    return new TRPCError({ code: "NOT_FOUND", message: "No such day." });
  }
  if (error instanceof Error && /day is closed/.test(error.message)) {
    return new TRPCError({ code: "BAD_REQUEST", message: "That day is closed." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
