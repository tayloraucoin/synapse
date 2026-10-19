import {
  createTaskInput,
  editWorkItemInput,
  linkToLinearInput,
  moveWorkInput,
  placeIssuesInput,
  placeOnDaysInput,
  placeWorkInput,
  plannerWriteOutput,
  poolReadOutput,
  setWorkTierInput,
  spreadWorkInput,
  unplaceWorkInput,
  workItemIdInput,
} from "@syn/validators";
import { refuse } from "../errors";
import { readLinearSnapshots } from "../services/linear";
import {
  planBackToPool,
  planCreateTask,
  planEditWorkItem,
  planMarkTaskDone,
  planRemoveFromSynapse,
  planReopenTask,
} from "../services/work/items";
import {
  planLinkToLinear,
  planPlaceIssues,
  planUnlinkFromLinear,
} from "../services/work/linear-items";
import { selectLinkedItemIds } from "../services/work/linear-rows";
import { readPool } from "../services/work/read-pool";
import { runWorkWrite } from "../services/work/run-work-write";
import {
  ALREADY_PLACED,
  planMoveWork,
  planPlaceOnDays,
  planPlaceWork,
  planSetWorkTier,
  planSpreadWork,
  planUnplaceWork,
  sessionScope,
} from "../services/work/sessions";
import { protectedProcedure, router } from "../trpc";

/**
 * The work pool (USE-98): the fixture `WorkServer`'s pool read and item
 * writes, live. Each write is a plan over the caller's rows applied in one
 * `rls.execute` (`runWorkWrite`) and hands back `{ undo, id? }`, taken back
 * by `planner.undo`. USE-99 adds the sessions: place, place on several
 * days, move, unplace, spread and a tier change, however many days each
 * names in one transaction. USE-101 adds From Linear's place, Link and
 * Unlink, each planned over the latest Linear snapshot; none writes to
 * Linear.
 */

const write = protectedProcedure.output(plannerWriteOutput);

const UNIQUE_VIOLATION = "23505";

/**
 * A session that slipped past the plan's one-a-day test (a race) meets
 * `slots_work_item_id_on_date_key` on an update, and is refused as the plan
 * refuses it. A racing insert reaches no row and rolls the whole write back.
 */
async function refusingClash<T>(write: Promise<T>): Promise<T> {
  try {
    return await write;
  } catch (error) {
    for (let e: unknown = error; e instanceof Error; e = e.cause) {
      const { code, constraint_name } = e as {
        code?: string;
        constraint_name?: string;
      };
      if (code === UNIQUE_VIOLATION && constraint_name?.startsWith("slots_")) {
        throw refuse("duplicate", ALREADY_PLACED);
      }
    }
    throw error;
  }
}

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

  placeWork: write.input(placeWorkInput).mutation(({ ctx, input }) =>
    refusingClash(
      runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: sessionScope.place(input),
        plan: (journal) => planPlaceWork(journal, input),
      }),
    ),
  ),

  placeOnDays: write.input(placeOnDaysInput).mutation(({ ctx, input }) =>
    refusingClash(
      runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: sessionScope.days(input),
        plan: (journal) => planPlaceOnDays(journal, input),
      }),
    ),
  ),

  moveWork: write.input(moveWorkInput).mutation(({ ctx, input }) =>
    refusingClash(
      runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: sessionScope.slot(input),
        plan: (journal) => planMoveWork(journal, input),
      }),
    ),
  ),

  unplaceWork: write.input(unplaceWorkInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: sessionScope.slot(input),
      plan: (journal) => planUnplaceWork(journal, input),
    }),
  ),

  spreadWork: write.input(spreadWorkInput).mutation(({ ctx, input }) =>
    refusingClash(
      runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: sessionScope.days(input),
        plan: (journal) => planSpreadWork(journal, input),
      }),
    ),
  ),

  setWorkTier: write.input(setWorkTierInput).mutation(({ ctx, input }) =>
    runWorkWrite(ctx.rls, ctx.authContext.userId, {
      scope: sessionScope.slot(input),
      plan: (journal) => planSetWorkTier(journal, input),
    }),
  ),

  placeIssues: write
    .input(placeIssuesInput)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.authContext.userId;
      const snapshots = await readLinearSnapshots(ctx.rls);
      const linked = await selectLinkedItemIds(ctx.rls, userId, input.issueIds);
      return refusingClash(
        runWorkWrite(ctx.rls, userId, {
          scope: { workItemIds: linked, blockIds: [input.blockId] },
          plan: (journal) => planPlaceIssues(journal, snapshots, input),
        }),
      );
    }),

  linkToLinear: write
    .input(linkToLinearInput)
    .mutation(async ({ ctx, input }) => {
      const snapshots = await readLinearSnapshots(ctx.rls);
      return runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: { workItemIds: [input.workItemId] },
        plan: (journal) => planLinkToLinear(journal, snapshots, input),
      });
    }),

  unlinkFromLinear: write
    .input(workItemIdInput)
    .mutation(async ({ ctx, input }) => {
      const snapshots = await readLinearSnapshots(ctx.rls);
      return runWorkWrite(ctx.rls, ctx.authContext.userId, {
        scope: { workItemIds: [input.workItemId] },
        plan: (journal) => planUnlinkFromLinear(journal, snapshots, input),
      });
    }),
});
