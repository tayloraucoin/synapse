"use client";

import * as React from "react";

import type {
  WorkflowBoardView,
  WorkflowColumnView,
  WorkflowGroupView,
  WorkflowNext,
  WorkflowTaskView,
} from "@syn/types";
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

  /* ---------------------------------------------------- the views -- */

  const tabIndex = views.tabs.findIndex((tab) => tab.id === viewId);
  const previousViewId = tabIndex > 0 ? views.tabs[tabIndex - 1]?.id : undefined;
  const nextViewId = tabIndex >= 0 ? views.tabs[tabIndex + 1]?.id : undefined;

  return {
    now,
    online,
    board,
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
    /** First open: no groups and nothing in this view (WF-01 *States*). */
    firstOpen: board.groups.length === 0 && board.tasks.length === 0,
  };
}
