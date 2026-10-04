"use client";

import { useRouter } from "next/navigation";
import * as React from "react";

import type { WorkflowBoardView, WorkflowColumnView } from "@syn/types";
import {
  Board,
  BoardCell,
  BoardLane,
  HelperText,
  LANE_HEADER_COPY,
  LaneHeader,
  NextStrip,
  type NextStripValue,
  Tabs,
  TabsList,
  TabsTrigger,
  TaskRow,
  Text,
  useIsWide,
} from "@syn/ui";

import { useSheet } from "@/lib/hooks/use-sheet";
import { workflowViewRoute } from "@/lib/routes";
import type { RouterOutputs } from "@/lib/trpc/client";

import { WORKFLOW_COPY as COPY } from "../../_components/copy";
import { useWorkflowBoard } from "./use-workflow-board";
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

/**
 * WF-01, the board (Workflow UX v0.1 §4; FLO-6) — composed from FLO-4's
 * components; no row markup is written here.
 *
 * THE KEYBOARD GRID. One row in the board is in the tab order (roving
 * `tabIndex` on each row's main button); the toggles keep their own stops, so
 * everything is reachable by `Tab` alone too. With a row focused: `↑` `↓` walk
 * its column across lanes; `←` `→` move to the same lane's neighbouring column
 * — the nearest non-empty cell in that direction, at the same position or the
 * cell's last row; with none, focus stays — and `Space` presses the row's
 * toggle. Anywhere on the board: `g` goes to next (the strip does the same),
 * `[` `]` the previous and next view. None of them fires while a field or a
 * dialog has focus, or with a modifier held.
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
  const taskSheet = useSheet("task");
  const regionRef = React.useRef<HTMLDivElement>(null);
  const b = useWorkflowBoard(viewId, initialBoard, initialViews);

  const { board, lanes, next, nextTask, nextLane } = b;
  const columnName = (columnId: string) => board.columns.find((column) => column.id === columnId)?.name ?? "";

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

  /* ---------------------------------------------------------- go to next -- */

  const [focusRequest, setFocusRequest] = React.useState<{ id: string; seq: number } | null>(null);

  const goToNext = React.useCallback(() => {
    if (nextTask === undefined || nextLane === undefined) return;
    if (nextLane.collapsed) b.setCollapsed(nextLane.key, false);
    setFocusRequest({ id: nextTask.id, seq: Date.now() });
  }, [nextTask, nextLane, b]);

  // After the lane has opened, so the row exists to receive focus.
  React.useEffect(() => {
    if (focusRequest === null) return;
    const row = regionRef.current?.querySelector<HTMLElement>(`[data-task-id="${focusRequest.id}"] ${ROW}`);
    if (row === null || row === undefined) return;
    row.scrollIntoView({ block: "nearest" });
    row.focus();
  }, [focusRequest, lanes]);

  /* ---------------------------------------------------- board-wide keys -- */

  const latest = React.useRef({ goToNext, previous: b.previousViewId, next: b.nextViewId });
  latest.current = { goToNext, previous: b.previousViewId, next: b.nextViewId };

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
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (!(target instanceof HTMLElement) || !target.matches(ROW)) return;
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

  /* --------------------------------------------------------------- render -- */

  const tabs = b.views.tabs;
  // Compact shows one column — the view's first, until FLO-8's column tabs.
  const visibleColumnId = isWide ? undefined : board.columns[0]?.id;

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
        <Text as="p" variant="body" tone="secondary">
          {COPY.nothingInProgress}
        </Text>
      ) : null}

      <p aria-live="polite" className="sr-only">
        {b.announcement}
      </p>

      <div ref={regionRef} className="min-w-0">
        <Board columns={board.columns} visibleColumnId={visibleColumnId}>
          {lanes.map((lane) => {
            const name = lane.group?.name ?? LANE_HEADER_COPY.noGroup;
            return (
              <BoardLane
                key={lane.key}
                label={name}
                collapsed={lane.collapsed}
                header={
                  <LaneHeader
                    name={name}
                    hue={lane.group?.hue ?? null}
                    plain={lane.group === null}
                    collapsed={lane.collapsed}
                    onCollapsedChange={(collapsed) => b.setCollapsed(lane.key, collapsed)}
                    disabled={!b.online && lane.group !== null}
                    firstToday={lane.firstToday}
                    hasFiring={lane.hasFiring}
                    hasNext={lane.hasNext}
                  />
                }
              >
                {board.columns.map((column) => (
                  <BoardCell key={column.id} columnId={column.id} label={`${name}, ${column.name}`}>
                    {(lane.cells.get(column.id) ?? []).map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        variant={rowVariant(column)}
                        isNext={next.kind === "task" && next.taskId === task.id}
                        now={b.now}
                        groupName={lane.group?.name ?? null}
                        columnName={columnName(task.columnId)}
                        onOpen={() => taskSheet.openWith(task.id)}
                        onFiringChange={
                          column.role === "active" && b.online
                            ? (firing) => b.setFiring(task.id, firing)
                            : undefined
                        }
                      />
                    ))}
                  </BoardCell>
                ))}
              </BoardLane>
            );
          })}
        </Board>
      </div>
    </div>
  );
}
