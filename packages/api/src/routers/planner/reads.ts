import {
  dayReadInput,
  dayReadOutput,
  weekReadInput,
  weekReadOutput,
} from "@syn/validators";
import { readDayRecords } from "../../services/planner/read-day";
import { readWeekRecords } from "../../services/planner/read-week";
import { protectedProcedure } from "../../trpc";

/**
 * The planner's two reads (USE-91), `planner.today` and `planner.week`: the
 * fixture server's `readToday` and `readWeek`, live. Each output parses with
 * the schema the fixture's shape is typed from, so the two cannot drift.
 */
export const plannerReads = {
  today: protectedProcedure
    .input(dayReadInput)
    .output(dayReadOutput)
    .query(({ ctx, input }) =>
      readDayRecords(ctx.rls, ctx.authContext.userId, input.dateKey),
    ),

  week: protectedProcedure
    .input(weekReadInput)
    .output(weekReadOutput)
    .query(({ ctx, input }) =>
      readWeekRecords(ctx.rls, ctx.authContext.userId, input.week),
    ),
};
