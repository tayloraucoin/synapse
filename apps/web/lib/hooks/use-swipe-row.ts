"use client";

import * as React from "react";

/**
 * useSwipeRow — the phone's swipe right on a work row (USE-70; D-USE-53,
 * D-USE-61). A finger or pen that starts past the screen's left edge zone
 * and travels right drags the row; let go past the reveal and it fires.
 *
 * - The edge zone is the browser's back gesture: a press inside it is never
 *   taken, so the row does not move (C-USE-today-thumb-firing-2).
 * - A firing row is `disabled`: bringing back is a tap on its mark only,
 *   never a swipe (C-USE-today-thumb-firing-4).
 * - The first few pixels decide: mostly down or leftward is a scroll and the
 *   swipe lets go; mostly rightward locks it, and the tap that ends it is
 *   swallowed so the sheet does not open.
 * - A mouse never swipes: the desk has F and the ring (D-USE-62).
 *
 * The decision is `swipeOutcome`, pure, so a test reads it in node. The row
 * needs `touch-action: pan-y` so the browser keeps the scroll and hands the
 * sideways travel here.
 */

/** The screen edge left to the browser's back gesture (the dev's call). */
export const SWIPE_EDGE_PX = 24;
/** The reveal's width as drawn; let go past it and the row fires. */
export const SWIPE_REVEAL_PX = 104;
/** Travel that decides between a swipe and a scroll. */
const LOCK_PX = 10;
/** How far past the reveal the row follows before it stops. */
const OVERDRAG_PX = 24;

export interface SwipeInput {
  /** Where the press began, from the screen's left edge. */
  startX: number;
  /** Rightward travel at release. */
  dx: number;
  /** A firing row, or no way to fire. */
  disabled: boolean;
}

/** What a released swipe does: fire, or nothing. */
export function swipeOutcome({
  startX,
  dx,
  disabled,
}: SwipeInput): "fire" | "none" {
  if (disabled) return "none";
  if (startX < SWIPE_EDGE_PX) return "none";
  return dx >= SWIPE_REVEAL_PX ? "fire" : "none";
}

/** Whether the first travel is a swipe ("lock"), a scroll ("release") or undecided. */
export function swipeLock(dx: number, dy: number): "lock" | "release" | null {
  if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return null;
  return dx > 0 && Math.abs(dx) > Math.abs(dy) ? "lock" : "release";
}

export interface SwipeRow {
  /** How far the row sits to the right, in px. */
  offset: number;
  /** A finger is on it: the row follows with no transition. */
  dragging: boolean;
  /** Past the reveal: letting go fires. */
  armed: boolean;
  handlers: {
    onPointerDown: (event: React.PointerEvent) => void;
    onPointerMove: (event: React.PointerEvent) => void;
    onPointerUp: (event: React.PointerEvent) => void;
    onPointerCancel: () => void;
    onClickCapture: (event: React.MouseEvent) => void;
  };
}

export function useSwipeRow({
  disabled,
  onFire,
}: {
  disabled: boolean;
  onFire: () => void;
}): SwipeRow {
  const press = React.useRef<{
    id: number;
    x: number;
    y: number;
    locked: boolean;
  } | null>(null);
  const swallowClick = React.useRef(false);
  const [offset, setOffset] = React.useState(0);
  const [dragging, setDragging] = React.useState(false);

  function reset() {
    press.current = null;
    setDragging(false);
    setOffset(0);
  }

  return {
    offset,
    dragging,
    armed: offset >= SWIPE_REVEAL_PX,
    handlers: {
      onPointerDown(event) {
        if (disabled || event.pointerType === "mouse" || !event.isPrimary)
          return;
        // The edge is the browser's; the row stays put.
        if (event.clientX < SWIPE_EDGE_PX) return;
        press.current = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          locked: false,
        };
      },
      onPointerMove(event) {
        const start = press.current;
        if (!start || start.id !== event.pointerId) return;
        const dx = event.clientX - start.x;
        const dy = event.clientY - start.y;
        if (!start.locked) {
          const lock = swipeLock(dx, dy);
          if (lock === null) return;
          if (lock === "release") {
            press.current = null;
            return;
          }
          start.locked = true;
          setDragging(true);
          (event.currentTarget as HTMLElement).setPointerCapture?.(
            event.pointerId,
          );
        }
        setOffset(Math.min(Math.max(dx, 0), SWIPE_REVEAL_PX + OVERDRAG_PX));
      },
      onPointerUp(event) {
        const start = press.current;
        if (!start || start.id !== event.pointerId) return;
        if (start.locked) {
          swallowClick.current = true;
          const outcome = swipeOutcome({
            startX: start.x,
            dx: event.clientX - start.x,
            disabled,
          });
          if (outcome === "fire") onFire();
        }
        reset();
      },
      onPointerCancel: reset,
      // The tap that ends a swipe opens no sheet.
      onClickCapture(event) {
        if (!swallowClick.current) return;
        swallowClick.current = false;
        event.preventDefault();
        event.stopPropagation();
      },
    },
  };
}
