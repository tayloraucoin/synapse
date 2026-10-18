import {
  createTaskInput,
  editWorkItemInput,
  plannerWriteOutput,
  poolReadOutput,
  workItemIdInput,
} from "@syn/validators";
import {
  planBackToPool,
  planCreateTask,
  planEditWorkItem,
  planMarkTaskDone,
  planRemoveFromSynapse,
  planReopenTask,
} from "../services/work/items";
import { readPool } from "../services/work/read-pool";
import { runWorkWrite } from "../services/work/run-work-write";
import { protectedProcedure, router } from "../trpc";

/**
 * The work pool (USE-98): the fixture `WorkServer`'s pool read and item
 * writes, live. Each write is a plan over the caller's rows applied in one
 * `rls.execute` (`runWorkWrite`) and hands back `{ undo, id? }`, taken back
 * by `planner.undo`. Placing, moving and tiering sessions are USE-99's;
 * Linear's snapshot and placing issues USE-101's.
 */

const write = protectedProcedure.output(plannerWriteOutput);

export const workRouter = router({
  pool: protectedProcedure
    .output(poolReadOutput)
    .query(({ ctx }) => readPool(ctx.rls, ctx.authContext.userId)),

  createTask: write.input(createTaskInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: {
        workItemIds: [],
        blockIds: input.days.map((day) => day.blockId),
      },
      plan: (journal) => planCreateTask(journal, input),
    }),
  ),

  editWorkItem: write.input(editWorkItemInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: { workItemIds: [input.id] },
      plan: (journal) => planEditWorkItem(journal, input),
    }),
  ),

  markTaskDone: write.input(workItemIdInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: { workItemIds: [input.workItemId] },
      plan: (journal) => planMarkTaskDone(journal, input),
    }),
  ),

  reopenTask: write.input(workItemIdInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: { workItemIds: [input.workItemId] },
      plan: (journal) => planReopenTask(journal, input),
    }),
  ),

  backToPool: write.input(workItemIdInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: { workItemIds: [input.workItemId] },
      plan: (journal) => planBackToPool(journal, input),
    }),
  ),

  removeFromSynapse: write.input(workItemIdInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: { workItemIds: [input.workItemId] },
      plan: (journal) => planRemoveFromSynapse(journal, input),
    }),
  ),
});
