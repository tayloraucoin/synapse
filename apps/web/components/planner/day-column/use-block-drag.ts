"use client";

import * as React from "react";

/**
 * A block moved in time (USE-42; set-my-days/overlap.md, D-USE-33): a
 * finger holds the block, then drags it up or down; a mouse lifts once it
 * moves. It snaps to 5 minutes and moves that block only; the caller
 * writes the move. Pointer events, no new dependency (as USE-48's rows).
 *
 * Before the lift a move past the tolerance is a scroll and lets go. Once
 * lifted the page does not scroll under the finger, the click that ends the
 * drag does not open the block, and Escape puts it back.
 */

const LONG_PRESS_MS = 450;
/** Movement past this before the lift is a scroll, not a drag. */
const TOLERANCE_PX = 8;
const SNAP_MIN = 5;

export interface BlockDrag {
  id: string;
  /** Snapped minutes from where it started. */
  deltaMin: number;
}

interface Press {
  id: string;
  pointerId: number;
  startY: number;
  lifted: boolean;
  timer: number | null;
}

export function useBlockDrag({
  pxPerHour,
  onMove,
}: {
  pxPerHour: number;
  /** Unset: nothing drags (offline, or a surface that does not move blocks). */
  onMove?: (blockId: string, deltaMin: number) => void;
}) {
  const [drag, setDrag] = React.useState<BlockDrag | null>(null);
  const press = React.useRef<Press | null>(null);
  const swallowClick = React.useRef(false);

  const end = React.useCallback(() => {
    const current = press.current;
    if (current?.timer != null) window.clearTimeout(current.timer);
    press.current = null;
    setDrag(null);
  }, []);

  // Lifted, the finger drags the block, not the page.
  React.useEffect(() => {
    if (drag === null) return;
    const hold = (event: TouchEvent) => {
      if (press.current?.lifted) event.preventDefault();
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") end();
    };
    document.addEventListener("touchmove", hold, { passive: false });
    window.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("touchmove", hold);
      window.removeEventListener("keydown", escape);
    };
  }, [drag, end]);

  const snapped = (deltaPx: number) =>
    Math.round(((deltaPx / pxPerHour) * 60) / SNAP_MIN) * SNAP_MIN;

  function handlers(blockId: string) {
    if (!onMove) return {};
    return {
      onPointerDown(event: React.PointerEvent<HTMLElement>) {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        // A bullet or an action on the block keeps its own tap.
        const target = event.target as HTMLElement;
        if (target.closest("[data-bullet-id], [data-no-drag]")) return;
        const element = event.currentTarget;
        const next: Press = {
          id: blockId,
          pointerId: event.pointerId,
          startY: event.clientY,
          lifted: false,
          timer: null,
        };
        if (event.pointerType !== "mouse") {
          next.timer = window.setTimeout(() => {
            next.timer = null;
            next.lifted = true;
            try {
              element.setPointerCapture(next.pointerId);
            } catch {
              // The pointer already went; the up below ends it.
            }
            setDrag({ id: blockId, deltaMin: 0 });
          }, LONG_PRESS_MS);
        }
        press.current = next;
      },
      onPointerMove(event: React.PointerEvent<HTMLElement>) {
        const current = press.current;
        if (current === null || current.pointerId !== event.pointerId) return;
        const deltaPx = event.clientY - current.startY;
        if (!current.lifted) {
          if (Math.abs(deltaPx) <= TOLERANCE_PX) return;
          if (event.pointerType !== "mouse") {
            // A scroll, not a hold.
            end();
            return;
          }
          current.lifted = true;
          event.currentTarget.setPointerCapture(event.pointerId);
        }
        const deltaMin = snapped(deltaPx);
        setDrag((was) =>
          was?.deltaMin === deltaMin && was.id === blockId
            ? was
            : { id: blockId, deltaMin },
        );
      },
      onPointerUp(event: React.PointerEvent<HTMLElement>) {
        const current = press.current;
        if (current === null || current.pointerId !== event.pointerId) return;
        if (current.lifted) {
          swallowClick.current = true;
          const deltaMin = snapped(event.clientY - current.startY);
          if (deltaMin !== 0) onMove(blockId, deltaMin);
        }
        end();
      },
      onPointerCancel: end,
      onClickCapture(event: React.MouseEvent<HTMLElement>) {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        event.stopPropagation();
        event.preventDefault();
      },
      onContextMenu(event: React.MouseEvent<HTMLElement>) {
        // The hold is the drag's, not the platform's menu.
        if (event.nativeEvent instanceof PointerEvent) return;
        if (press.current !== null) event.preventDefault();
      },
    };
  }

  return { drag, handlers, enabled: onMove !== undefined };
}
