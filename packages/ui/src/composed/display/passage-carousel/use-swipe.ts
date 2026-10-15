"use client";

import * as React from "react";

/**
 * A horizontal swipe on pointer events, no library (RUN-7; shared with the
 * reader, USE-13). Past `SWIPE_PX` a release moves one step; a vertical
 * gesture is the page's scroll, never ours. `dragX` follows the finger for
 * the slide's translate, and stays 0 under reduced motion so the slides snap.
 */

const SWIPE_PX = 40;

export function useSwipe({
  onNext,
  onPrevious,
  reducedMotion,
}: {
  onNext: () => void;
  onPrevious: () => void;
  reducedMotion: boolean;
}) {
  const pointer = React.useRef<{ id: number; startX: number; startY: number } | null>(null);
  const [dragX, setDragX] = React.useState(0);

  const handlers = {
    onPointerDown: (event: React.PointerEvent) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      pointer.current = { id: event.pointerId, startX: event.clientX, startY: event.clientY };
    },
    onPointerMove: (event: React.PointerEvent) => {
      const start = pointer.current;
      if (!start || start.id !== event.pointerId) return;
      const dx = event.clientX - start.startX;
      const dy = event.clientY - start.startY;
      if (Math.abs(dy) > Math.abs(dx)) return;
      setDragX(reducedMotion ? 0 : dx);
    },
    onPointerUp: (event: React.PointerEvent) => {
      const start = pointer.current;
      if (!start || start.id !== event.pointerId) return;
      pointer.current = null;
      const dx = event.clientX - start.startX;
      setDragX(0);
      if (dx <= -SWIPE_PX) onNext();
      else if (dx >= SWIPE_PX) onPrevious();
    },
    onPointerCancel: () => {
      pointer.current = null;
      setDragX(0);
    },
  };

  return { dragX, handlers };
}
