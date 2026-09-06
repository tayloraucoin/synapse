import { TRPCError } from "@trpc/server";

import {
  itemIdInput,
  manualSessionInput,
  restorePayloadInput,
  sessionIdInput,
  updateSessionInput,
} from "@syn/validators";

import {
  SessionOverlapError,
  SessionRangeError,
  addManualSession,
  pauseTimer,
  removeSession,
  restoreSession,
  resumeTimer,
  updateSession,
} from "../services/day/manual-time";
import { startTimer, stopTimer } from "../services/day/timer";
import { resolveTodayFor } from "../services/day/today";
import { protectedProcedure, router } from "../trpc";

/**
 * Start and stop — the only two things a Phase-1 timer does.
 *
 * PAUSE AND RESUME ARE USE-4's, and are absent rather than stubbed: a
 * procedure that exists and does nothing is a contract the client can call and
 * be wrong about.
 *
 * THE CLOCK IS THE SERVER's. A timestamp sent by a client would let a device
 * with a wrong clock write a session that ended before it began, and the
 * `ended_at > started_at` check would reject it after the person had already
 * seen the timer run.
 */
export const timerRouter = router({
  start: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await startTimer(ctx.rls, ctx.authContext.userId, input.id, {
          todayKey: today.todayKey,
          now: new Date(),
        });
      } catch (error) {
        throw asNotFound(error);
      }
    }),

  stop: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) =>
      stopTimer(ctx.rls, ctx.authContext.userId, input.id, new Date()),
    ),

  /**
   * Pause ends the open session and leaves the item `active`; resume opens a
   * new one. The difference between paused and stopped is whether the person
   * is coming back, and the state is what says so.
   */
  pause: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) =>
      pauseTimer(ctx.rls, ctx.authContext.userId, input.id),
    ),

  resume: protectedProcedure
    .input(itemIdInput)
    .mutation(async ({ ctx, input }) =>
      resumeTimer(ctx.rls, ctx.authContext.userId, input.id),
    ),

  /** IT-02 — time added by hand, always available (official spec §5.4). */
  addManual: protectedProcedure
    .input(manualSessionInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await addManualSession(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asSessionError(error);
      }
    }),

  updateSession: protectedProcedure
    .input(updateSessionInput)
    .mutation(async ({ ctx, input }) => {
      try {
        return await updateSession(ctx.rls, ctx.authContext.userId, input);
      } catch (error) {
        throw asSessionError(error);
      }
    }),

  /** Returns the row, so the five-second undo can put it back verbatim. */
  removeSession: protectedProcedure
    .input(sessionIdInput)
    .mutation(async ({ ctx, input }) =>
      removeSession(ctx.rls, ctx.authContext.userId, input.id),
    ),

  restoreSession: protectedProcedure
    .input(restorePayloadInput)
    .mutation(async ({ ctx, input }) =>
      restoreSession(
        ctx.rls,
        ctx.authContext.userId,
        input.payload as Parameters<typeof restoreSession>[2],
      ),
    ),
});

/** The three ways a range can be refused, in the document's own words. */
function asSessionError(error: unknown): TRPCError {
  if (error instanceof SessionOverlapError) {
    return new TRPCError({
      code: "CONFLICT",
      message: "This overlaps another session on this item.",
    });
  }
  if (error instanceof SessionRangeError) {
    return new TRPCError({
      code: "BAD_REQUEST",
      message:
        error.reason === "order"
          ? '"To" should be after "from".'
          : error.reason === "future"
            ? // [COPY — needs Vesper sign-off: the document has no sentence
              // for a session in the future.]
              "That hasn't happened yet."
            : // [COPY — needs Vesper sign-off: nor for one outside the day.]
              "That's outside this day.",
    });
  }
  return asNotFound(error);
}

function asNotFound(error: unknown): TRPCError {
  if (error instanceof Error && error.message === "no such item") {
    return new TRPCError({ code: "NOT_FOUND", message: "No such item." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
