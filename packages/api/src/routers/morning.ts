import { dateKeyInput, morningLinesInput } from "@syn/validators";
import {
  morningStore,
  readMorningDay,
  readReading,
  writeMorningLines,
} from "../services/morning/morning";
import { protectedProcedure, router } from "../trpc";

/**
 * Orient's morning (USE-96): the reading on its own, so it alone can wait
 * or fail (D-USE-63); the date's lines with last night; the lines' autosave.
 */
export const morningRouter = router({
  reading: protectedProcedure
    .input(dateKeyInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readReading(morningStore(tx, ctx.authContext.userId), input.dateKey),
      ),
    ),

  day: protectedProcedure
    .input(dateKeyInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readMorningDay(morningStore(tx, ctx.authContext.userId), input.dateKey),
      ),
    ),

  saveLines: protectedProcedure
    .input(morningLinesInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        writeMorningLines(morningStore(tx, ctx.authContext.userId), input),
      ),
    ),
});
