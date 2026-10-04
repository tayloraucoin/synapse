"use client";

import * as React from "react";

import type {
  WorkflowBoardView,
  WorkflowColumnView,
  WorkflowGroupView,
  WorkflowNext,
  WorkflowTaskView,
} from "@syn/types";
import { toastUndo } from "@syn/ui";
import { orderGroupsForDay, resolveNext } from "@syn/utils";

import { useNow } from "@/lib/hooks/use-now";
import { useOnline } from "@/lib/hooks/use-online";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";

type ViewList = RouterOutputs["workflow"]["view"]["list"];

/** The lane key of *No group* — and of a task whose group is no longer listed. */
export const NO_GROUP = "none";

export type WorkflowLane = {
  key: string;
  group: WorkflowGroupView | null;
  collapsed: boolean;
  firstToday: boolean;
  /** Folded-head truths (UX §3.5): something in it fires; next is in it. */
  hasFiring: boolean;
  hasNext: boolean;
  /** Column id → the cell's tasks, in cell order. */
  cells: ReadonlyMap<string, WorkflowTaskView[]>;
};

/** A press the person made that the server has not yet confirmed. */
type Wanted = { firing: boolean; at: Date };

/**
 * The board's behaviour — everything that is not layout (Workflow UX v0.1
 * §3.3–§3.5, WF-01; TD-38, TD-39).
 *
 * ONE CACHE ENTRY, `workflow.board({ viewId })`, read on the server and handed
 * in as initial data, refetched on focus.
 *
 * THE TOGGLE NEVER WAITS, AND THE LATEST PRESS WINS. A press records the
 * WANTED state (and its own `at`) and the rows are derived with that overlay
 * on the cached tasks, so the row, *next*, the strip and the tab title all
 * change in the frame of the press — and a refetch that lands mid-write
 * cannot snap a row back. One write per row is in flight: a second press
 * while it travels only updates the wanted state, and when the first settles
 * the wanted state is sent if it still differs. Two quick presses therefore
 * end where the second left them, in at most two requests. The write is a SET
 * (TD-36), so sending twice is harmless. A success writes the server's row
 * into the cache before the overlay is dropped; a failure drops the overlay
 * (the row returns to the server's state) and says the save-failure sentence.
 *
 * NEXT HAS ONE SOURCE. The lanes are built once — `orderGroupsForDay`, then
 * *No group* last — and that same ordered list feeds `resolveNext`, so the
 * row's *next* and the strip can never disagree (W8). Nothing is stored.
 */
export function useWorkflowBoard(viewId: string, initialBoard: WorkflowBoardView, initialViews: ViewList) {
  const now = useNow();
  const online = useOnline();
  const utils = trpc.useUtils();
  const key = React.useMemo(() => ({ viewId }), [viewId]);

  const boardQuery = trpc.workflow.board.useQuery(key, { initialData: initialBoard });
  const viewsQuery = trpc.workflow.view.list.useQuery(undefined, { initialData: initialViews });
  const setFiringMutation = trpc.workflow.task.setFiring.useMutation();
  const setCollapsedMutation = trpc.workflow.group.setCollapsed.useMutation();
  const markOpenedMutation = trpc.workflow.view.markOpened.useMutation();

  const board = boardQuery.data ?? initialBoard;
  const views = viewsQuery.data ?? initialViews;

  const [error, setError] = React.useState<string | null>(null);

  /* ---------------------------------------------------- the last view -- */

  // `/workflow` returns to the view opened last (TD-44). Once per view id; it
  // patches nothing and nothing waits on it.
  const markOpened = React.useRef(markOpenedMutation.mutate);
  markOpened.current = markOpenedMutation.mutate;
  React.useEffect(() => {
    markOpened.current({ id: viewId });
  }, [viewId]);

  /* ---------------------------------------- the toggle's wanted state -- */

  const [wanted, setWantedState] = React.useState<ReadonlyMap<string, Wanted>>(() => new Map());
  const wantedRef = React.useRef(wanted);
  const inFlight = React.useRef(new Map<string, boolean>());

  const updateWanted = React.useCallback(
    (change: (map: Map<string, Wanted>) => void) => {
      const next = new Map(wantedRef.current);
      change(next);
      wantedRef.current = next;
      setWantedState(next);
    },
    [],
  );

  const send = React.useCallback(
    function send(taskId: string): void {
      const press = wantedRef.current.get(taskId);
      if (press === undefined) return;
      inFlight.current.set(taskId, press.firing);

      setFiringMutation
        .mutateAsync({ id: taskId, firing: press.firing, at: press.at })
        .then((task) => {
          utils.workflow.board.setData(key, (current) =>
            current === undefined
              ? current
              : { ...current, tasks: current.tasks.map((other) => (other.id === task.id ? task : other)) },
          );
          const latest = wantedRef.current.get(taskId);
          inFlight.current.delete(taskId);
          if (latest !== undefined && latest.firing !== press.firing) {
            // The person pressed again while this travelled: send what they want now.
            send(taskId);
            return;
          }
          updateWanted((map) => map.delete(taskId));
          void utils.workflow.board.invalidate(key);
        })
        .catch(() => {
          inFlight.current.delete(taskId);
          updateWanted((map) => map.delete(taskId));
          setError(COPY.saveError);
          void utils.workflow.board.invalidate(key);
        });
    },
    [setFiringMutation, updateWanted, utils, key],
  );

  /** Fire (`true`) or mark back (`false`) — the state the person wants, never a toggle. */
  const setFiring = React.useCallback(
    (taskId: string, firing: boolean) => {
      if (!online) return;
      setError(null);
      updateWanted((map) => map.set(taskId, { firing, at: new Date() }));
      if (!inFlight.current.has(taskId)) send(taskId);
    },
    [online, send, updateWanted],
  );

  /** The cached tasks with the person's unconfirmed presses laid over them. */
  const tasks = React.useMemo(
    () =>
      board.tasks.map((task) => {
        const press = wanted.get(task.id);
        if (press === undefined || (task.firingStartedAt !== null) === press.firing) return task;
        return press.firing
          ? { ...task, firingStartedAt: press.at }
          : { ...task, firingStartedAt: null, lastReturnedAt: press.at };
      }),
    [board.tasks, wanted],
  );

  /* ------------------------------------------------------- the fold -- */

  // *No group* has no row to remember its fold in; it folds for the session.
  const [noGroupCollapsed, setNoGroupCollapsed] = React.useState(false);

  const patchGroup = React.useCallback(
    (groupId: string, collapsed: boolean) => {
      utils.workflow.board.setData(key, (current) =>
        current === undefined
          ? current
          : {
              ...current,
              groups: current.groups.map((group) => (group.id === groupId ? { ...group, collapsed } : group)),
            },
      );
    },
    [utils, key],
  );

  const setCollapsed = React.useCallback(
    (laneKey: string, collapsed: boolean) => {
      if (laneKey === NO_GROUP) {
        setNoGroupCollapsed(collapsed);
        return;
      }
      if (!online) return;
      const before = board.groups.find((group) => group.id === laneKey)?.collapsed ?? false;
      setError(null);
      patchGroup(laneKey, collapsed);
      setCollapsedMutation
        .mutateAsync({ id: laneKey, collapsed })
        .catch(() => {
          patchGroup(laneKey, before);
          setError(COPY.saveError);
        })
        .finally(() => {
          void utils.workflow.board.invalidate(key);
        });
    },
    [online, board.groups, patchGroup, setCollapsedMutation, utils, key],
  );

  /* ---------------------------------------------- lanes, cells, next -- */

  const groupsInOrder = React.useMemo(
    () => orderGroupsForDay(board.groups, board.pinnedGroupIds),
    [board.groups, board.pinnedGroupIds],
  );

  const next: WorkflowNext = React.useMemo(
    () => resolveNext({ groupsInOrder, tasks, columns: board.columns }),
    [groupsInOrder, tasks, board.columns],
  );

  const activeColumn: WorkflowColumnView | undefined = board.columns.find((column) => column.role === "active");
  const nextTask = next.kind === "task" ? tasks.find((task) => task.id === next.taskId) : undefined;

  const lanes = React.useMemo<WorkflowLane[]>(() => {
    const listed = new Set(board.groups.map((group) => group.id));
    const laneOf = (task: WorkflowTaskView): string =>
      task.groupId !== null && listed.has(task.groupId) ? task.groupId : NO_GROUP;
    const pinned = new Set(board.pinnedGroupIds);

    const build = (laneKey: string, group: WorkflowGroupView | null): WorkflowLane => {
      const mine = tasks.filter((task) => laneOf(task) === laneKey);
      const cells = new Map<string, WorkflowTaskView[]>(
        board.columns.map((column) => [column.id, mine.filter((task) => task.columnId === column.id)]),
      );
      return {
        key: laneKey,
        group,
        collapsed: group === null ? noGroupCollapsed : group.collapsed,
        firstToday: group !== null && pinned.has(group.id),
        hasFiring:
          activeColumn !== undefined &&
          mine.some((task) => task.columnId === activeColumn.id && task.firingStartedAt !== null),
        hasNext: nextTask !== undefined && laneOf(nextTask) === laneKey,
        cells,
      };
    };

    const result = groupsInOrder.map((group) => build(group.id, group));
    // *No group* is last, drawn only when it holds a task here or there are no groups (§3.2).
    if (board.groups.length === 0 || tasks.some((task) => laneOf(task) === NO_GROUP)) {
      result.push(build(NO_GROUP, null));
    }
    return result;
  }, [board.groups, board.pinnedGroupIds, board.columns, tasks, groupsInOrder, activeColumn, nextTask, noGroupCollapsed]);

  const nextLane = nextTask === undefined ? undefined : lanes.find((lane) => lane.hasNext);

  /* ------------------------------------------- the one announcement -- */

  // Written only when next CHANGES after the first render, so a refetch that
  // changes nothing says nothing, and a press says at most one line.
  const [announcement, setAnnouncement] = React.useState("");
  const nextKey = next.kind === "task" ? `task:${next.taskId}` : next.kind;
  const lastNextKey = React.useRef(nextKey);
  React.useEffect(() => {
    if (lastNextKey.current === nextKey) return;
    lastNextKey.current = nextKey;
    if (next.kind === "task" && nextTask !== undefined) setAnnouncement(COPY.announceNext(nextTask.title));
    else if (next.kind === "all_firing") setAnnouncement(COPY.announceAllFiring);
    else setAnnouncement("");
  }, [nextKey, next.kind, nextTask]);

  /* ======================================================================
   * FLO-7 — every write a person makes to the board, without a drag.
   * ==================================================================== */

  const writes = useBoardWrites({ viewId, key, board, tasks, views, now, online, setError, updateWanted });

  /* ---------------------------------------------------- the views -- */

  const tabIndex = views.tabs.findIndex((tab) => tab.id === viewId);
  const previousViewId = tabIndex > 0 ? views.tabs[tabIndex - 1]?.id : undefined;
  const nextViewId = tabIndex >= 0 ? views.tabs[tabIndex + 1]?.id : undefined;

  return {
    now,
    online,
    board,
    /** The cached tasks with unconfirmed presses laid over them — what the rows show. */
    tasks,
    fetching: boardQuery.isFetching,
    views,
    previousViewId,
    nextViewId,
    activeColumn,
    lanes,
    next,
    nextTask,
    nextLane,
    announcement,
    error,
    setFiring,
    setCollapsed,
    ...writes,
    /** First open: no groups and nothing in this view (WF-01 *States*). */
    firstOpen: board.groups.length === 0 && board.tasks.length === 0,
  };
}

/* ========================================================================
 * The writes (FLO-7).
 *
 * ONE MOVE, EVERY CALLER. The menu, `Alt`+arrows, the sheet's selects, *Start*'s
 * undo, *Closed earlier* and — later — the drag all call `moveTask`. It reads
 * the task's PRIOR place from the cache (`{ columnId, groupId, index }` and its
 * firing), splices the cached array so the row moves on the press, sends a
 * PLACE (`toIndex`, never an order number — TD-35), and builds the toast whose
 * *Undo* is `moveTask` back with `restoreFiringStartedAt`. Undo therefore
 * restores lane, column, exact position and firing, by construction.
 *
 * WRITES TO ONE TASK ARE CHAINED, so an *Undo* pressed while the move it undoes
 * is still travelling waits for it and then runs (WF-01 failure states).
 *
 * The local role effects mirror the server's one function: leaving a column
 * ends firing (unless this is an undo bringing it back into the active
 * column), the done column closes, leaving it reopens.
 * ====================================================================== */

type Place = { columnId: string; groupId: string | null; index: number };

function cellTasks(tasks: readonly WorkflowTaskView[], columnId: string, groupId: string | null) {
  return tasks.filter((task) => task.columnId === columnId && task.groupId === groupId);
}

function placeOf(tasks: readonly WorkflowTaskView[], task: WorkflowTaskView): Place {
  return {
    columnId: task.columnId,
    groupId: task.groupId,
    index: cellTasks(tasks, task.columnId, task.groupId).findIndex((other) => other.id === task.id),
  };
}

/** The array with `task` taken out and put back at `index` of its (new) cell. */
function insertAt(tasks: readonly WorkflowTaskView[], task: WorkflowTaskView, index: number): WorkflowTaskView[] {
  const others = tasks.filter((other) => other.id !== task.id);
  const cell = cellTasks(others, task.columnId, task.groupId);
  if (cell.length === 0) return [...others, task];
  const anchor = index < cell.length ? cell[Math.max(0, index)] : undefined;
  const at = anchor === undefined ? others.indexOf(cell[cell.length - 1] as WorkflowTaskView) + 1 : others.indexOf(anchor);
  return [...others.slice(0, at), task, ...others.slice(at)];
}

function useBoardWrites({
  viewId,
  key,
  board,
  tasks,
  views,
  now,
  online,
  setError,
  updateWanted,
}: {
  viewId: string;
  key: { viewId: string };
  board: WorkflowBoardView;
  tasks: WorkflowTaskView[];
  views: ViewList;
  now: Date;
  online: boolean;
  setError: (line: string | null) => void;
  updateWanted: (change: (map: Map<string, Wanted>) => void) => void;
}) {
  const utils = trpc.useUtils();
  const move = trpc.workflow.task.move.useMutation();
  const create = trpc.workflow.task.create.useMutation();
  const update = trpc.workflow.task.update.useMutation();
  const start = trpc.workflow.task.start.useMutation();
  const archive = trpc.workflow.task.archive.useMutation();
  const restore = trpc.workflow.task.restore.useMutation();
  const groupCreate = trpc.workflow.group.create.useMutation();
  const groupRename = trpc.workflow.group.rename.useMutation();
  const groupSetHue = trpc.workflow.group.setHue.useMutation();
  const groupReorder = trpc.workflow.group.reorder.useMutation();
  const groupArchive = trpc.workflow.group.archive.useMutation();
  const groupRestore = trpc.workflow.group.restore.useMutation();
  const pinToday = trpc.workflow.group.pinToday.useMutation();
  const unpinToday = trpc.workflow.group.unpinToday.useMutation();

  // The latest values for callbacks that outlive a render (a toast's Undo).
  const latest = React.useRef({ board, tasks, now });
  latest.current = { board, tasks, now };

  /* ---- per-task write chain ---- */
  const chains = React.useRef(new Map<string, Promise<unknown>>());
  const enqueue = React.useCallback(<T,>(taskId: string, write: () => Promise<T>): Promise<T> => {
    const before = chains.current.get(taskId) ?? Promise.resolve();
    const next = before.catch(() => undefined).then(write);
    chains.current.set(taskId, next);
    return next;
  }, []);

  const patch = React.useCallback(
    (change: (current: WorkflowBoardView) => WorkflowBoardView) => {
      utils.workflow.board.setData(key, (current) => (current === undefined ? current : change(current)));
    },
    [utils, key],
  );

  const settle = React.useCallback(() => {
    // A move can touch another view (Start, Move to view) and Closed earlier.
    void utils.workflow.board.invalidate();
    void utils.workflow.task.listClosed.invalidate();
  }, [utils]);

  const fail = React.useCallback(
    (before: WorkflowBoardView | undefined) => {
      if (before !== undefined) utils.workflow.board.setData(key, before);
      setError(COPY.saveError);
      settle();
    },
    [utils, key, setError, settle],
  );

  const columnsOf = React.useCallback(
    (targetViewId: string): WorkflowColumnView[] =>
      targetViewId === viewId ? latest.current.board.columns : (views.columnsByView[targetViewId] ?? []),
    [viewId, views.columnsByView],
  );

  /* ---------------------------------------------------- moveTask -- */

  type MoveOptions = {
    toast?: boolean;
    /** Undo only: the firing the task had before the move being undone. */
    restoreFiringStartedAt?: Date | null;
    /** The task as it was, when it is not on this board (an undo from elsewhere). */
    snapshot?: WorkflowTaskView;
    /** The destination's view; this one by default. */
    toViewId?: string;
  };

  const moveTask = React.useCallback(
    function moveTask(taskId: string, to: Place, options: MoveOptions = {}): Promise<unknown> {
      if (!online) return Promise.resolve();
      setError(null);
      const { tasks: shown, now: at } = latest.current;
      const before = utils.workflow.board.getData(key);
      const task = shown.find((other) => other.id === taskId) ?? options.snapshot;
      if (task === undefined) return Promise.resolve();
      const prior = shown.some((other) => other.id === taskId) ? placeOf(shown, task) : null;
      const toViewId = options.toViewId ?? viewId;
      const toColumn = columnsOf(toViewId).find((column) => column.id === to.columnId);
      if (toColumn === undefined) return Promise.resolve();

      const columnChanged = task.columnId !== to.columnId;
      const moved: WorkflowTaskView = {
        ...task,
        columnId: to.columnId,
        groupId: to.groupId,
        firingStartedAt: !columnChanged
          ? task.firingStartedAt
          : toColumn.role === "active" && options.restoreFiringStartedAt !== undefined
            ? options.restoreFiringStartedAt
            : null,
        closedAt: !columnChanged ? task.closedAt : toColumn.role === "done" ? (task.closedAt ?? at) : null,
      };

      updateWanted((map) => map.delete(taskId));
      patch((current) => ({
        ...current,
        tasks:
          toViewId === viewId
            ? insertAt(
                current.tasks.some((other) => other.id === taskId) ? current.tasks : [...current.tasks, moved],
                moved,
                to.index,
              )
            : current.tasks.filter((other) => other.id !== taskId),
      }));

      const write = enqueue(taskId, () =>
        move.mutateAsync({
          id: taskId,
          toColumnId: to.columnId,
          toGroupId: to.groupId,
          toIndex: to.index,
          ...(options.restoreFiringStartedAt === undefined
            ? {}
            : { restoreFiringStartedAt: options.restoreFiringStartedAt }),
        }),
      )
        .then(() => settle())
        .catch(() => fail(before));

      if (options.toast && prior !== null && columnChanged) {
        const priorFiring = task.firingStartedAt;
        toastUndo({
          text: toColumn.role === "done" ? COPY.closed : COPY.movedTo(toColumn.name),
          onUndo: () => {
            void moveTask(taskId, prior, { restoreFiringStartedAt: priorFiring, snapshot: moved });
          },
        });
      }
      return write;
    },
    [online, setError, utils, key, viewId, columnsOf, updateWanted, patch, enqueue, move, settle, fail],
  );

  /** `Alt`+`↑`/`↓` — one place within the cell, no toast (it is its own undo). */
  const nudgeTask = React.useCallback(
    (taskId: string, delta: -1 | 1) => {
      const task = latest.current.tasks.find((other) => other.id === taskId);
      if (task === undefined) return;
      const place = placeOf(latest.current.tasks, task);
      const length = cellTasks(latest.current.tasks, task.columnId, task.groupId).length;
      const index = place.index + delta;
      if (index < 0 || index >= length) return;
      void moveTask(taskId, { ...place, index });
    },
    [moveTask],
  );

  /** `Alt`+`←`/`→` and *Move to* — another column, the end of that lane's cell, with a toast. */
  const moveToColumn = React.useCallback(
    (taskId: string, columnId: string, options: { toast?: boolean; toViewId?: string; snapshot?: WorkflowTaskView } = {}) => {
      const task = latest.current.tasks.find((other) => other.id === taskId) ?? options.snapshot;
      if (task === undefined) return;
      const sameView = (options.toViewId ?? viewId) === viewId;
      const end = sameView ? cellTasks(latest.current.tasks, columnId, task.groupId).length : Number.MAX_SAFE_INTEGER;
      void moveTask(taskId, { columnId, groupId: task.groupId, index: end }, { ...options, toast: options.toast ?? true });
    },
    [moveTask, viewId],
  );

  const neighbourColumn = React.useCallback(
    (taskId: string, step: -1 | 1) => {
      const task = latest.current.tasks.find((other) => other.id === taskId);
      if (task === undefined) return;
      const columns = latest.current.board.columns;
      const target = columns[columns.findIndex((column) => column.id === task.columnId) + step];
      if (target !== undefined) moveToColumn(taskId, target.id);
    },
    [moveToColumn],
  );

  /** The sheet's *Group* select — the end of the new lane's cell, same column, no toast. */
  const moveToGroup = React.useCallback(
    (taskId: string, groupId: string | null) => {
      const task = latest.current.tasks.find((other) => other.id === taskId);
      if (task === undefined || task.groupId === groupId) return;
      const end = cellTasks(latest.current.tasks, task.columnId, groupId).length;
      void moveTask(taskId, { columnId: task.columnId, groupId, index: end });
    },
    [moveTask],
  );

  /* ------------------------------------------------- create, edit -- */

  const createTask = React.useCallback(
    (columnId: string, groupId: string | null, title: string) => {
      if (!online) return;
      setError(null);
      const column = latest.current.board.columns.find((other) => other.id === columnId);
      const id = crypto.randomUUID();
      const task: WorkflowTaskView = {
        id,
        title,
        note: null,
        groupId,
        columnId,
        firingStartedAt: null,
        lastReturnedAt: null,
        closedAt: column?.role === "done" ? latest.current.now : null,
      };
      patch((current) => ({ ...current, tasks: insertAt(current.tasks, task, Number.MAX_SAFE_INTEGER) }));
      void enqueue(id, () => create.mutateAsync({ id, viewId, columnId, groupId, title }))
        .then(() => settle())
        .catch(() => {
          patch((current) => ({ ...current, tasks: current.tasks.filter((other) => other.id !== id) }));
          setError(COPY.saveError);
          settle();
        });
    },
    [online, setError, patch, enqueue, create, viewId, settle],
  );

  /** The sheet's text fields. Rejects on failure — the field reverts and says so. */
  const updateTask = React.useCallback(
    async (taskId: string, change: { title?: string; note?: string | null }) => {
      const saved = await enqueue(taskId, () => update.mutateAsync({ id: taskId, ...change }));
      patch((current) => ({
        ...current,
        tasks: current.tasks.map((other) => (other.id === taskId ? { ...other, ...saved, firingStartedAt: other.firingStartedAt } : other)),
      }));
      return saved;
    },
    [enqueue, update, patch],
  );

  /* -------------------------------------------- start, archive -- */

  const startTask = React.useCallback(
    (taskId: string) => {
      if (!online) return;
      setError(null);
      const task = latest.current.tasks.find((other) => other.id === taskId);
      if (task === undefined) return;
      const prior = placeOf(latest.current.tasks, task);
      const before = utils.workflow.board.getData(key);
      patch((current) => ({ ...current, tasks: current.tasks.filter((other) => other.id !== taskId) }));
      void enqueue(taskId, () => start.mutateAsync({ id: taskId }))
        .then((result) => {
          settle();
          toastUndo({
            text: COPY.startedIn(result.view.name),
            onUndo: () => {
              void moveTask(taskId, prior, { restoreFiringStartedAt: null, snapshot: { ...task } });
            },
          });
        })
        .catch(() => fail(before));
    },
    [online, setError, utils, key, patch, enqueue, start, settle, moveTask, fail],
  );

  const archiveTask = React.useCallback(
    (taskId: string) => {
      if (!online) return;
      setError(null);
      const task = latest.current.tasks.find((other) => other.id === taskId);
      if (task === undefined) return;
      const prior = placeOf(latest.current.tasks, task);
      const before = utils.workflow.board.getData(key);
      updateWanted((map) => map.delete(taskId));
      patch((current) => ({ ...current, tasks: current.tasks.filter((other) => other.id !== taskId) }));
      void enqueue(taskId, () => archive.mutateAsync({ id: taskId }))
        .then(() => settle())
        .catch(() => fail(before));
      toastUndo({
        text: COPY.archived,
        onUndo: () => {
          patch((current) => ({ ...current, tasks: insertAt(current.tasks, task, prior.index) }));
          void enqueue(taskId, () =>
            restore.mutateAsync({ id: taskId, toIndex: prior.index, restoreFiringStartedAt: task.firingStartedAt }),
          )
            .then(() => settle())
            .catch(() => fail(undefined));
        },
      });
    },
    [online, setError, utils, key, updateWanted, patch, enqueue, archive, restore, settle, fail],
  );

  /* ------------------------------------------------------ groups -- */

  const patchGroups = React.useCallback(
    (change: (groups: WorkflowGroupView[]) => WorkflowGroupView[]) =>
      patch((current) => ({ ...current, groups: change(current.groups) })),
    [patch],
  );

  /** *Add a group* — at the end, the next hue; resolves with the new lane. */
  const createGroup = React.useCallback(
    async (name: string): Promise<WorkflowGroupView | null> => {
      if (!online) return null;
      setError(null);
      try {
        const group = await groupCreate.mutateAsync({ name });
        patchGroups((groups) => [...groups, group]);
        settle();
        return group;
      } catch {
        setError(COPY.saveError);
        return null;
      }
    },
    [online, setError, groupCreate, patchGroups, settle],
  );

  const groupWrite = React.useCallback(
    (optimistic: (groups: WorkflowGroupView[]) => WorkflowGroupView[], write: () => Promise<unknown>) => {
      if (!online) return;
      setError(null);
      const before = utils.workflow.board.getData(key);
      patchGroups(optimistic);
      write()
        .then(() => settle())
        .catch(() => fail(before));
    },
    [online, setError, utils, key, patchGroups, settle, fail],
  );

  const renameGroup = React.useCallback(
    (groupId: string, name: string) =>
      groupWrite(
        (groups) => groups.map((group) => (group.id === groupId ? { ...group, name } : group)),
        () => groupRename.mutateAsync({ id: groupId, name }),
      ),
    [groupWrite, groupRename],
  );

  const setGroupHue = React.useCallback(
    (groupId: string, hue: WorkflowGroupView["hue"]) =>
      groupWrite(
        (groups) => groups.map((group) => (group.id === groupId ? { ...group, hue } : group)),
        () => groupSetHue.mutateAsync({ id: groupId, hue }),
      ),
    [groupWrite, groupSetHue],
  );

  /**
   * *Move up* / *Move down* — the usual order among UNPINNED lanes (a pinned
   * lane holds its place, UX §3.5). The full id list is sent, as every reorder.
   */
  const moveGroup = React.useCallback(
    (groupId: string, step: -1 | 1) => {
      const { groups, pinnedGroupIds } = latest.current.board;
      const pinned = new Set(pinnedGroupIds);
      const unpinned = groups.filter((group) => !pinned.has(group.id));
      const from = unpinned.findIndex((group) => group.id === groupId);
      const swapWith = unpinned[from + step];
      if (from < 0 || swapWith === undefined) return;
      const ids = groups.map((group) => group.id);
      const a = ids.indexOf(groupId);
      const b = ids.indexOf(swapWith.id);
      [ids[a], ids[b]] = [ids[b] as string, ids[a] as string];
      const byId = new Map(groups.map((group) => [group.id, group]));
      groupWrite(
        () => ids.map((id) => byId.get(id) as WorkflowGroupView),
        () => groupReorder.mutateAsync({ ids }),
      );
    },
    [groupWrite, groupReorder],
  );

  /** *First today* / *Back to usual order* (W9) — today's pins, newest first. */
  const setFirstToday = React.useCallback(
    (groupId: string, pinned: boolean) => {
      if (!online) return;
      setError(null);
      const before = utils.workflow.board.getData(key);
      patch((current) => ({
        ...current,
        pinnedGroupIds: pinned
          ? [groupId, ...current.pinnedGroupIds.filter((id) => id !== groupId)]
          : current.pinnedGroupIds.filter((id) => id !== groupId),
      }));
      (pinned ? pinToday : unpinToday)
        .mutateAsync({ id: groupId })
        .then((pins) => {
          patch((current) => ({ ...current, pinnedGroupIds: pins }));
          settle();
        })
        .catch(() => fail(before));
    },
    [online, setError, utils, key, patch, pinToday, unpinToday, settle, fail],
  );

  /**
   * *Archive group* (UX Dialogs). Its tasks go to the end of each column's *No
   * group* cell, in order. An empty lane archives at once with *Undo*, which
   * restores it and then its place in the usual order.
   */
  const archiveGroup = React.useCallback(
    (groupId: string) => {
      if (!online) return;
      setError(null);
      const before = utils.workflow.board.getData(key);
      const order = latest.current.board.groups.map((group) => group.id);
      const holding = latest.current.tasks.some((task) => task.groupId === groupId);
      patch((current) => {
        let next = current.tasks;
        for (const task of current.tasks.filter((other) => other.groupId === groupId)) {
          next = insertAt(next, { ...task, groupId: null }, Number.MAX_SAFE_INTEGER);
        }
        return { ...current, tasks: next, groups: current.groups.filter((group) => group.id !== groupId) };
      });
      groupArchive
        .mutateAsync({ id: groupId })
        .then(() => settle())
        .catch(() => fail(before));
      if (!holding) {
        toastUndo({
          text: COPY.archived,
          onUndo: () => {
            void groupRestore
              .mutateAsync({ id: groupId })
              .then(() => groupReorder.mutateAsync({ ids: order }))
              .then(() => settle())
              .catch(() => fail(undefined));
          },
        });
      }
    },
    [online, setError, utils, key, patch, groupArchive, groupRestore, groupReorder, settle, fail],
  );

  return {
    moveTask,
    nudgeTask,
    moveToColumn,
    neighbourColumn,
    moveToGroup,
    createTask,
    updateTask,
    startTask,
    archiveTask,
    createGroup,
    renameGroup,
    setGroupHue,
    moveGroup,
    setFirstToday,
    archiveGroup,
  };
}
