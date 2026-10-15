"use client";

import * as React from "react";

/**
 * A band swiped away (USE-37; first-edit.md, "Adjusting in place"): a block
 * or meal on the column dragged sideways past the threshold leaves, and
 * `onSwipeAway` takes it off the date (with its Undo Toaster). Short of the
 * threshold it settles back. One listener set on the column's root finds the
 * band under the pointer by `data-block-id`, so no band carries its own.
 *
 * The band follows the finger and fades; under reduced motion it only fades
 * (canon C-P11). Vertical moves stay the scroller's: bands are `pan-y`, and a
 * move that starts more up-and-down than sideways is not a swipe. A swipe
 * never also opens the block: the click that ends it is swallowed.
 */

/** Past this the band leaves [ASSUMPTION: a third of the band, at least 96 px]. */
const MIN_THRESHOLD_PX = 96;
const THRESHOLD_SHARE = 1 / 3;
/** A move this far before the axis is read. */
const SLOP_PX = 8;

interface Drag {
  band: HTMLElement;
  id: string;
  pointerId: number;
  x: number;
  y: number;
  axis: "x" | "y" | null;
  dx: number;
}

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function paint(band: HTMLElement, dx: number, settle: boolean) {
  const width = band.offsetWidth || 1;
  const reduced = reducedMotion();
  band.style.transition = settle
    ? "transform var(--dur-sheet) var(--ease-settle), opacity var(--dur-state) var(--ease-settle)"
    : "none";
  band.style.transform = reduced || dx === 0 ? "" : `translateX(${dx}px)`;
  band.style.opacity =
    dx === 0 ? "" : String(Math.max(0, 1 - Math.abs(dx) / width));
}

export function useSwipeAway(
  onSwipeAway: ((blockId: string) => Promise<unknown> | void) | undefined,
) {
  const drag = React.useRef<Drag | null>(null);

  if (onSwipeAway === undefined) return {};

  function swallowNextClick(band: HTMLElement) {
    const stop = (event: Event) => {
      event.stopPropagation();
      event.preventDefault();
    };
    band.addEventListener("click", stop, { capture: true, once: true });
    // A swipe that ends off the band leaves no click to swallow.
    window.setTimeout(
      () => band.removeEventListener("click", stop, { capture: true }),
      0,
    );
  }

  return {
    className: "[&_[data-block-id]]:touch-pan-y",
    onPointerDown(event: React.PointerEvent<HTMLElement>) {
      if (event.button !== 0) return;
      const band = (event.target as HTMLElement).closest<HTMLElement>(
        "[data-block-id]",
      );
      const id = band?.dataset.blockId;
      if (!band || !id) return;
      drag.current = {
        band,
        id,
        pointerId: event.pointerId,
        x: event.clientX,
        y: event.clientY,
        axis: null,
        dx: 0,
      };
    },
    onPointerMove(event: React.PointerEvent<HTMLElement>) {
      const current = drag.current;
      if (!current || current.pointerId !== event.pointerId) return;
      const dx = event.clientX - current.x;
      const dy = event.clientY - current.y;
      if (current.axis === null) {
        if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP_PX) return;
        current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
        if (current.axis === "x") {
          current.band.setPointerCapture(event.pointerId);
        }
      }
      if (current.axis !== "x") return;
      current.dx = dx;
      paint(current.band, dx, false);
    },
    onPointerUp() {
      const current = drag.current;
      drag.current = null;
      if (!current || current.axis !== "x") return;
      swallowNextClick(current.band);
      const width = current.band.offsetWidth;
      const threshold = Math.max(MIN_THRESHOLD_PX, width * THRESHOLD_SHARE);
      if (Math.abs(current.dx) < threshold) {
        paint(current.band, 0, true);
        return;
      }
      const { band } = current;
      paint(band, Math.sign(current.dx) * width, true);
      // The band stays gone until the day reads it gone; a failed write brings it back.
      void Promise.resolve(onSwipeAway?.(current.id)).catch(() =>
        paint(band, 0, true),
      );
    },
    onPointerCancel() {
      const current = drag.current;
      drag.current = null;
      if (current) paint(current.band, 0, true);
    },
  };
}
