"use client";

import { useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import * as React from "react";

import type { WorkflowBoardView, WorkflowColumnView, WorkflowTaskView } from "@syn/types";
import {
  Board,
  BoardCell,
  BoardLane,
  Button,
  ColorSwatchRow,
  ConfirmDialog,
  HelperText,
  InlineAddRow,
  Input,
  LANE_HEADER_COPY,
  LaneHeader,
  NextStrip,
  type NextStripValue,
  Popover,
  PopoverAnchor,
  PopoverContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TaskRow,
  Text,
  useIsWide,
} from "@syn/ui";
import { WORKFLOW_NAME_MAX, WORKFLOW_TITLE_MAX } from "@syn/constants";

import { useSheet } from "@/lib/hooks/use-sheet";
import { workflowViewRoute } from "@/lib/routes";
import { trpc, type RouterOutputs } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { ClosedEarlier } from "./closed-earlier";
import { LaneMenu } from "./lane-menu";
import { TaskMenu } from "./task-menu";
import { TaskSheet } from "./task-sheet";
import { NO_GROUP, useWorkflowBoard } from "./use-workflow-board";
import { WorkflowTitle } from "./workflow-title";

type ViewList = RouterOutputs["workflow"]["view"]["list"];

const ROW = "[data-row-main]";

/** Does this event target take typed characters? (as the global shortcuts ask) */
function isEditable(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  return (
    target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"], [role="alertdialog"]') !==
    null
  );
}

function rowVariant(column: WorkflowColumnView): "active" | "plain" | "closed" {
  if (column.role === "active") return "active";
  if (column.role === "done") return "closed";
  return "plain";
}

type FocusTarget = { kind: "task"; id: string } | { kind: "add"; laneKey: string; columnId: string };
type FocusRequest = FocusTarget & { seq: number };

/**
 * WF-01, the board (Workflow UX v0.1 §4; FLO-6, FLO-7) — composed from FLO-4's
 * components; no row markup is written here.
 *
 * THE KEYBOARD GRID. One row in the board is in the tab order (roving
 * `tabIndex` on each row's main button); the toggles keep their own stops, so
 * everything is reachable by `Tab` alone too. With a row focused: `↑` `↓` walk
 * its column across lanes; `←` `→` move to the same lane's neighbouring column
 * — the nearest non-empty cell in that direction, at the same position or the
 * cell's last row; with none, focus stays — `Space` presses the row's toggle;
 * `Enter` opens it; `Alt`+`↑` `↓` move it one place in its cell and `Alt`+`←`
 * `→` one column, focus staying on it (W12). Anywhere on the board: `g` goes
 * to next, `[` `]` the previous and next view; `n` arrives as `?add=1` from the
 * shell and opens the focused lane's first add row. None of them fires while a
 * field or a dialog has focus.
 */
export function WorkflowBoard({
  viewId,
  initialBoard,
  initialViews,
}: {
  viewId: string;
  initialBoard: WorkflowBoardView;
  initialViews: ViewList;
}) {
  const router = useRouter();
  const isWide = useIsWide();
  const utils = trpc.useUtils();
  const taskSheet = useSheet("task");
  const [addParam, setAddParam] = useQueryState("add", parseAsString.withOptions({ history: "replace" }));
  const regionRef = React.useRef<HTMLDivElement>(null);
  const b = useWorkflowBoard(viewId, initialBoard, initialViews);

  const { board, lanes, next, nextTask, nextLane } = b;
  const columnName = (columnId: string) => board.columns.find((column) => column.id === columnId)?.name ?? "";
  const groupNameOf = (groupId: string | null) => board.groups.find((group) => group.id === groupId)?.name ?? null;
  const firstColumn = board.columns[0];
  const hasActiveColumn = b.activeColumn !== undefined;
  const otherViews = b.views.tabs.filter((tab) => tab.id !== viewId);

  /* ------------------------------------------------- the strip, the title -- */

  const strip: NextStripValue =
    next.kind === "task" && nextTask !== undefined
      ? { kind: "task", groupName: nextLane?.group?.name ?? null, title: nextTask.title }
      : next.kind === "all_firing"
        ? { kind: "all_firing" }
        : null;

  const tabTitle =
    next.kind === "task" && nextTask !== undefined
      ? COPY.tabTitleNext(nextTask.title)
      : next.kind === "all_firing"
        ? COPY.tabTitleAllFiring
        : COPY.tabTitleDefault;

  /* ------------------------------------------------------------- focus -- */

  const [focusRequest, setFocusRequest] = React.useState<FocusRequest | null>(null);
  const requestFocus = React.useCallback((request: FocusTarget) => {
    setFocusRequest({ ...request, seq: Date.now() });
  }, []);

  React.useEffect(() => {
    if (focusRequest === null || focusRequest.kind !== "task") return;
    const row = regionRef.current?.querySelector<HTMLElement>(`[data-task-id="${focusRequest.id}"] ${ROW}`);
    if (row === null || row === undefined) return;
    row.scrollIntoView({ block: "nearest" });
    row.focus();
  }, [focusRequest, lanes]);

  const goToNext = React.useCallback(() => {
    if (nextTask === undefined || nextLane === undefined) return;
    if (nextLane.collapsed) b.setCollapsed(nextLane.key, false);
    requestFocus({ kind: "task", id: nextTask.id });
  }, [nextTask, nextLane, b, requestFocus]);

  /**
   * Where focus goes when a task leaves its cell (archive, another view): the
   * next row in the cell, else the previous, else the cell's add row (WF-01).
   */
  const focusAfterLeaving = React.useCallback(
    (task: WorkflowTaskView) => {
      const laneKey = task.groupId ?? NO_GROUP;
      const cell = lanes.find((lane) => lane.key === laneKey)?.cells.get(task.columnId) ?? [];
      const index = cell.findIndex((other) => other.id === task.id);
      const neighbour = cell[index + 1] ?? cell[index - 1];
      if (neighbour !== undefined) requestFocus({ kind: "task", id: neighbour.id });
      else requestFocus({ kind: "add", laneKey, columnId: task.columnId });
    },
    [lanes, requestFocus],
  );

  /* -------------------------------------------------------- the add rows -- */

  const [openAdd, setOpenAdd] = React.useState<{ laneKey: string; columnId: string } | null>(null);
  const [groupAddOpen, setGroupAddOpen] = React.useState(false);

  React.useEffect(() => {
    if (focusRequest?.kind === "add") setOpenAdd({ laneKey: focusRequest.laneKey, columnId: focusRequest.columnId });
  }, [focusRequest]);

  // `n` from the shell (TD-44): `?add=1` opens the focused lane's first add row
  // (the first lane's when nothing is focused), then clears without a history entry.
  React.useEffect(() => {
    if (addParam === null) return;
    void setAddParam(null);
    if (!b.online || firstColumn === undefined) return;
    const section = document.activeElement?.closest("section");
    const sections = Array.from(regionRef.current?.querySelectorAll("section") ?? []);
    const lane = lanes[section ? sections.indexOf(section) : -1] ?? lanes[0];
    if (lane !== undefined) setOpenAdd({ laneKey: lane.key, columnId: firstColumn.id });
  }, [addParam, setAddParam, b.online, firstColumn, lanes]);

  /* ---------------------------------------------------- lane editing -- */

  const [renaming, setRenaming] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [colourFor, setColourFor] = React.useState<string | null>(null);
  const [archivingGroup, setArchivingGroup] = React.useState<{ id: string; name: string } | null>(null);

  /* ---------------------------------------------------- board-wide keys -- */

  const latest = React.useRef({
    goToNext,
    previous: b.previousViewId,
    next: b.nextViewId,
    nudgeTask: b.nudgeTask,
    neighbourColumn: b.neighbourColumn,
    requestFocus,
  });
  latest.current = {
    goToNext,
    previous: b.previousViewId,
    next: b.nextViewId,
    nudgeTask: b.nudgeTask,
    neighbourColumn: b.neighbourColumn,
    requestFocus,
  };

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isEditable(event.target)) return;
      const { goToNext: go, previous, next: following } = latest.current;
      if (event.key === "g") go();
      else if (event.key === "[" && previous !== undefined) router.push(workflowViewRoute(previous));
      else if (event.key === "]" && following !== undefined) router.push(workflowViewRoute(following));
      else return;
      event.preventDefault();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router]);

  /* ----------------------------------------------- the roving row focus -- */

  React.useEffect(() => {
    const region = regionRef.current;
    if (region === null) return;
    const root: HTMLElement = region;
    const rows = () => Array.from(root.querySelectorAll<HTMLElement>(ROW));

    // A button is natively `tabIndex` 0, so the seed reads the ATTRIBUTE: one
    // row carries `tabindex="0"`, every other (including a row that just
    // arrived) carries `-1`.
    function seed(): void {
      const all = rows();
      if (all.length === 0) return;
      const current = all.find((row) => row.getAttribute("tabindex") === "0") ?? all[0];
      for (const row of all) {
        const wanted = row === current ? "0" : "-1";
        if (row.getAttribute("tabindex") !== wanted) row.setAttribute("tabindex", wanted);
      }
    }

    function focusRow(from: HTMLElement, to: HTMLElement | undefined): void {
      if (to === undefined) return;
      from.tabIndex = -1;
      to.tabIndex = 0;
      to.focus();
      to.scrollIntoView({ block: "nearest", inline: "nearest" });
    }

    /** A row's lane, its column's position, and its cell's rows. */
    function place(row: HTMLElement) {
      const cell = row.closest("ul")?.parentElement ?? null;
      const grid = cell?.parentElement ?? null;
      const lane = grid?.parentElement ?? null;
      const column = grid === null || cell === null ? -1 : Array.from(grid.children).indexOf(cell);
      const cellRows = cell === null ? [] : Array.from(cell.querySelectorAll<HTMLElement>(ROW));
      return { lane, column, cellRows, index: cellRows.indexOf(row) };
    }

    function cellRowsAt(lane: Element, column: number): HTMLElement[] {
      const grid = Array.from(lane.children).find((child) => child.classList.contains("grid"));
      const cell = grid?.children[column];
      return cell === undefined ? [] : Array.from(cell.querySelectorAll<HTMLElement>(ROW));
    }

    function onKeyDown(event: KeyboardEvent): void {
      if (event.metaKey || event.ctrlKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(ROW)) return;

      // `Alt`+arrows move the task itself (W12); focus stays on it.
      if (event.altKey) {
        const taskId = target.closest("[data-task-id]")?.getAttribute("data-task-id");
        if (taskId === null || taskId === undefined) return;
        const actions = latest.current;
        if (event.key === "ArrowUp") actions.nudgeTask(taskId, -1);
        else if (event.key === "ArrowDown") actions.nudgeTask(taskId, 1);
        else if (event.key === "ArrowLeft") actions.neighbourColumn(taskId, -1);
        else if (event.key === "ArrowRight") actions.neighbourColumn(taskId, 1);
        else return;
        event.preventDefault();
        actions.requestFocus({ kind: "task", id: taskId });
        return;
      }

      const { lane, column, cellRows, index } = place(target);
      if (lane === null || column < 0) return;
      const lanesInOrder = Array.from(root.querySelectorAll("section"));
      const laneIndex = lanesInOrder.indexOf(lane as HTMLElement);

      switch (event.key) {
        case "ArrowDown": {
          if (index + 1 < cellRows.length) focusRow(target, cellRows[index + 1]);
          else
            for (const below of lanesInOrder.slice(laneIndex + 1)) {
              const found = cellRowsAt(below, column);
              if (found.length > 0) {
                focusRow(target, found[0]);
                break;
              }
            }
          break;
        }
        case "ArrowUp": {
          if (index > 0) focusRow(target, cellRows[index - 1]);
          else
            for (const above of lanesInOrder.slice(0, laneIndex).reverse()) {
              const found = cellRowsAt(above, column);
              if (found.length > 0) {
                focusRow(target, found[found.length - 1]);
                break;
              }
            }
          break;
        }
        case "ArrowRight":
        case "ArrowLeft": {
          const step = event.key === "ArrowRight" ? 1 : -1;
          const width = Array.from(lane.children).find((child) => child.classList.contains("grid"))?.children.length ?? 0;
          for (let other = column + step; other >= 0 && other < width; other += step) {
            const found = cellRowsAt(lane, other);
            if (found.length > 0) {
              focusRow(target, found[Math.min(index, found.length - 1)]);
              break;
            }
          }
          break;
        }
        case " ": {
          target.closest("[data-task-id]")?.querySelector<HTMLButtonElement>("button[aria-pressed]:not(:disabled)")?.click();
          break;
        }
        default:
          return;
      }
      event.preventDefault();
    }

    function onFocusIn(event: FocusEvent): void {
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(ROW)) return;
      for (const row of rows()) row.tabIndex = row === target ? 0 : -1;
    }

    seed();
    const observer = new MutationObserver(seed);
    observer.observe(root, { childList: true, subtree: true });
    root.addEventListener("keydown", onKeyDown);
    root.addEventListener("focusin", onFocusIn);
    return () => {
      observer.disconnect();
      root.removeEventListener("keydown", onKeyDown);
      root.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  /* --------------------------------------------------------- the sheet -- */

  const closedData = utils.workflow.task.listClosed.getData({ viewId });
  const sheetTask =
    taskSheet.id === null
      ? undefined
      : (b.tasks.find((task) => task.id === taskSheet.id) ?? closedData?.tasks.find((task) => task.id === taskSheet.id));

  // A task that no longer exists (archived elsewhere, a stale link) closes the sheet.
  React.useEffect(() => {
    if (taskSheet.open && taskSheet.id !== null && sheetTask === undefined && !b.fetching) taskSheet.close();
  }, [taskSheet, sheetTask, b.fetching]);

  /* --------------------------------------------------------------- render -- */

  const tabs = b.views.tabs;
  // Compact shows one column — the view's first, until FLO-8's column tabs.
  const visibleColumnId = isWide ? undefined : firstColumn?.id;
  const pinned = new Set(board.pinnedGroupIds);
  const unpinned = board.groups.filter((group) => !pinned.has(group.id));

  return (
    <div className="flex min-w-0 flex-col gap-(--space-3)">
      <WorkflowTitle title={tabTitle} />

      <div className="flex min-w-0 flex-col gap-(--space-2) wide:flex-row wide:items-center wide:justify-between">
        {/* The tabs scroll sideways when they overflow (compact); the padding keeps the active line inside. */}
        <div className="min-w-0 overflow-x-auto pb-(--space-2)">
          <Tabs value={viewId} activationMode="manual" onValueChange={(id) => router.push(workflowViewRoute(id))}>
            <TabsList variant="line" aria-label={COPY.viewsLabel} className="justify-start">
              {tabs.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id} className="flex-none">
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <NextStrip next={strip} onGo={goToNext} />
      </div>

      {b.error === null ? null : <HelperText error>{b.error}</HelperText>}

      {b.firstOpen ? (
        <div className="flex flex-col gap-(--space-3)">
          <Text as="p" variant="body" tone="secondary">
            {COPY.nothingInProgress}
          </Text>
          <div className="flex flex-wrap gap-(--space-2)">
            <Button
              variant="ghost"
              disabled={!b.online || firstColumn === undefined}
              onClick={() => firstColumn !== undefined && setOpenAdd({ laneKey: NO_GROUP, columnId: firstColumn.id })}
            >
              {COPY.addTask}
            </Button>
            <Button variant="ghost" disabled={!b.online} onClick={() => setGroupAddOpen(true)}>
              {COPY.addGroup}
            </Button>
          </div>
        </div>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {b.announcement}
      </p>

      <div ref={regionRef} className="min-w-0">
        <Board columns={board.columns} visibleColumnId={visibleColumnId}>
          {lanes.map((lane) => {
            const name = lane.group?.name ?? LANE_HEADER_COPY.noGroup;
            const group = lane.group;
            const unpinnedIndex = group === null ? -1 : unpinned.findIndex((other) => other.id === group.id);

            const header =
              group !== null && renaming === group.id ? (
                <div className="flex min-h-(--row-min) items-center px-(--space-2)">
                  <Input
                    autoFocus
                    aria-label={COPY.rename}
                    value={renameValue}
                    maxLength={WORKFLOW_NAME_MAX}
                    onChange={(event) => setRenameValue(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      } else if (event.key === "Escape") {
                        event.preventDefault();
                        event.stopPropagation();
                        setRenaming(null);
                      }
                    }}
                    onBlur={() => {
                      const trimmed = renameValue.trim();
                      // An emptied name restores the old one (WF-01 failure states).
                      if (trimmed !== "" && trimmed !== group.name) b.renameGroup(group.id, trimmed);
                      setRenaming(null);
                    }}
                  />
                </div>
              ) : (
                <Popover
                  open={group !== null && colourFor === group.id}
                  onOpenChange={(open) => {
                    if (!open) setColourFor(null);
                  }}
                >
                  <PopoverAnchor asChild>
                    <div>
                      <LaneHeader
                        name={name}
                        hue={group?.hue ?? null}
                        plain={group === null}
                        collapsed={lane.collapsed}
                        onCollapsedChange={(collapsed) => b.setCollapsed(lane.key, collapsed)}
                        disabled={!b.online && group !== null}
                        firstToday={lane.firstToday}
                        hasFiring={lane.hasFiring}
                        hasNext={lane.hasNext}
                        menu={
                          group === null ? undefined : (
                            <LaneMenu
                              name={group.name}
                              pinned={lane.firstToday}
                              canMoveUp={unpinnedIndex > 0}
                              canMoveDown={unpinnedIndex >= 0 && unpinnedIndex < unpinned.length - 1}
                              disabled={!b.online}
                              onFirstToday={(pin) => b.setFirstToday(group.id, pin)}
                              onRename={() => {
                                setRenameValue(group.name);
                                setRenaming(group.id);
                              }}
                              onColour={() => setColourFor(group.id)}
                              onMoveUp={() => b.moveGroup(group.id, -1)}
                              onMoveDown={() => b.moveGroup(group.id, 1)}
                              onArchive={() => {
                                const holding = b.tasks.some((task) => task.groupId === group.id);
                                if (holding) setArchivingGroup({ id: group.id, name: group.name });
                                else b.archiveGroup(group.id);
                              }}
                            />
                          )
                        }
                      />
                    </div>
                  </PopoverAnchor>
                  {group === null ? null : (
                    <PopoverContent align="start" className="w-auto">
                      <ColorSwatchRow
                        label={COPY.colour}
                        value={group.hue}
                        onChange={(hue) => {
                          if (hue !== null && hue !== "none") b.setGroupHue(group.id, hue);
                          setColourFor(null);
                        }}
                      />
                    </PopoverContent>
                  )}
                </Popover>
              );

            return (
              <BoardLane key={lane.key} label={name} collapsed={lane.collapsed} header={header}>
                {board.columns.map((column, columnIndex) => (
                  <BoardCell
                    key={column.id}
                    columnId={column.id}
                    label={`${name}, ${column.name}`}
                    footer={
                      <InlineAddRow
                        label={COPY.addTask}
                        placeholder={COPY.taskPlaceholder}
                        maxLength={WORKFLOW_TITLE_MAX}
                        keepOpen
                        disabled={!b.online}
                        visibility={columnIndex === 0 ? "always" : "lane-focus"}
                        open={openAdd?.laneKey === lane.key && openAdd.columnId === column.id}
                        onOpenChange={(open) =>
                          setOpenAdd(open ? { laneKey: lane.key, columnId: column.id } : null)
                        }
                        onSubmit={(title) => b.createTask(column.id, group?.id ?? null, title)}
                      />
                    }
                  >
                    {(lane.cells.get(column.id) ?? []).map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        variant={rowVariant(column)}
                        isNext={next.kind === "task" && next.taskId === task.id}
                        now={b.now}
                        groupName={group?.name ?? null}
                        columnName={columnName(task.columnId)}
                        onOpen={() => taskSheet.openWith(task.id)}
                        onFiringChange={
                          column.role === "active" && b.online
                            ? (firing) => b.setFiring(task.id, firing)
                            : undefined
                        }
                        menu={
                          <TaskMenu
                            title={task.title}
                            columnId={task.columnId}
                            columns={board.columns}
                            otherViews={otherViews}
                            columnsByView={b.views.columnsByView}
                            canStart={!hasActiveColumn}
                            disabled={!b.online}
                            onOpen={() => taskSheet.openWith(task.id)}
                            onMoveTo={(columnId) => b.moveToColumn(task.id, columnId)}
                            onMoveToView={(toViewId, columnId) => {
                              focusAfterLeaving(task);
                              b.moveToColumn(task.id, columnId, { toViewId });
                            }}
                            onStart={() => {
                              focusAfterLeaving(task);
                              b.startTask(task.id);
                            }}
                            onArchive={() => {
                              focusAfterLeaving(task);
                              b.archiveTask(task.id);
                            }}
                          />
                        }
                      />
                    ))}
                  </BoardCell>
                ))}
              </BoardLane>
            );
          })}
        </Board>

        <InlineAddRow
          label={COPY.addGroup}
          placeholder={COPY.groupPlaceholder}
          maxLength={WORKFLOW_NAME_MAX}
          disabled={!b.online}
          open={groupAddOpen}
          onOpenChange={setGroupAddOpen}
          onSubmit={(name) => {
            void b.createGroup(name).then((group) => {
              // Focus moves into the new lane's first cell's add row (WF-01).
              if (group !== null && firstColumn !== undefined) {
                setOpenAdd({ laneKey: group.id, columnId: firstColumn.id });
              }
            });
          }}
        />

        <ClosedEarlier
          viewId={viewId}
          columns={board.columns}
          groupNameOf={groupNameOf}
          now={b.now}
          online={b.online}
          onOpen={(task) => taskSheet.openWith(task.id)}
          onMoveTo={(task, columnId) => b.moveToColumn(task.id, columnId, { snapshot: task })}
        />
      </div>

      <TaskSheet
        open={taskSheet.open}
        task={sheetTask}
        groups={board.groups}
        columns={board.columns}
        now={b.now}
        online={b.online}
        onClose={taskSheet.close}
        updateTask={b.updateTask}
        onFiringChange={(firing) => sheetTask !== undefined && b.setFiring(sheetTask.id, firing)}
        onMoveToGroup={(groupId) => sheetTask !== undefined && b.moveToGroup(sheetTask.id, groupId)}
        onMoveToColumn={(columnId) =>
          sheetTask !== undefined && b.moveToColumn(sheetTask.id, columnId, { toast: false, snapshot: sheetTask })
        }
        onArchive={() => {
          if (sheetTask === undefined) return;
          taskSheet.close();
          b.archiveTask(sheetTask.id);
        }}
      />

      <ConfirmDialog
        open={archivingGroup !== null}
        onOpenChange={(open) => {
          if (!open) setArchivingGroup(null);
        }}
        title={archivingGroup === null ? "" : COPY.archiveGroupTitle(archivingGroup.name)}
        description={COPY.archiveGroupBody}
        confirmLabel={COPY.archive}
        cancelLabel={COPY.cancel}
        onConfirm={() => {
          if (archivingGroup !== null) b.archiveGroup(archivingGroup.id);
          setArchivingGroup(null);
        }}
      />
    </div>
  );
}
