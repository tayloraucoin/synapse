import { TRPCError } from "@trpc/server";

import { itemIdInput } from "@syn/validators";

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
});

function asNotFound(error: unknown): TRPCError {
  if (error instanceof Error && error.message === "no such item") {
    return new TRPCError({ code: "NOT_FOUND", message: "No such item." });
  }
  return error instanceof TRPCError
    ? error
    : new TRPCError({ code: "INTERNAL_SERVER_ERROR", cause: error });
}
