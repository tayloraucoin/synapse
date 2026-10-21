import {
  blockChangeInput,
  blockItemInput,
  dayBoundsInput,
  dayEventWriteInput,
  editBlockInput,
  editBlockItemInput,
  idInput,
  newBlockInput,
  newTransitionInput,
  plannerWriteOutput,
  removeBlockInput,
  removeBlockItemInput,
  reorderItemsInput,
  scopedWriteInput,
  splitBlockInput,
  undoInput,
} from "@syn/validators";
import { blockOfItem, runPlannerWrite } from "../../services/planner/run-write";
import {
  planBlockChange,
  planCreateBlock,
  planCreateTransition,
  planEditBlock,
  planRemoveBlock,
  planSplitBlock,
} from "../../services/planner/write-blocks";
import {
  planRemoveDayEvent,
  planWriteBounds,
  planWriteDayEvent,
} from "../../services/planner/write-bounds";
import {
  planEditBlockItem,
  planRemoveBlockItem,
  planReorderItems,
  planWriteBlockItem,
} from "../../services/planner/write-items";
import { rowStore } from "../../services/undo/row-store";
import { undoWrite } from "../../services/undo/undo";
import { protectedProcedure } from "../../trpc";

/**
 * The planner's writes (USE-92): the fixture server's `PlannerServer` writes,
 * live, apart from the day-level four (USE-93) and the slot writes (USE-94).
 * Each is a plan over the caller's rows applied in one `rls.execute`
 * (`runPlannerWrite`), and each hands back `{ undo, id?, reach? }`; a write
 * made on a usual weekday sends `scope` so its reach can be named.
 * `planner.undo` takes any of their tokens back.
 */

const none = () => [];

const write = protectedProcedure.output(plannerWriteOutput);

export const plannerWrites = {
  writeBounds: write.input(dayBoundsInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: none,
      plan: (journal) => planWriteBounds(journal, input),
    }),
  ),

  createBlock: write
    .input(scopedWriteInput(newBlockInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: none,
        plan: (journal) => planCreateBlock(journal, input, scope),
      }),
    ),

  createTransition: write
    .input(scopedWriteInput(newTransitionInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: () => (input.placement === "in_block" ? [input.blockId] : []),
        plan: (journal) => planCreateTransition(journal, input, scope),
      }),
    ),

  editBlock: write
    .input(scopedWriteInput(editBlockInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: () => [input.id],
        plan: (journal) => planEditBlock(journal, input, scope),
      }),
    ),

  removeBlock: write.input(removeBlockInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: () => [input.id],
      plan: (journal) => planRemoveBlock(journal, input),
    }),
  ),

  splitBlock: write.input(splitBlockInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: () => [input.id],
      plan: (journal) => planSplitBlock(journal, input),
    }),
  ),

  writeBlockChange: write.input(blockChangeInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: () => [input.blockId],
      plan: (journal) => planBlockChange(journal, input),
    }),
  ),

  writeBlockItem: write
    .input(scopedWriteInput(blockItemInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: () => [input.blockId],
        plan: (journal) => planWriteBlockItem(journal, input, scope),
      }),
    ),

  editBlockItem: write
    .input(scopedWriteInput(editBlockItemInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: (rows) => [
          ...blockOfItem(rows, input.id),
          ...(input.blockId ? [input.blockId] : []),
        ],
        plan: (journal) => planEditBlockItem(journal, input, scope),
      }),
    ),

  removeBlockItem: write
    .input(scopedWriteInput(removeBlockItemInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: (rows) => blockOfItem(rows, input.id),
        plan: (journal) => planRemoveBlockItem(journal, input, scope),
      }),
    ),

  reorderItems: write
    .input(scopedWriteInput(reorderItemsInput))
    .mutation(({ ctx, input: { input, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: () => [input.blockId],
        plan: (journal) => planReorderItems(journal, input, scope),
      }),
    ),

  writeDayEvent: write
    .input(dayEventWriteInput)
    .mutation(({ ctx, input: { input, id, scope } }) =>
      runPlannerWrite(ctx.rls, ctx.authContext.userId, {
        blocks: none,
        plan: (journal) => planWriteDayEvent(journal, input, id, scope),
      }),
    ),

  removeDayEvent: write.input(idInput).mutation(({ ctx, input }) =>
    runPlannerWrite(ctx.rls, ctx.authContext.userId, {
      blocks: none,
      plan: (journal) => planRemoveDayEvent(journal, input),
    }),
  ),

  /** Any planner, work or to-do write's Undo, by its signed token. */
  undo: protectedProcedure
    .input(undoInput)
    .mutation(({ ctx, input }) =>
      ctx.rls.execute((tx) =>
        undoWrite(
          rowStore(tx, ctx.authContext.userId),
          input.token,
          ctx.authContext.userId,
        ),
      ),
    ),
};
