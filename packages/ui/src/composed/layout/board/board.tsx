/**
 * Board — the grid of a Workflow view: columns across, lanes down (Workflow
 * UX v0.1 §3.1, WF-01, §9; TD-43).
 *
 * STATIC. It arranges what it is given and owns no data, no order and no drag:
 * the caller renders `BoardLane`s in today's order, each with its `BoardCell`s,
 * each with its rows. FLO-9 adds a `DndContext` inside `Board` without
 * changing a caller; until then nothing here moves.
 *
 * THE TRACKS. One template, set once on the board as `--board-template` and
 * read by the heads row and every lane's cells row, so the columns line up
 * without a table: the first track `minmax(--board-col-wide, 1.5fr)`, the rest
 * `minmax(--board-col, 1fr)`. The first column is the wide, pinned one,
 * whatever its role (Vesper's ruling at authoring).
 *
 * WIDE. Every column. When the window is narrower than the tracks need, the
 * lanes scroll sideways inside the board's own region; the page never does.
 * The first column stays pinned at the left edge (`sticky left-0` on paper,
 * so rows sliding beneath do not show through). The column heads sit in their
 * own row OUTSIDE the scrolling region — a sideways scroller is also a
 * vertical scroll container, which would stop the heads sticking to the page
 * top — and their sideways position follows the lanes'. Lane heads span the
 * visible width (container units) and stay in view while the cells scroll.
 *
 * COMPACT. `visibleColumnId` set means one column at a time: only that
 * column's head and cells render, in one full-width track. A value naming no
 * column falls back to the first.
 *
 * SEMANTICS. Lanes of lists, not an ARIA grid: each `BoardLane` is a `region`
 * named by its group, each `BoardCell` a `list` named *{Group}, {Column}*,
 * each row a `listitem`. Column heads are text. Nothing here shows a tally of
 * tasks, anywhere.
 */
"use client";

import type { WorkflowColumnView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Skeleton } from "../../../primitives/display/skeleton";
import { Text } from "../../../primitives/typography/text";
import { TaskRowSkeleton } from "../../display/task-row";

type BoardContextValue = {
  columns: readonly WorkflowColumnView[];
  /** Compact: the one column shown. Null on wide. */
  visibleColumnId: string | null;
};

const BoardContext = React.createContext<BoardContextValue | null>(null);

function useBoard(): BoardContextValue {
  const value = React.useContext(BoardContext);
  if (value === null) throw new Error("BoardLane and BoardCell render inside a Board.");
  return value;
}

/** The track list and the width the tracks need, for `n` columns on wide. */
function tracks(n: number): { template: string; minWidth: string } {
  if (n <= 1) {
    return { template: "minmax(var(--board-col-wide), 1fr)", minWidth: "var(--board-col-wide)" };
  }
  return {
    template: `minmax(var(--board-col-wide), 1.5fr) repeat(${n - 1}, minmax(var(--board-col), 1fr))`,
    minWidth: `calc(var(--board-col-wide) + ${n - 1} * var(--board-col))`,
  };
}

const COMPACT_TRACKS = { template: "minmax(0, 1fr)", minWidth: "0px" };

export interface BoardProps {
  /** The view's columns, in order. */
  columns: readonly WorkflowColumnView[];
  /** Compact only: the column shown. */
  visibleColumnId?: string;
  children: React.ReactNode;
  className?: string;
}

export function Board({ columns, visibleColumnId, children, className }: BoardProps) {
  const compact = visibleColumnId !== undefined;
  const shownId = compact
    ? (columns.find((column) => column.id === visibleColumnId) ?? columns[0])?.id ?? null
    : null;
  const shownColumns = compact ? columns.filter((column) => column.id === shownId) : columns;
  const { template, minWidth } = compact ? COMPACT_TRACKS : tracks(columns.length);

  const headsRef = React.useRef<HTMLDivElement>(null);
  const onScroll = React.useCallback((event: React.UIEvent<HTMLDivElement>) => {
    if (headsRef.current) headsRef.current.scrollLeft = event.currentTarget.scrollLeft;
  }, []);

  const context = React.useMemo<BoardContextValue>(
    () => ({ columns, visibleColumnId: shownId }),
    [columns, shownId],
  );

  return (
    <BoardContext.Provider value={context}>
      <div
        className={cn("flex min-w-0 flex-col", className)}
        style={{ "--board-template": template, "--board-min": minWidth } as React.CSSProperties}
      >
        <div ref={headsRef} className="bg-paper border-hairline sticky top-0 z-20 overflow-hidden border-b">
          <div className="grid min-w-(--board-min) grid-cols-(--board-template)">
            {shownColumns.map((column, index) => (
              <div
                key={column.id}
                className={cn(
                  "flex min-h-(--target) min-w-0 items-center px-(--space-3)",
                  index === 0 && !compact && "bg-paper sticky left-0 z-10",
                )}
              >
                <Text as="span" variant="secondary" weight={500} tone="secondary" truncate>
                  {column.name}
                </Text>
              </div>
            ))}
          </div>
        </div>

        <div onScroll={onScroll} className="@container overflow-x-auto">
          <div className="min-w-(--board-min)">{children}</div>
        </div>
      </div>
    </BoardContext.Provider>
  );
}

export interface BoardLaneProps {
  /** The region's name — the group's name, or *No group*. */
  label: string;
  /** A `LaneHeader`. */
  header: React.ReactNode;
  collapsed: boolean;
  children: React.ReactNode;
  className?: string;
}

/** One group: its head across the board, then one cell per column (unless folded). */
export function BoardLane({ label, header, collapsed, children, className }: BoardLaneProps) {
  return (
    <section aria-label={label} className={cn("group/lane border-hairline border-b", className)}>
      <div className="sticky left-0 w-[100cqi] max-w-full">{header}</div>
      {collapsed ? null : <div className="grid grid-cols-(--board-template)">{children}</div>}
    </section>
  );
}

export interface BoardCellProps {
  columnId: string;
  /** *{Group}, {Column}* — the list's name. */
  label: string;
  /** `TaskRow`s, in the cell's order. */
  children?: React.ReactNode;
  /** The cell's `InlineAddRow`, after the list. */
  footer?: React.ReactNode;
  className?: string;
}

/** One group's tasks in one column. Renders nothing on compact unless its column is shown. */
export function BoardCell({ columnId, label, children, footer, className }: BoardCellProps) {
  const { columns, visibleColumnId } = useBoard();
  if (visibleColumnId !== null && columnId !== visibleColumnId) return null;

  const index = columns.findIndex((column) => column.id === columnId);
  const pinned = visibleColumnId === null && index === 0;

  return (
    <div
      style={{ gridColumn: visibleColumnId === null ? index + 1 : 1 }}
      className={cn("min-w-0 pb-(--space-2)", pinned && "bg-paper sticky left-0 z-10", className)}
    >
      <ul aria-label={label} className="m-0 flex list-none flex-col p-0">
        {children}
      </ul>
      {footer}
    </div>
  );
}

export interface BoardSkeletonProps {
  /** How many column heads to sketch. */
  columns?: number;
  className?: string;
}

/**
 * The board's own shape while it loads — never a spinner, never a blank
 * (UX §2 guardrail 8): the heads as text skeletons, and two lanes of skeleton
 * rows in the first column.
 */
export function BoardSkeleton({ columns = 4, className }: BoardSkeletonProps) {
  const { template, minWidth } = tracks(columns);
  return (
    <div
      aria-hidden="true"
      className={cn("flex min-w-0 flex-col overflow-hidden", className)}
      style={{ "--board-template": template, "--board-min": minWidth } as React.CSSProperties}
    >
      <div className="border-hairline grid min-w-(--board-min) grid-cols-(--board-template) border-b">
        {Array.from({ length: columns }, (_, index) => (
          <div key={index} className="flex min-h-(--target) items-center px-(--space-3)">
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      {[0, 1].map((lane) => (
        <div key={lane} className="border-hairline min-w-(--board-min) border-b">
          <div className="flex min-h-(--row-min) items-center gap-(--space-3) ps-(--space-3)">
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-(--board-template)">
            <ul className="m-0 flex list-none flex-col p-0">
              <TaskRowSkeleton />
              <TaskRowSkeleton />
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
