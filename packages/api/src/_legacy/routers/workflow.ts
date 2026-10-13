import { TRPCError } from "@trpc/server";

import {
  workflowBoardInput,
  workflowColumnRemoveInput,
  workflowColumnSaveInput,
  workflowColumnSetRoleInput,
  workflowGroupCreateInput,
  workflowGroupRenameInput,
  workflowGroupSetCollapsedInput,
  workflowGroupSetHueInput,
  workflowIdInput,
  workflowListClosedInput,
  workflowReorderInput,
  workflowTaskCreateInput,
  workflowTaskMoveInput,
  workflowTaskRestoreInput,
  workflowTaskSetFiringInput,
  workflowTaskUpdateInput,
  workflowTemplateIdInput,
  workflowTemplateRenameInput,
  workflowTemplateSaveInput,
  workflowViewCreateInput,
  workflowViewRenameInput,
} from "@syn/validators";

import { archiveWorkflowGroup, restoreWorkflowGroup } from "../services/workflow/archive-group";
import { archiveWorkflowTask, restoreWorkflowTask } from "../services/workflow/archive-task";
import { archiveWorkflowView, restoreWorkflowView } from "../services/workflow/archive-view";
import { getBoard } from "../services/workflow/get-board";
import { listArchivedWorkflow } from "../services/workflow/list-archived";
import { listClosedWorkflowTasks } from "../services/workflow/list-closed-tasks";
import { listViews } from "../services/workflow/list-views";
import { moveWorkflowTask } from "../services/workflow/move-task";
import { pinWorkflowGroupToday, unpinWorkflowGroupToday } from "../services/workflow/pin-group-today";
import { removeWorkflowColumn } from "../services/workflow/remove-column";
import { reorderWorkflowGroups } from "../services/workflow/reorder-groups";
import { WorkflowNotFoundError, WorkflowRuleError } from "../services/workflow/rule-error";
import { reorderWorkflowColumns, saveWorkflowColumn } from "../services/workflow/save-columns";
import {
  createWorkflowGroup,
  renameWorkflowGroup,
  setWorkflowGroupCollapsed,
  setWorkflowGroupHue,
} from "../services/workflow/save-group";
import { createWorkflowTask, updateWorkflowTask } from "../services/workflow/save-task";
import {
  archiveWorkflowTemplate,
  listWorkflowTemplates,
  renameWorkflowTemplate,
  saveWorkflowTemplate,
} from "../services/workflow/save-template";
import {
  createWorkflowView,
  markWorkflowViewOpened,
  renameWorkflowView,
  reorderWorkflowViews,
} from "../services/workflow/save-view";
import { setWorkflowColumnRole } from "../services/workflow/set-column-role";
import { setWorkflowTaskFiring } from "../services/workflow/set-firing";
import { startWorkflowTask } from "../services/workflow/start-task";
import { protectedProcedure, router } from "../trpc";

/**
 * Workflow — the board of lanes by columns (Workflow UX spec v0.1; Epic 7
 * TD-35…TD-41). One router, nested by noun (TD-40); every resolver validates,
 * calls one service under `ctx.rls`, and returns.
 *
 * Errors carry codes, never values: a rule is `BAD_REQUEST` with its code; a
 * row that is absent, archived where it must not be, or another person's is
 * `NOT_FOUND` — never `FORBIDDEN`. A task's title or note never reaches an
 * error or a log (TD-45).
 *
 * *Next* is not served here: the client computes it (W8, TD-38).
 */

async function run<T>(work: () => Promise<T>): Promise<T> {
  try {
    return await work();
  } catch (error) {
    if (error instanceof WorkflowRuleError) {
      throw new TRPCError({ code: "BAD_REQUEST", message: error.code, cause: error });
    }
    if (error instanceof WorkflowNotFoundError) {
      throw new TRPCError({ code: "NOT_FOUND", message: "No such workflow item.", cause: error });
    }
    throw error;
  }
}

const viewRouter = router({
  list: protectedProcedure.query(({ ctx }) => run(() => listViews(ctx.rls, ctx.authContext.userId))),
  create: protectedProcedure
    .input(workflowViewCreateInput)
    .mutation(({ ctx, input }) => run(() => createWorkflowView(ctx.rls, ctx.authContext.userId, input))),
  rename: protectedProcedure
    .input(workflowViewRenameInput)
    .mutation(({ ctx, input }) => run(() => renameWorkflowView(ctx.rls, ctx.authContext.userId, input))),
  reorder: protectedProcedure
    .input(workflowReorderInput)
    .mutation(({ ctx, input }) => run(() => reorderWorkflowViews(ctx.rls, ctx.authContext.userId, input))),
  archive: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => archiveWorkflowView(ctx.rls, ctx.authContext.userId, input))),
  restore: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => restoreWorkflowView(ctx.rls, ctx.authContext.userId, input))),
  markOpened: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => markWorkflowViewOpened(ctx.rls, ctx.authContext.userId, input))),
});

const columnRouter = router({
  save: protectedProcedure
    .input(workflowColumnSaveInput)
    .mutation(({ ctx, input }) => run(() => saveWorkflowColumn(ctx.rls, ctx.authContext.userId, input))),
  reorder: protectedProcedure
    .input(workflowReorderInput)
    .mutation(({ ctx, input }) => run(() => reorderWorkflowColumns(ctx.rls, ctx.authContext.userId, input))),
  setRole: protectedProcedure
    .input(workflowColumnSetRoleInput)
    .mutation(({ ctx, input }) => run(() => setWorkflowColumnRole(ctx.rls, ctx.authContext.userId, input))),
  remove: protectedProcedure
    .input(workflowColumnRemoveInput)
    .mutation(({ ctx, input }) => run(() => removeWorkflowColumn(ctx.rls, ctx.authContext.userId, input))),
});

const groupRouter = router({
  create: protectedProcedure
    .input(workflowGroupCreateInput)
    .mutation(({ ctx, input }) => run(() => createWorkflowGroup(ctx.rls, ctx.authContext.userId, input))),
  rename: protectedProcedure
    .input(workflowGroupRenameInput)
    .mutation(({ ctx, input }) => run(() => renameWorkflowGroup(ctx.rls, ctx.authContext.userId, input))),
  setHue: protectedProcedure
    .input(workflowGroupSetHueInput)
    .mutation(({ ctx, input }) => run(() => setWorkflowGroupHue(ctx.rls, ctx.authContext.userId, input))),
  setCollapsed: protectedProcedure
    .input(workflowGroupSetCollapsedInput)
    .mutation(({ ctx, input }) => run(() => setWorkflowGroupCollapsed(ctx.rls, ctx.authContext.userId, input))),
  reorder: protectedProcedure
    .input(workflowReorderInput)
    .mutation(({ ctx, input }) => run(() => reorderWorkflowGroups(ctx.rls, ctx.authContext.userId, input))),
  archive: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => archiveWorkflowGroup(ctx.rls, ctx.authContext.userId, input))),
  restore: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => restoreWorkflowGroup(ctx.rls, ctx.authContext.userId, input))),
  pinToday: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => pinWorkflowGroupToday(ctx.rls, ctx.authContext.userId, input))),
  unpinToday: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => unpinWorkflowGroupToday(ctx.rls, ctx.authContext.userId, input))),
});

const taskRouter = router({
  create: protectedProcedure
    .input(workflowTaskCreateInput)
    .mutation(({ ctx, input }) => run(() => createWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  update: protectedProcedure
    .input(workflowTaskUpdateInput)
    .mutation(({ ctx, input }) => run(() => updateWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  move: protectedProcedure
    .input(workflowTaskMoveInput)
    .mutation(({ ctx, input }) => run(() => moveWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  setFiring: protectedProcedure
    .input(workflowTaskSetFiringInput)
    .mutation(({ ctx, input }) => run(() => setWorkflowTaskFiring(ctx.rls, ctx.authContext.userId, input))),
  start: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => startWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  archive: protectedProcedure
    .input(workflowIdInput)
    .mutation(({ ctx, input }) => run(() => archiveWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  restore: protectedProcedure
    .input(workflowTaskRestoreInput)
    .mutation(({ ctx, input }) => run(() => restoreWorkflowTask(ctx.rls, ctx.authContext.userId, input))),
  listClosed: protectedProcedure
    .input(workflowListClosedInput)
    .query(({ ctx, input }) => run(() => listClosedWorkflowTasks(ctx.rls, ctx.authContext.userId, input))),
  listArchived: protectedProcedure.query(({ ctx }) =>
    run(() => listArchivedWorkflow(ctx.rls, ctx.authContext.userId)),
  ),
});

const templateRouter = router({
  list: protectedProcedure.query(({ ctx }) =>
    run(() => listWorkflowTemplates(ctx.rls, ctx.authContext.userId)),
  ),
  save: protectedProcedure
    .input(workflowTemplateSaveInput)
    .mutation(({ ctx, input }) => run(() => saveWorkflowTemplate(ctx.rls, ctx.authContext.userId, input))),
  rename: protectedProcedure
    .input(workflowTemplateRenameInput)
    .mutation(({ ctx, input }) => run(() => renameWorkflowTemplate(ctx.rls, ctx.authContext.userId, input))),
  archive: protectedProcedure
    .input(workflowTemplateIdInput)
    .mutation(({ ctx, input }) => run(() => archiveWorkflowTemplate(ctx.rls, ctx.authContext.userId, input))),
});

export const workflowRouter = router({
  board: protectedProcedure
    .input(workflowBoardInput)
    .query(({ ctx, input }) => run(() => getBoard(ctx.rls, ctx.authContext.userId, input))),
  view: viewRouter,
  column: columnRouter,
  group: groupRouter,
  task: taskRouter,
  template: templateRouter,
});
