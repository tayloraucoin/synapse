/**
 * DragToPlace — carry a thing from one list onto a place in another (USE-75;
 * place-from-the-pool, the desk): a pool row onto a day's tier cell or a Work
 * block, a placed chip to another cell or back onto the pool.
 *
 * A screen sees ids: `useDragSource(id, label)` on what lifts,
 * `useDropTarget(id)` on where it lands, and one `onPlace(sourceId,
 * targetId, label)` on the context. It emits; the app writes. Letting go
 * over nothing, or over where it started, calls nothing; Escape cancels.
 *
 * NOT dnd-kit, ON PURPOSE. The pool's rows sit inside `SortableList`'s own
 * DndContext (the client order, D-USE-96), and a dnd-kit draggable binds to
 * its nearest context, so a row could never reach a second, outer one; dnd-kit
 * offers no way through. The carry is small enough to hold here: pointer
 * events, a 6px threshold so a click on a row is still a click, the targets'
 * boxes read at the pointer, and the click that ends a carry swallowed.
 *
 * SHARES NO CODE WITH `DragLayer` OR `SortableList`; the lift grammar is typed
 * again: the carried label at 0.9 opacity with a 1.5px `border-accent-mark`,
 * the source left in place, faded by its caller.
 *
 * THE MOUSE ONLY. Drag is the desk's shortcut: every caller keeps a
 * one-pointer, keyboard path of its own (WCAG 2.5.7; the Week's "+ Add to
 * <tier>"), so no source takes a role or a tab stop from this. A polite live
 * region says what was lifted and when it went back.
 *
 * Outside a `DragToPlace` the hooks hand back nothing to attach: the same
 * row renders as a plain row.
 */
"use client";

import * as React from "react";
import { cn } from "../../../lib/cn";
import { DRAG_TO_PLACE_COPY as COPY } from "./copy";

/** The pointer travels this far before a press becomes a carry. */
const LIFT_PX = 6;

interface Carry {
  id: string;
  label: string;
}

interface DragToPlaceValue {
  carry: Carry | null;
  overId: string | null;
  start: (event: React.PointerEvent, id: string, label: string) => void;
  register: (id: string, node: HTMLElement | null) => void;
  /** True once, just after a drop: the release must not also click. */
  consumeClick: () => boolean;
}

const DragToPlaceContext = React.createContext<DragToPlaceValue | null>(null);

export interface DragToPlaceProps {
  /** A source let go over a target other than itself, with the label it carried. */
  onPlace: (sourceId: string, targetId: string, label: string) => void;
  /** A source lifted: the caller may clear what the last placing showed. */
  onLift?: (sourceId: string) => void;
  children: React.ReactNode;
}

export function DragToPlace({ onPlace, onLift, children }: DragToPlaceProps) {
  const [carry, setCarry] = React.useState<Carry | null>(null);
  const [overId, setOverId] = React.useState<string | null>(null);
  const [said, setSaid] = React.useState("");
  const targets = React.useRef(new Map<string, HTMLElement>());
  const ghost = React.useRef<HTMLDivElement>(null);
  const dropped = React.useRef(false);
  const handlers = React.useRef({ onPlace, onLift });
  handlers.current = { onPlace, onLift };

  const register = React.useCallback((id: string, node: HTMLElement | null) => {
    if (node) targets.current.set(id, node);
    else targets.current.delete(id);
  }, []);

  const consumeClick = React.useCallback(() => {
    if (!dropped.current) return false;
    dropped.current = false;
    return true;
  }, []);

  const targetAt = (x: number, y: number, source: string) => {
    for (const [id, node] of targets.current) {
      if (id === source) continue;
      const box = node.getBoundingClientRect();
      if (x >= box.left && x < box.right && y >= box.top && y < box.bottom) {
        return id;
      }
    }
    return null;
  };

  const start = React.useCallback(
    (event: React.PointerEvent, id: string, label: string) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      const from = { x: event.clientX, y: event.clientY };
      let lifted = false;
      let over: string | null = null;
      const body = document.body.style;
      const select = body.userSelect;

      const place = (x: number, y: number) => {
        if (ghost.current) {
          ghost.current.style.transform = `translate(${x + 12}px, ${y + 8}px)`;
        }
      };
      const end = () => {
        window.removeEventListener("pointermove", move);
        window.removeEventListener("pointerup", up);
        window.removeEventListener("keydown", key, true);
        body.userSelect = select;
        setCarry(null);
        setOverId(null);
      };
      const move = (e: PointerEvent) => {
        if (!lifted) {
          if (Math.hypot(e.clientX - from.x, e.clientY - from.y) < LIFT_PX) {
            return;
          }
          lifted = true;
          body.userSelect = "none";
          window.getSelection()?.removeAllRanges();
          setCarry({ id, label });
          setSaid(COPY.lifted(label));
          handlers.current.onLift?.(id);
        }
        place(e.clientX, e.clientY);
        const next = targetAt(e.clientX, e.clientY, id);
        if (next !== over) {
          over = next;
          setOverId(next);
        }
      };
      const up = (e: PointerEvent) => {
        end();
        if (!lifted) return;
        dropped.current = true;
        // The click that ends the carry fires straight after; never later.
        window.setTimeout(() => {
          dropped.current = false;
        }, 0);
        const target = targetAt(e.clientX, e.clientY, id);
        if (target === null) {
          setSaid(COPY.cancelled(label));
          return;
        }
        setSaid("");
        handlers.current.onPlace(id, target, label);
      };
      const key = (e: KeyboardEvent) => {
        if (e.key !== "Escape") return;
        e.preventDefault();
        end();
        if (lifted) setSaid(COPY.cancelled(label));
      };
      window.addEventListener("pointermove", move);
      window.addEventListener("pointerup", up);
      window.addEventListener("keydown", key, true);
    },
    // `targetAt` reads refs only.
    [],
  );

  const value = React.useMemo(
    () => ({ carry, overId, start, register, consumeClick }),
    [carry, overId, start, register, consumeClick],
  );

  return (
    <DragToPlaceContext.Provider value={value}>
      {children}
      {carry ? (
        <div
          ref={ghost}
          aria-hidden="true"
          className={cn(
            "pointer-events-none fixed start-0 top-0 z-50 max-w-60 truncate rounded-(--radius-control) border-[1.5px] border-accent-mark bg-background px-2 py-1.5",
            "text-(length:--fs-caption) text-ink opacity-90 shadow-menu",
          )}
          style={{ transform: "translate(-9999px, -9999px)" }}
        >
          {carry.label}
        </div>
      ) : null}
      <div aria-live="polite" className="sr-only">
        {said}
      </div>
    </DragToPlaceContext.Provider>
  );
}

export interface DragSourceBinding {
  /** Attach to the element that lifts; a no-op outside `DragToPlace`. */
  ref: (node: HTMLElement | null) => void;
  /** Spread on that element: the press, the swallowed release click, no native drag. */
  props: {
    onPointerDown?: React.PointerEventHandler;
    onDragStart?: React.DragEventHandler;
    onClickCapture: React.MouseEventHandler;
    "data-dragging"?: "";
  };
  isDragging: boolean;
}

const noRef = () => {};

/** What lifts: `id` comes back in `onPlace`; `label` is what the pointer carries. */
export function useDragSource(
  id: string,
  label: string,
  { disabled = false }: { disabled?: boolean } = {},
): DragSourceBinding {
  const context = React.useContext(DragToPlaceContext);
  const live = disabled ? null : context;
  const isDragging = live?.carry?.id === id;
  return {
    ref: noRef,
    props: {
      ...(live === null
        ? {}
        : {
            onPointerDown: (event: React.PointerEvent) =>
              live.start(event, id, label),
            // A link's own drag would take the pointer away.
            onDragStart: (event: React.DragEvent) => event.preventDefault(),
          }),
      onClickCapture: (event) => {
        if (context?.consumeClick()) {
          event.preventDefault();
          event.stopPropagation();
        }
      },
      ...(isDragging ? { "data-dragging": "" as const } : {}),
    },
    isDragging,
  };
}

export interface DropTargetBinding {
  ref: (node: HTMLElement | null) => void;
  /** A source is over it now. */
  isOver: boolean;
  /** Something is being carried, anywhere: a target may show it takes it. */
  isCarrying: boolean;
  /** The id carried, while one is. */
  carriedId: string | null;
}

/** Where a source lands: `id` comes back in `onPlace`. */
export function useDropTarget(
  id: string,
  { disabled = false }: { disabled?: boolean } = {},
): DropTargetBinding {
  const context = React.useContext(DragToPlaceContext);
  const register = context?.register;
  const off = disabled || !register;
  const ref = React.useCallback(
    (node: HTMLElement | null) => {
      if (!register) return;
      register(id, off ? null : node);
    },
    [register, id, off],
  );
  return {
    ref,
    isOver: !off && context?.overId === id,
    isCarrying: context?.carry != null,
    carriedId: context?.carry?.id ?? null,
  };
}
