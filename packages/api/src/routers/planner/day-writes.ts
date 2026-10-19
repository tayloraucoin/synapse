import {
  copyBlockInput,
  copyDayInput,
  dayRefInput,
  plannerWriteOutput,
  resetDayInput,
} from "@syn/validators";
import {
  planClearDay,
  planCopyBlock,
  planCopyDay,
  planResetDay,
  runDayWrite,
} from "../../services/planner/day-writes";
import { protectedProcedure } from "../../trpc";

/**
 * The planner's day-level writes (USE-93): Copy from, From a saved block,
 * Clear the day and Reset to usual. Each writes a whole day's rows in one
 * `rls.execute` (`runDayWrite`) and hands back `{ undo, id?, reach? }`, its
 * token taken back by `planner.undo` like USE-92's.
 */

const write = protectedProcedure.output(plannerWriteOutput);

export const plannerDayWrites = {
  copyDay: write
    .input(copyDayInput)
    .mutation(({ ctx, input }) =>
      runDayWrite(
        ctx.rls,
        ctx.authContext.userId,
        [input.from, input.to],
        (j) => planCopyDay(j, input),
      ),
    ),

  copyBlock: write
    .input(copyBlockInput)
    .mutation(({ ctx, input }) =>
      runDayWrite(
        ctx.rls,
        ctx.authContext.userId,
        [input.from, input.to],
        (j) => planCopyBlock(j, input),
      ),
    ),

  clearDay: write
    .input(dayRefInput)
    .mutation(({ ctx, input }) =>
      runDayWrite(ctx.rls, ctx.authContext.userId, [input], (j) =>
        planClearDay(j, input),
      ),
    ),

  resetDay: write
    .input(resetDayInput)
    .mutation(({ ctx, input }) =>
      runDayWrite(ctx.rls, ctx.authContext.userId, [input], (j) =>
        planResetDay(j, input),
      ),
    ),
};
