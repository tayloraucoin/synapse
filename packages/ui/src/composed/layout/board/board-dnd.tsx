/**
 * The board's drag (Workflow UX v0.1 WF-01 *moving and reordering*; W12;
 * TD-43; FLO-9).
 *
 * BOARD EMITS, THE APP MOVES. A drop calls `onMoveTask` or `onReorderLanes`
 * with a PLACE — never a write, never a cache patch. The app passes the same
 * `moveTask` and group reorder the menu and the keys use, so the toast, the
 * undo and the failure path are theirs: the drag adds a caller, not a code
 * path. Dropping where it started calls nothing.
 *
 * NOTHING SLIDES. The lifted row follows in a `DragOverlay` with the lift look
 * (the row's own `lifted` variant); its place in the source cell is held open;
 * a 2px ink line shows where it will land — between rows, at the end of a
 * cell, at the top of an empty one. The line is the truth: the place sent is
 * computed from the same rows the line is drawn against. Under reduced motion
 * the overlay does not settle; it was never going to slide.
 *
 * THE INDEX IS IN THE CELL WITHOUT THE LIFTED ROW — the terms `task.move`'s
 * `toIndex` is in (TD-35) — so the line, the announcement and the intent agree.
 *
 * SENSORS, AS `SortableList`'s, NOT ITS INTERNALS. A mouse lifts after 6px; a
 * finger after `DRAG_LONG_PRESS_MS` held within 8px — a shorter swipe scrolls
 * the page, which is why the mouse sensor is not the pointer sensor (a pointer
 * sensor would read a swipe as a drag). The keyboard lifts from a handle:
 * `Space`, arrows, `Space`, `Esc`. The arrows walk real places — `↑` `↓`
 * through a column's slots across lanes, `←` `→` to the same lane's
 * neighbouring column — not pixels.
 *
 * LANES drag by their grip among the reorderable (unpinned) lanes only; a
 * folded lane's section also takes a row, to the end of its cell in the row's
 * own column. A drag type never drops into the other's targets.
 *
 * One polite live region speaks each step: lifted, the place it is over
 * (*Northwind, Finish later, position 2*), dropped or back where it was.
 */
"use client";

import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type KeyboardCoordinateGetter,
} from "@dnd-kit/core";
import { DRAG_LONG_PRESS_MS } from "@syn/constants";
import type { WorkflowColumnView } from "@syn/types";
import { GripVertical } from "lucide-react";
import * as React from "react";

import { usePrefersReducedMotion } from "../../../hooks/use-prefers-reduced-motion";
import { cn } from "../../../lib/cn";
import { BOARD_COPY } from "./copy";

/** A drop, as the app's `moveTask` takes it. `toIndex` is in the cell without the task. */
export interface BoardMoveIntent {
  id: string;
  toColumnId: string;
  toGroupId: string | null;
  toIndex: number;
}

/* -------------------------------------------------------------- contexts -- */

type BoardDragValue = {
  rows: boolean;
  lanes: boolean;
  /** True once, just after a drag ends — the release must not also open the row. */
  consumeClick: () => boolean;
};

const BoardDragContext = React.createContext<BoardDragValue | null>(null);

/** Which cell a row is in — `BoardCell` provides it. */
export const BoardCellDragContext = React.createContext<{ columnId: string; groupId: string | null } | null>(null);

type GripProps = {
  ref: (node: HTMLElement | null) => void;
  listeners: Record<string, unknown> | undefined;
  attributes: Record<string, unknown>;
  name: string;
};

const LaneGripContext = React.createContext<GripProps | null>(null);

const groupKey = (groupId: string | null) => groupId ?? "none";

/* ----------------------------------------------------------------- rows -- */

/**
 * A row's drag, for `TaskRow`: inert (an unregistered id, nothing returned)
 * outside a draggable board's cell — in a story without callbacks, offline,
 * and in the drag's own overlay.
 */
export function useBoardRowDrag(taskId: string, title: string, preview: () => React.ReactNode) {
  const board = React.useContext(BoardDragContext);
  const cell = React.useContext(BoardCellDragContext);
  const inert = React.useId();
  const enabled = board !== null && board.rows && cell !== null;

  const data = { type: "task" as const, taskId, title, preview, columnId: cell?.columnId, groupId: cell?.groupId ?? null };
  const draggable = useDraggable({ id: enabled ? `task:${taskId}` : `inert-drag:${inert}`, disabled: !enabled, data });
  const droppable = useDroppable({
    id: enabled ? `row:${taskId}` : `inert-drop:${inert}`,
    disabled: !enabled,
    data: { type: "row", taskId, columnId: cell?.columnId, groupId: cell?.groupId ?? null },
  });

  const setDraggableNode = draggable.setNodeRef;
  const setDroppableNode = droppable.setNodeRef;
  const rowRef = React.useCallback(
    (node: HTMLElement | null) => {
      setDraggableNode(node);
      setDroppableNode(node);
    },
    [setDraggableNode, setDroppableNode],
  );

  if (!enabled || board === null) return null;
  const listeners = (draggable.listeners ?? {}) as Record<string, (event: unknown) => void>;
  return {
    rowRef,
    isDragging: draggable.isDragging,
    /** The row's pointer and touch lift — on the main button, so the toggle and the menu stay theirs. */
    mainListeners: { onMouseDown: listeners.onMouseDown, onTouchStart: listeners.onTouchStart },
    handle: (
      <button
        type="button"
        ref={draggable.setActivatorNodeRef}
        {...draggable.attributes}
        aria-label={BOARD_COPY.rowHandle(title)}
        onKeyDown={listeners.onKeyDown}
        className={cn(
          "sr-only focus-visible:not-sr-only",
          "focus-visible:inline-flex focus-visible:size-(--target) focus-visible:shrink-0 focus-visible:items-center focus-visible:justify-center",
          "focus-visible:rounded-(--radius) focus-visible:text-text-secondary focus-visible:outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        )}
      >
        <GripVertical className="size-4" aria-hidden="true" />
      </button>
    ),
    consumeClick: board.consumeClick,
  };
}

/** A cell as a drop target — below its rows, its add row, the whole of an empty cell. */
export function useBoardCellDrop(columnId: string, groupId: string | null) {
  const board = React.useContext(BoardDragContext);
  const inert = React.useId();
  const enabled = board !== null && board.rows;
  return useDroppable({
    id: enabled ? `cell:${groupKey(groupId)}:${columnId}` : `inert-cell:${inert}`,
    disabled: !enabled,
    data: { type: "cell", columnId, groupId },
  }).setNodeRef;
}

/* ---------------------------------------------------------------- lanes -- */

/** A lane's drag and drop, for `BoardLane`. The section takes drops; the head is what lifts. */
export function useBoardLaneDrag({
  groupId,
  name,
  reorderable,
  collapsed,
  preview,
}: {
  groupId: string | null;
  name: string;
  reorderable: boolean;
  collapsed: boolean;
  preview: React.ReactNode;
}) {
  const board = React.useContext(BoardDragContext);
  const inert = React.useId();
  const laneOn = board !== null && board.lanes && reorderable && groupId !== null;
  const foldOn = board !== null && board.rows && collapsed;

  const draggable = useDraggable({
    id: laneOn ? `lanedrag:${groupId}` : `inert-lane:${inert}`,
    disabled: !laneOn,
    data: { type: "lane", laneId: groupId, title: name, preview },
  });
  const laneDrop = useDroppable({
    id: laneOn ? `lane:${groupId}` : `inert-lanedrop:${inert}`,
    disabled: !laneOn,
    data: { type: "lane", laneId: groupId },
  });
  const foldDrop = useDroppable({
    id: foldOn ? `fold:${groupKey(groupId)}` : `inert-fold:${inert}`,
    disabled: !foldOn,
    data: { type: "fold", groupId },
  });

  const setLane = laneDrop.setNodeRef;
  const setFold = foldDrop.setNodeRef;
  const sectionRef = React.useCallback(
    (node: HTMLElement | null) => {
      setLane(node);
      setFold(node);
    },
    [setLane, setFold],
  );

  const grip: GripProps | null = laneOn
    ? { ref: draggable.setActivatorNodeRef, listeners: draggable.listeners, attributes: { ...draggable.attributes }, name }
    : null;

  return {
    sectionRef,
    headRef: draggable.setNodeRef,
    isDragging: draggable.isDragging,
    grip,
  };
}

/** Provides a lane's grip to `BoardLaneHandle`, wherever the caller put it in its head. */
export function LaneGripProvider({ grip, children }: { grip: GripProps | null; children: React.ReactNode }) {
  return <LaneGripContext.Provider value={grip}>{children}</LaneGripContext.Provider>;
}

/**
 * The lane's grip (*Reorder {name}*), for `LaneHeader`'s `handle` slot. Draws
 * nothing unless the lane can be dragged — a pinned lane, *No group*, a board
 * without `onReorderLanes`, offline. Visible on hover or focus on wide, always
 * on compact.
 */
export function BoardLaneHandle({ label }: { label?: (name: string) => string }) {
  const grip = React.useContext(LaneGripContext);
  if (grip === null) return null;
  const listeners = (grip.listeners ?? {}) as Record<string, React.EventHandler<React.SyntheticEvent>>;
  return (
    <button
      type="button"
      ref={grip.ref}
      {...grip.attributes}
      {...listeners}
      aria-label={(label ?? ((name: string) => `Reorder ${name}`))(grip.name)}
      className={cn(
        "inline-flex size-(--target) shrink-0 cursor-grab touch-none items-center justify-center rounded-(--radius)",
        "text-text-secondary hover:text-ink active:cursor-grabbing",
        "wide:opacity-0 wide:group-hover/lane:opacity-100 wide:focus-visible:opacity-100",
        "transition-opacity duration-(--dur-state) ease-(--ease-settle)",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none",
      )}
    >
      <GripVertical className="size-5" aria-hidden="true" />
    </button>
  );
}

/* ---------------------------------------------------------- the context -- */

type TaskTarget = { kind: "task"; columnId: string; groupId: string | null; toIndex: number; fold: boolean };
type LaneTarget = { kind: "lane"; gap: number };
type Target = TaskTarget | LaneTarget;

type Source =
  | { kind: "task"; taskId: string; title: string; columnId: string; groupId: string | null; index: number }
  | { kind: "lane"; laneId: string; title: string; index: number };

type Line = { top: number; left: number; width: number };

/** The rows of a cell element, in order. */
function rowsOf(cell: Element): HTMLElement[] {
  return Array.from(cell.querySelectorAll<HTMLElement>(":scope > ul > li[data-task-id]"));
}

function cellOf(root: HTMLElement, columnId: string, groupId: string | null): HTMLElement | null {
  return root.querySelector<HTMLElement>(
    `[data-board-cell][data-column-id="${columnId}"][data-group-key="${groupKey(groupId)}"]`,
  );
}

function reorderableLanes(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>("section[data-board-lane][data-reorderable]"));
}

function clientPoint(event: Event | null): { x: number; y: number } | null {
  if (event === null) return null;
  if ("touches" in event) {
    const touch = (event as TouchEvent).touches[0] ?? (event as TouchEvent).changedTouches[0];
    return touch === undefined ? null : { x: touch.clientX, y: touch.clientY };
  }
  if ("clientX" in event) return { x: (event as MouseEvent).clientX, y: (event as MouseEvent).clientY };
  return null;
}

export function BoardDnd({
  rootRef,
  columns,
  onMoveTask,
  onReorderLanes,
  children,
}: {
  rootRef: React.RefObject<HTMLElement | null>;
  columns: readonly WorkflowColumnView[];
  onMoveTask?: (intent: BoardMoveIntent) => void;
  onReorderLanes?: (ids: string[]) => void;
  children: React.ReactNode;
}) {
  const reducedMotion = usePrefersReducedMotion();
  const [announcement, setAnnouncement] = React.useState("");
  const [line, setLineState] = React.useState<Line | null>(null);
  // The line, readable by the keyboard's coordinate getter in the same tick it was placed.
  const lineRef = React.useRef<Line | null>(null);
  const setLine = React.useCallback((next: Line | null) => {
    lineRef.current = next;
    setLineState(next);
  }, []);
  const [preview, setPreview] = React.useState<React.ReactNode>(null);
  const [previewKind, setPreviewKind] = React.useState<"task" | "lane" | null>(null);

  const source = React.useRef<Source | null>(null);
  const target = React.useRef<Target | null>(null);
  const keyboard = React.useRef(false);
  const lastPoint = React.useRef<{ x: number; y: number } | null>(null);
  const endedAt = React.useRef(0);

  const latest = React.useRef({ columns, onMoveTask, onReorderLanes });
  latest.current = { columns, onMoveTask, onReorderLanes };

  const announce = React.useCallback((text: string) => {
    // Re-set so the same sentence twice is read twice.
    setAnnouncement("");
    window.setTimeout(() => setAnnouncement(text), 0);
  }, []);

  /* ---- where a target is, on screen and in words ---- */

  const describe = React.useCallback(
    (next: Target, speak = true) => {
      const say = (text: string) => {
        if (speak) announce(text);
      };
      const root = rootRef.current;
      if (root === null) return;
      if (next.kind === "lane") {
        const lanes = reorderableLanes(root);
        const s = source.current;
        const others = lanes.filter((lane) => lane.dataset.groupKey !== (s?.kind === "lane" ? s.laneId : ""));
        const anchor = others[next.gap];
        const last = others[others.length - 1];
        const head = (anchor ?? last)?.querySelector<HTMLElement>("[data-board-lane-head]");
        const section = anchor ?? last;
        if (section === undefined || head === null || head === undefined) return setLine(null);
        const rect = section.getBoundingClientRect();
        const headRect = head.getBoundingClientRect();
        setLine({ top: anchor !== undefined ? rect.top : rect.bottom, left: headRect.left, width: headRect.width });
        if (s?.kind === "lane") say(BOARD_COPY.laneOver(s.title, next.gap + 1));
        return;
      }
      const section = root.querySelector<HTMLElement>(`section[data-board-lane][data-group-key="${groupKey(next.groupId)}"]`);
      const groupName = section?.getAttribute("aria-label") ?? "";
      const columnName = latest.current.columns.find((column) => column.id === next.columnId)?.name ?? "";
      if (next.fold) {
        const head = section?.querySelector<HTMLElement>("[data-board-lane-head]");
        const rect = (head ?? section)?.getBoundingClientRect();
        setLine(rect === undefined ? null : { top: rect.bottom, left: rect.left, width: rect.width });
        say(BOARD_COPY.over(groupName, columnName, null));
        return;
      }
      const cell = cellOf(root, next.columnId, next.groupId);
      if (cell === null) return setLine(null);
      const s = source.current;
      const rows = rowsOf(cell).filter((row) => s?.kind !== "task" || row.dataset.taskId !== s.taskId);
      const list = cell.querySelector(":scope > ul");
      const cellRect = cell.getBoundingClientRect();
      const anchor = rows[next.toIndex];
      const last = rows[rows.length - 1];
      const top =
        anchor !== undefined
          ? anchor.getBoundingClientRect().top
          : last !== undefined
            ? last.getBoundingClientRect().bottom
            : (list?.getBoundingClientRect().top ?? cellRect.top);
      setLine({ top, left: cellRect.left, width: cellRect.width });
      say(BOARD_COPY.over(groupName, columnName, next.toIndex + 1));
    },
    [rootRef, announce, setLine],
  );

  const setTarget = React.useCallback(
    (next: Target | null) => {
      const before = target.current;
      target.current = next;
      if (next === null) {
        setLine(null);
        return;
      }
      const same =
        before !== null &&
        before.kind === next.kind &&
        (next.kind === "lane"
          ? (before as LaneTarget).gap === next.gap
          : (before as TaskTarget).columnId === next.columnId &&
            (before as TaskTarget).groupId === next.groupId &&
            (before as TaskTarget).toIndex === next.toIndex &&
            (before as TaskTarget).fold === next.fold);
      if (!same) describe(next);
    },
    [describe, setLine],
  );

  /* ---- the pointer's target ---- */

  const pointerTarget = React.useCallback(
    (overData: Record<string, unknown> | undefined, point: { x: number; y: number } | null): Target | null => {
      const root = rootRef.current;
      const s = source.current;
      if (root === null || s === null || overData === undefined) return null;

      if (s.kind === "lane") {
        if (overData.type !== "lane" || point === null) return null;
        const lanes = reorderableLanes(root);
        const over = lanes.find((lane) => lane.dataset.groupKey === overData.laneId);
        if (over === undefined) return null;
        const others = lanes.filter((lane) => lane.dataset.groupKey !== s.laneId);
        if (over.dataset.groupKey === s.laneId) return { kind: "lane", gap: s.index };
        const rect = over.getBoundingClientRect();
        const index = others.indexOf(over);
        return { kind: "lane", gap: index + (point.y > rect.top + rect.height / 2 ? 1 : 0) };
      }

      if (overData.type === "fold") {
        return { kind: "task", columnId: s.columnId, groupId: (overData.groupId as string | null) ?? null, toIndex: Number.MAX_SAFE_INTEGER, fold: true };
      }
      const columnId = overData.columnId as string | undefined;
      const groupId = (overData.groupId as string | null | undefined) ?? null;
      if (columnId === undefined) return null;
      const cell = cellOf(root, columnId, groupId);
      if (cell === null) return null;
      const rows = rowsOf(cell).filter((row) => row.dataset.taskId !== s.taskId);
      if (overData.type === "row") {
        if (overData.taskId === s.taskId) return { kind: "task", columnId, groupId, toIndex: s.index, fold: false };
        const row = rows.find((other) => other.dataset.taskId === overData.taskId);
        if (row === undefined || point === null) return null;
        const rect = row.getBoundingClientRect();
        return {
          kind: "task",
          columnId,
          groupId,
          toIndex: rows.indexOf(row) + (point.y > rect.top + rect.height / 2 ? 1 : 0),
          fold: false,
        };
      }
      // The cell itself: below its rows, its add row, an empty cell.
      return { kind: "task", columnId, groupId, toIndex: rows.length, fold: false };
    },
    [rootRef],
  );

  /* ---- the keyboard's target: real places, not pixels ---- */

  const keyboardCoordinates: KeyboardCoordinateGetter = React.useCallback(
    (event, { currentCoordinates }) => {
      const root = rootRef.current;
      const s = source.current;
      const now = target.current;
      if (root === null || s === null || now === null) return undefined;
      const key = event.code;
      if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(key)) return undefined;
      event.preventDefault();

      let next: Target | null = null;
      if (s.kind === "lane" && now.kind === "lane") {
        const count = reorderableLanes(root).length;
        if (key === "ArrowUp") next = { kind: "lane", gap: Math.max(0, now.gap - 1) };
        if (key === "ArrowDown") next = { kind: "lane", gap: Math.min(count - 1, now.gap + 1) };
      } else if (s.kind === "task" && now.kind === "task" && !now.fold) {
        const lanes = Array.from(root.querySelectorAll<HTMLElement>("section[data-board-lane]"));
        const lengthOf = (cell: HTMLElement) => rowsOf(cell).filter((row) => row.dataset.taskId !== s.taskId).length;
        const cellAt = (lane: HTMLElement, columnId: string) =>
          lane.querySelector<HTMLElement>(`[data-board-cell][data-column-id="${columnId}"]`);
        const keyOf = (lane: HTMLElement) => lane.dataset.groupKey ?? "none";
        const toGroup = (laneKey: string) => (laneKey === "none" ? null : laneKey);
        const laneIndex = lanes.findIndex((lane) => keyOf(lane) === groupKey(now.groupId));
        const lane = lanes[laneIndex];
        const cell = lane === undefined ? null : cellAt(lane, now.columnId);
        if (lane !== undefined && cell !== null) {
          const length = lengthOf(cell);
          if (key === "ArrowDown") {
            if (now.toIndex < length) next = { ...now, toIndex: now.toIndex + 1 };
            else
              for (const below of lanes.slice(laneIndex + 1)) {
                if (cellAt(below, now.columnId) !== null) {
                  next = { ...now, groupId: toGroup(keyOf(below)), toIndex: 0 };
                  break;
                }
              }
          } else if (key === "ArrowUp") {
            if (now.toIndex > 0) next = { ...now, toIndex: now.toIndex - 1 };
            else
              for (const above of lanes.slice(0, laneIndex).reverse()) {
                const found = cellAt(above, now.columnId);
                if (found !== null) {
                  next = { ...now, groupId: toGroup(keyOf(above)), toIndex: lengthOf(found) };
                  break;
                }
              }
          } else {
            const shown = latest.current.columns.filter((column) => cellAt(lane, column.id) !== null);
            const at = shown.findIndex((column) => column.id === now.columnId);
            const neighbour = shown[at + (key === "ArrowRight" ? 1 : -1)];
            const found = neighbour === undefined ? null : cellAt(lane, neighbour.id);
            if (neighbour !== undefined && found !== null) {
              next = { ...now, columnId: neighbour.id, toIndex: Math.min(now.toIndex, lengthOf(found)) };
            }
          }
        }
      }

      if (next === null) return currentCoordinates;
      setTarget(next);
      // The overlay goes where the line is.
      const placed = lineRef.current;
      return placed === null ? currentCoordinates : { x: placed.left, y: placed.top };
    },
    [rootRef, setTarget],
  );

  /* ---- collisions: each drag type sees only its own targets, the most specific first ---- */

  const collision: CollisionDetection = React.useCallback((args) => {
    // The keyboard's place is the target above, not a geometry question.
    if (keyboard.current) return [];
    const wanted = args.active.data.current?.type === "lane" ? ["lane"] : ["row", "fold", "cell"];
    const typeOf = new Map(
      args.droppableContainers.map((container) => [container.id, String(container.data.current?.type)]),
    );
    const containers = args.droppableContainers.filter((container) => wanted.includes(typeOf.get(container.id) ?? ""));
    const rank = (id: string | number) => wanted.indexOf(typeOf.get(id) ?? "");
    return pointerWithin({ ...args, droppableContainers: containers }).sort((a, b) => rank(a.id) - rank(b.id));
  }, []);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: DRAG_LONG_PRESS_MS, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );

  /* ---- the pointer, followed while a drag is live ---- */

  React.useEffect(() => {
    const onMouse = (event: MouseEvent) => {
      lastPoint.current = { x: event.clientX, y: event.clientY };
    };
    const onTouch = (event: TouchEvent) => {
      lastPoint.current = clientPoint(event);
    };
    // Capture, so the point is current before the sensor's own listener reports the move.
    window.addEventListener("mousemove", onMouse, { passive: true, capture: true });
    window.addEventListener("touchmove", onTouch, { passive: true, capture: true });
    return () => {
      window.removeEventListener("mousemove", onMouse, { capture: true });
      window.removeEventListener("touchmove", onTouch, { capture: true });
    };
  }, []);

  /* ---- the drag's life ---- */

  const reset = React.useCallback(() => {
    source.current = null;
    target.current = null;
    keyboard.current = false;
    endedAt.current = Date.now();
    setLine(null);
    setPreview(null);
    setPreviewKind(null);
  }, [setLine]);

  const onDragStart = React.useCallback(
    (event: DragStartEvent) => {
      const root = rootRef.current;
      const data = event.active.data.current;
      if (root === null || data === undefined) return;
      keyboard.current = typeof KeyboardEvent !== "undefined" && event.activatorEvent instanceof KeyboardEvent;
      lastPoint.current = clientPoint(event.activatorEvent);

      if (data.type === "lane") {
        const lanes = reorderableLanes(root);
        const index = lanes.findIndex((lane) => lane.dataset.groupKey === data.laneId);
        source.current = { kind: "lane", laneId: String(data.laneId), title: String(data.title), index };
        target.current = { kind: "lane", gap: index };
        setPreview(data.preview as React.ReactNode);
        setPreviewKind("lane");
      } else {
        const cell = cellOf(root, String(data.columnId), (data.groupId as string | null) ?? null);
        const index = cell === null ? 0 : rowsOf(cell).findIndex((row) => row.dataset.taskId === data.taskId);
        source.current = {
          kind: "task",
          taskId: String(data.taskId),
          title: String(data.title),
          columnId: String(data.columnId),
          groupId: (data.groupId as string | null) ?? null,
          index,
        };
        target.current = { kind: "task", columnId: String(data.columnId), groupId: (data.groupId as string | null) ?? null, toIndex: index, fold: false };
        setPreview((data.preview as () => React.ReactNode)());
        setPreviewKind("task");
      }
      announce(BOARD_COPY.lifted(String(data.title)));
      // The keyboard's line starts where the row is; the lift is the one thing said.
      if (keyboard.current && target.current !== null) describe(target.current, false);
    },
    [rootRef, announce, describe],
  );

  /** The pointer's target, from what it is over and where in it (above or below a row's middle). */
  const follow = React.useCallback(
    (overData: Record<string, unknown> | undefined) => {
      if (keyboard.current) return;
      setTarget(pointerTarget(overData, lastPoint.current));
    },
    [pointerTarget, setTarget],
  );

  const onDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const s = source.current;
      if (!keyboard.current) follow(event.over?.data.current);
      const t = target.current;
      const root = rootRef.current;
      reset();
      if (s === null || t === null || root === null) {
        if (s !== null) announce(BOARD_COPY.cancelled(s.title));
        return;
      }

      if (s.kind === "lane" && t.kind === "lane") {
        const ids = reorderableLanes(root).map((lane) => lane.dataset.groupKey ?? "");
        const others = ids.filter((id) => id !== s.laneId);
        if (others.length === ids.length || t.gap === s.index) {
          announce(BOARD_COPY.cancelled(s.title));
          return;
        }
        others.splice(t.gap, 0, s.laneId);
        announce(BOARD_COPY.dropped(s.title));
        latest.current.onReorderLanes?.(others);
        return;
      }

      if (s.kind === "task" && t.kind === "task") {
        // A task that a refetch took away cancels the drag.
        const gone = root.querySelector(`li[data-task-id="${s.taskId}"]`) === null;
        const unchanged = t.columnId === s.columnId && t.groupId === s.groupId && t.toIndex === s.index && !t.fold;
        const foldedHome = t.fold && t.groupId === s.groupId;
        if (gone || unchanged || foldedHome) {
          announce(BOARD_COPY.cancelled(s.title));
          return;
        }
        announce(BOARD_COPY.dropped(s.title));
        latest.current.onMoveTask?.({ id: s.taskId, toColumnId: t.columnId, toGroupId: t.groupId, toIndex: t.toIndex });
      }
    },
    [follow, reset, rootRef, announce],
  );

  const onDragCancel = React.useCallback(() => {
    const s = source.current;
    reset();
    if (s !== null) announce(BOARD_COPY.cancelled(s.title));
  }, [reset, announce]);

  const value = React.useMemo<BoardDragValue>(
    () => ({
      rows: onMoveTask !== undefined,
      lanes: onReorderLanes !== undefined,
      consumeClick: () => Date.now() - endedAt.current < 400,
    }),
    [onMoveTask, onReorderLanes],
  );

  return (
    <BoardDragContext.Provider value={value}>
      <DndContext
        sensors={sensors}
        collisionDetection={collision}
        onDragStart={onDragStart}
        onDragMove={(event) => follow(event.over?.data.current)}
        onDragOver={(event) => follow(event.over?.data.current)}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
        // The live region below is the one that speaks; dnd-kit's own stays quiet.
        accessibility={{ announcements: QUIET, screenReaderInstructions: { draggable: "" } }}
      >
        {children}
        <DragOverlay dropAnimation={reducedMotion ? null : { duration: 120, easing: "ease-out" }}>
          {preview === null ? null : previewKind === "task" ? (
            <ul className="bg-paper m-0 list-none p-0">{preview}</ul>
          ) : (
            <div className="bg-paper border-accent-mark rounded-(--radius) border-[1.5px] opacity-90">{preview}</div>
          )}
        </DragOverlay>
      </DndContext>
      {line === null ? null : (
        <div
          aria-hidden="true"
          className="bg-ink pointer-events-none fixed z-50 h-0.5"
          style={{ top: line.top - 1, left: line.left, width: line.width }}
        />
      )}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </BoardDragContext.Provider>
  );
}

const QUIET = {
  onDragStart: () => "",
  onDragOver: () => "",
  onDragEnd: () => "",
  onDragCancel: () => "",
};
