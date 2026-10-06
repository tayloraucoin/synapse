import { TRPCError } from "@trpc/server";

import { journalGetInput, journalSaveInput } from "@syn/validators";

import {
  JournalRuleError,
  getJournalEntry,
  getLastNight,
  readJournalClose,
  saveJournalAnswer,
} from "../services/day/journal";
import { resolveTodayFor } from "../services/day/today";
import { protectedProcedure, router } from "../trpc";

/**
 * The journal — UX v1.1 §7.2. One key per save; the day's row is merged.
 * `lastNight` is what the orient frame reads (DYN-13).
 */
export const journalRouter = router({
  get: protectedProcedure
    .input(journalGetInput)
    .query(async ({ ctx, input }) =>
      getJournalEntry(ctx.rls, ctx.authContext.userId, input.date),
    ),

  /**
   * The close — UX v1.3 R54, §7.2 (DAY-6): the morning's quote on a
   * quote-day with the bank on; `null` otherwise. Read after the last line.
   */
  close: protectedProcedure
    .input(journalGetInput)
    .query(async ({ ctx, input }) =>
      readJournalClose(ctx.rls, ctx.authContext.userId, input.date),
    ),

  lastNight: protectedProcedure.query(async ({ ctx }) => {
    const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
    if (!today) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
    }
    return getLastNight(ctx.rls, ctx.authContext.userId, today.todayKey);
  }),

  save: protectedProcedure
    .input(journalSaveInput)
    .mutation(async ({ ctx, input }) => {
      const today = await resolveTodayFor(ctx.rls, ctx.authContext.userId);
      if (!today) {
        throw new TRPCError({ code: "NOT_FOUND", message: "No account row." });
      }
      try {
        return await saveJournalAnswer(ctx.rls, ctx.authContext.userId, input, today);
      } catch (error) {
        if (error instanceof JournalRuleError) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error.code,
            cause: error,
          });
        }
        throw error;
      }
    }),
});
