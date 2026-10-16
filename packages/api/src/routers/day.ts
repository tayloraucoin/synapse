import { dateKeyInput, dayStampInput } from "@syn/validators";

import {
  dayRecordStore,
  readReadiedBefore,
  readyGo,
  stampOrient,
} from "../services/day/day-records";
import { protectedProcedure, router } from "../trpc";

/**
 * The day's record (USE-96): Orient's open, Ready, go and the welcome's
 * first-go read. Each stamp keeps its first instant.
 */
export const dayRouter = router({
  stampOrient: protectedProcedure
    .input(dayStampInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        stampOrient(dayRecordStore(tx, ctx.authContext.userId), input),
      ),
    ),

  readyGo: protectedProcedure
    .input(dayStampInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readyGo(dayRecordStore(tx, ctx.authContext.userId), input),
      ),
    ),

  readiedBefore: protectedProcedure
    .input(dateKeyInput)
    .query(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        readReadiedBefore(
          dayRecordStore(tx, ctx.authContext.userId),
          input.dateKey,
        ),
      ),
    ),
});
