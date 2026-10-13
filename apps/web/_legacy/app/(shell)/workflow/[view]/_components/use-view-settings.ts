"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { WorkflowBoardView, WorkflowColumnRole, WorkflowColumnView, WorkflowTaskView } from "@syn/types";
import { toast, toastUndo } from "@syn/ui";

import { workflowRoute, workflowViewRoute } from "@/lib/routes";
import { trpc } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { insertAt } from "./use-workflow-board";

/** The rule code a refused write carries as its message (FLO-3's `run`). */
function ruleCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "message" in error && typeof error.message === "string"
    ? error.message
    : null;
}

/**
 * The tasks after the view's columns change under them — the server's role
 * effects (TD-35), mirrored so the board behind the sheet is right at once: a
 * task whose column changed role stops firing, is closed if its column is now
 * the done column and reopened if it no longer is.
 */
function withRoles(
  tasks: readonly WorkflowTaskView[],
  before: readonly WorkflowColumnView[],
  after: readonly WorkflowColumnView[],
  now: Date,
): WorkflowTaskView[] {
  const roleIn = (columns: readonly WorkflowColumnView[], id: string) =>
    columns.find((column) => column.id === id)?.role ?? null;
  return tasks.map((task) => {
    const was = roleIn(before, task.columnId);
    const is = roleIn(after, task.columnId);
    if (was === is) return task;
    return { ...task, firingStartedAt: null, closedAt: is === "done" ? (task.closedAt ?? now) : null };
  });
}

/**
 * The planning layer's writes (FLO-8) — views, columns, templates, the
 * archive. `use-workflow-board` stays about the board; this is the three
 * sheets and the view menu.
 *
 * THE COLUMNS SHEET EDITS THE BOARD BEHIND IT. Each column write patches the
 * board's one cache entry (and the view list's `columnsByView`, which *Move to
 * view* reads) before it is sent, and settles from the server's answer — every
 * column procedure answers with the view's columns in order. A failure puts
 * the entry back and says the save-failure sentence once.
 */
export function useViewSettings({
  viewId,
  board,
  tasks,
  now,
  online,
}: {
  viewId: string;
  board: WorkflowBoardView;
  tasks: readonly WorkflowTaskView[];
  now: Date;
  online: boolean;
}) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const key = React.useMemo(() => ({ viewId }), [viewId]);

  const viewCreate = trpc.workflow.view.create.useMutation();
  const viewRename = trpc.workflow.view.rename.useMutation();
  const viewArchive = trpc.workflow.view.archive.useMutation();
  const viewRestore = trpc.workflow.view.restore.useMutation();
  const columnSave = trpc.workflow.column.save.useMutation();
  const columnReorder = trpc.workflow.column.reorder.useMutation();
  const columnSetRole = trpc.workflow.column.setRole.useMutation();
  const columnRemove = trpc.workflow.column.remove.useMutation();
  const templateSave = trpc.workflow.template.save.useMutation();
  const templateRename = trpc.workflow.template.rename.useMutation();
  const templateArchive = trpc.workflow.template.archive.useMutation();
  const taskRestore = trpc.workflow.task.restore.useMutation();
  const groupRestore = trpc.workflow.group.restore.useMutation();

  /** One line per sheet, ink, never red; cleared on the next write. */
  const [error, setError] = React.useState<string | null>(null);

  const latest = React.useRef({ board, tasks, now });
  latest.current = { board, tasks, now };

  /* ------------------------------------------------------- the caches -- */

  const patchBoard = React.useCallback(
    (change: (current: WorkflowBoardView) => WorkflowBoardView) => {
      utils.workflow.board.setData(key, (current) => (current === undefined ? current : change(current)));
    },
    [utils, key],
  );

  const patchColumnsByView = React.useCallback(
    (columns: WorkflowColumnView[]) => {
      utils.workflow.view.list.setData(undefined, (current) =>
        current === undefined ? current : { ...current, columnsByView: { ...current.columnsByView, [viewId]: columns } },
      );
    },
    [utils, viewId],
  );

  /** The board's columns and its tasks' role effects, in one patch. */
  const showColumns = React.useCallback(
    (columns: WorkflowColumnView[], tasksChange?: (tasks: WorkflowTaskView[]) => WorkflowTaskView[]) => {
      patchBoard((current) => {
        const moved = tasksChange === undefined ? current.tasks : tasksChange(current.tasks);
        return { ...current, columns, tasks: withRoles(moved, current.columns, columns, latest.current.now) };
      });
      patchColumnsByView(columns);
    },
    [patchBoard, patchColumnsByView],
  );

  const settleBoard = React.useCallback(() => {
    void utils.workflow.board.invalidate(key);
    void utils.workflow.view.list.invalidate();
  }, [utils, key]);

  /** Run a column write over an optimistic patch; settle from the answer or put it back. */
  const columnWrite = React.useCallback(
    async (
      optimistic: (() => void) | null,
      write: () => Promise<WorkflowColumnView[]>,
    ): Promise<WorkflowColumnView[] | null> => {
      if (!online) return null;
      setError(null);
      const before = utils.workflow.board.getData(key);
      optimistic?.();
      try {
        const columns = await write();
        patchColumnsByView(columns);
        patchBoard((current) => ({ ...current, columns }));
        return columns;
      } catch (failure) {
        if (before !== undefined) {
          utils.workflow.board.setData(key, before);
          patchColumnsByView(before.columns);
        }
        setError(COPY.saveError);
        throw failure;
      } finally {
        settleBoard();
      }
    },
    [online, utils, key, patchColumnsByView, patchBoard, settleBoard],
  );

  /* -------------------------------------------------------- views -- */

  /** *Rename* — the tab, the board's own name, at once. */
  const renameView = React.useCallback(
    (name: string) => {
      if (!online) return;
      setError(null);
      const tabsBefore = utils.workflow.view.list.getData();
      const boardBefore = utils.workflow.board.getData(key);
      utils.workflow.view.list.setData(undefined, (current) =>
        current === undefined
          ? current
          : { ...current, tabs: current.tabs.map((tab) => (tab.id === viewId ? { ...tab, name } : tab)) },
      );
      patchBoard((current) => ({ ...current, view: { ...current.view, name } }));
      viewRename
        .mutateAsync({ id: viewId, name })
        .catch(() => {
          if (tabsBefore !== undefined) utils.workflow.view.list.setData(undefined, tabsBefore);
          if (boardBefore !== undefined) utils.workflow.board.setData(key, boardBefore);
          setError(COPY.saveError);
        })
        .finally(() => settleBoard());
    },
    [online, utils, key, viewId, patchBoard, viewRename, settleBoard],
  );

  /**
   * *Create view* — waits for the server (the new view's first read is a
   * normal server read), then opens it in place of the sheet's history entry,
   * so back returns to the board the person was on, not to the open sheet.
   */
  const createView = React.useCallback(
    async (name: string, from: string): Promise<boolean> => {
      if (!online) return false;
      setError(null);
      const starter = from.startsWith("starter:") ? from.slice("starter:".length) : null;
      try {
        const view = await viewCreate.mutateAsync(
          starter === "working" || starter === "queue" ? { name, starterKey: starter } : { name, templateId: from },
        );
        await utils.workflow.view.list.invalidate();
        router.replace(workflowViewRoute(view.id));
        return true;
      } catch {
        setError(COPY.saveError);
        // A template archived elsewhere is gone from the list on the refetch.
        void utils.workflow.template.list.invalidate();
        return false;
      }
    },
    [online, viewCreate, utils, router],
  );

  /** *Archive this view* — then the first remaining view opens. */
  const archiveView = React.useCallback(async () => {
    if (!online) return;
    setError(null);
    try {
      await viewArchive.mutateAsync({ id: viewId });
      const views = await utils.workflow.view.list.fetch();
      const first = views.tabs[0];
      router.replace(first === undefined ? workflowRoute() : workflowViewRoute(first.id));
    } catch {
      setError(COPY.saveError);
    }
  }, [online, viewArchive, viewId, utils, router]);

  /** *Restore* under *Archived views* — it returns last, with its tasks, and opens. */
  const restoreView = React.useCallback(
    async (id: string) => {
      if (!online) return;
      setError(null);
      try {
        await viewRestore.mutateAsync({ id });
        await utils.workflow.view.list.invalidate();
        router.replace(workflowViewRoute(id));
      } catch {
        setError(COPY.saveError);
      }
    },
    [online, viewRestore, utils, router],
  );

  /* ------------------------------------------------------ columns -- */

  const renameColumn = React.useCallback(
    (id: string, name: string) =>
      columnWrite(
        () =>
          showColumns(
            latest.current.board.columns.map((column) => (column.id === id ? { ...column, name } : column)),
          ),
        () => columnSave.mutateAsync({ viewId, id, name }),
      ).catch(() => null),
    [columnWrite, showColumns, columnSave, viewId],
  );

  /** The full id list (TD-35); the first column is the wide one by position alone. */
  const reorderColumns = React.useCallback(
    (ids: string[]) => {
      const byId = new Map(latest.current.board.columns.map((column) => [column.id, column]));
      return columnWrite(
        () => showColumns(ids.flatMap((id) => byId.get(id) ?? [])),
        () => columnReorder.mutateAsync({ ids }),
      ).catch(() => null);
    },
    [columnWrite, showColumns, columnReorder],
  );

  /** *Add a column* — at the end; the server's id is the row's, so it waits. */
  const addColumn = React.useCallback(
    (name: string) => columnWrite(null, () => columnSave.mutateAsync({ viewId, name })).catch(() => null),
    [columnWrite, columnSave, viewId],
  );

  /**
   * *Tasks fire here* / *Closed tasks land here*, checked or unchecked. The
   * server takes the role from any other column in the same transaction; the
   * board shows the same at once, with the role effects on both columns' tasks.
   * The caller has already asked when this stops firing.
   */
  const setRole = React.useCallback(
    (id: string, role: WorkflowColumnRole | null) =>
      columnWrite(
        () =>
          showColumns(
            latest.current.board.columns.map((column) => {
              if (column.id === id) return { ...column, role };
              return role !== null && column.role === role ? { ...column, role: null } : column;
            }),
          ),
        () => columnSetRole.mutateAsync({ id, role }),
      ).catch(() => null),
    [columnWrite, showColumns, columnSetRole],
  );

  /**
   * *Remove*. Without `moveTasksTo` it is the empty column's path, with
   * *Removed* · *Undo*; the server refuses it (`column_has_tasks`) when the
   * column holds tasks the board does not show — closed before today — and
   * the caller then asks where they go. With `moveTasksTo`, each lane's tasks
   * go to the end of that lane's cell there, in order, with the role effects.
   */
  const removeColumn = React.useCallback(
    async (id: string, moveTasksTo?: string): Promise<"removed" | "has_tasks" | "failed"> => {
      const columns = latest.current.board.columns;
      const index = columns.findIndex((column) => column.id === id);
      const removed = columns[index];
      if (removed === undefined || columns.length <= 1) return "failed";
      const remaining = columns.filter((column) => column.id !== id);

      try {
        await columnWrite(
          () =>
            showColumns(remaining, (shown) => {
              if (moveTasksTo === undefined) return shown;
              const destination = remaining.find((column) => column.id === moveTasksTo);
              let next = shown;
              for (const task of shown.filter((other) => other.columnId === id)) {
                next = insertAt(
                  next,
                  {
                    ...task,
                    columnId: moveTasksTo,
                    firingStartedAt: null,
                    closedAt: destination?.role === "done" ? (task.closedAt ?? latest.current.now) : null,
                  },
                  Number.MAX_SAFE_INTEGER,
                );
              }
              return next;
            }),
          () => columnRemove.mutateAsync(moveTasksTo === undefined ? { id } : { id, moveTasksTo }),
        );
      } catch (failure) {
        if (ruleCode(failure) === "column_has_tasks") {
          setError(null);
          return "has_tasks";
        }
        return "failed";
      }

      if (moveTasksTo === undefined) {
        toastUndo({
          text: COPY.removed,
          onUndo: () => {
            // Back at its place, with its role: add, then the full order, then the role.
            void (async () => {
              const added = await columnSave.mutateAsync({ viewId, name: removed.name });
              const fresh = added.find((column) => !remaining.some((other) => other.id === column.id));
              if (fresh === undefined) return;
              const ids = added.map((column) => column.id).filter((other) => other !== fresh.id);
              ids.splice(index, 0, fresh.id);
              let restored = await columnReorder.mutateAsync({ ids });
              if (removed.role !== null) restored = await columnSetRole.mutateAsync({ id: fresh.id, role: removed.role });
              showColumns(restored);
            })()
              .catch(() => setError(COPY.saveError))
              .finally(() => settleBoard());
          },
        });
      }
      return "removed";
    },
    [columnWrite, showColumns, columnRemove, columnSave, columnReorder, columnSetRole, viewId, settleBoard],
  );

  /* ---------------------------------------------------- templates -- */

  /** *Save as a template* — this view's columns, as they are now, under a name. */
  const saveTemplate = React.useCallback(
    async (name: string): Promise<boolean> => {
      if (!online) return false;
      setError(null);
      try {
        await templateSave.mutateAsync({ viewId, name });
        void utils.workflow.template.list.invalidate();
        return true;
      } catch {
        setError(COPY.saveError);
        return false;
      }
    },
    [online, templateSave, viewId, utils],
  );

  const renameTemplate = React.useCallback(
    async (id: string, name: string): Promise<boolean> => {
      if (!online) return false;
      setError(null);
      try {
        await templateRename.mutateAsync({ id, name });
        return true;
      } catch {
        setError(COPY.saveError);
        return false;
      } finally {
        void utils.workflow.template.list.invalidate();
      }
    },
    [online, templateRename, utils],
  );

  /** Archive, never delete (W18); a view made from it keeps its columns (W10). */
  const archiveTemplate = React.useCallback(
    (id: string) => {
      if (!online) return;
      setError(null);
      const before = utils.workflow.template.list.getData();
      utils.workflow.template.list.setData(undefined, (current) => current?.filter((template) => template.id !== id));
      templateArchive
        .mutateAsync({ id })
        .catch(() => {
          if (before !== undefined) utils.workflow.template.list.setData(undefined, before);
          setError(COPY.saveError);
        })
        .finally(() => void utils.workflow.template.list.invalidate());
    },
    [online, utils, templateArchive],
  );

  /* ------------------------------------------------------ restore -- */

  /** *Restore* in WF-05 — gone from the list at once; *Restored*, no undo (archive again). */
  const restore = React.useCallback(
    (kind: "task" | "group", id: string) => {
      if (!online) return;
      setError(null);
      const before = utils.workflow.task.listArchived.getData();
      utils.workflow.task.listArchived.setData(undefined, (current) =>
        current === undefined
          ? current
          : kind === "task"
            ? { ...current, tasks: current.tasks.filter((task) => task.id !== id) }
            : { ...current, groups: current.groups.filter((group) => group.id !== id) },
      );
      (kind === "task" ? taskRestore.mutateAsync({ id }) : groupRestore.mutateAsync({ id }))
        .then(() => {
          toast(COPY.restored);
        })
        .catch(() => {
          if (before !== undefined) utils.workflow.task.listArchived.setData(undefined, before);
          setError(COPY.saveError);
        })
        .finally(() => {
          void utils.workflow.task.listArchived.invalidate();
          void utils.workflow.board.invalidate();
        });
    },
    [online, utils, taskRestore, groupRestore],
  );

  return {
    error,
    clearError: React.useCallback(() => setError(null), []),
    renameView,
    createView,
    creatingView: viewCreate.isPending,
    archiveView,
    restoreView,
    renameColumn,
    reorderColumns,
    addColumn,
    setRole,
    removeColumn,
    saveTemplate,
    savingTemplate: templateSave.isPending || templateRename.isPending,
    renameTemplate,
    archiveTemplate,
    restore,
  };
}
