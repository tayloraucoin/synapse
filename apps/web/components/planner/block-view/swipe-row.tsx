"use client";

import * as React from "react";
import { cn } from "@syn/ui";

/**
 * SwipeRow — swipe a row left to reveal Remove (USE-48;
 * block-view/states/checked-swipe.md). Remove fills the row's trailing end,
 * its full height, in ink (`--color-primary`), never red. Past half its
 * width the row stays open; short of it, it closes. One row open at a time:
 * the caller holds which.
 *
 * Built on pointer events, no new dependency (the contract's dev call).
 * Vertical moves stay the page's scroll (`touch-pan-y`); a move that starts
 * more up-and-down than sideways is not a swipe, and the grip and the
 * checkbox never start one. Under reduced motion the reveal snaps (canon
 * C-P11). The swipe is the pointer's path; Remove is also on the row's
 * long-press menu, its keyboard and screen-reader path, so the revealed
 * button is out of the tab order until the row is open. Props only.
 */
export interface SwipeRowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** "Remove". */
  removeLabel: string;
  /** "Remove Start the cold bath". */
  removeName: string;
  onRemove: () => void;
  /** Off in Edit's drag and in editing modes that swipe their own way. */
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** A move this far before the axis is read. */
const SLOP_PX = 8;

function reducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function SwipeRow({
  open,
  onOpenChange,
  removeLabel,
  removeName,
  onRemove,
  disabled = false,
  children,
  className,
}: SwipeRowProps) {
  const actionRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const rootRef = React.useRef<HTMLDivElement>(null);
  /** Remove shows only while revealed, so no edge of it peeks at rest. */
  const revealing = (on: boolean) => {
    if (rootRef.current) rootRef.current.dataset.revealing = String(on);
  };
  const drag = React.useRef<{
    pointerId: number;
    x: number;
    y: number;
    axis: "x" | "y" | null;
    dx: number;
    from: number;
  } | null>(null);
  const swallowClick = React.useRef(false);

  const width = () => actionRef.current?.offsetWidth ?? 0;

  function paint(offset: number, settle: boolean) {
    const content = contentRef.current;
    if (!content) return;
    const snap = reducedMotion();
    content.style.transition =
      settle && !snap
        ? "transform var(--dur-sheet) var(--ease-settle)"
        : "none";
    content.style.transform = offset === 0 ? "" : `translateX(${offset}px)`;
  }

  // Open and closed are the caller's: paint them when they change.
  React.useLayoutEffect(() => {
    paint(open ? -width() : 0, true);
  }, [open]);

  function onPointerDown(event: React.PointerEvent) {
    if (disabled || event.button !== 0) return;
    const target = event.target as HTMLElement;
    if (target.closest("[data-grip],[data-no-swipe]")) return;
    drag.current = {
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      axis: null,
      dx: 0,
      from: open ? -width() : 0,
    };
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    const dx = event.clientX - current.x;
    const dy = event.clientY - current.y;
    if (current.axis === null) {
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SLOP_PX) return;
      current.axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (current.axis === "x") {
        event.currentTarget.setPointerCapture(event.pointerId);
        revealing(true);
      }
    }
    if (current.axis !== "x") return;
    current.dx = dx;
    const offset = Math.min(0, Math.max(-width(), current.from + dx));
    if (!reducedMotion()) paint(offset, false);
  }

  function onPointerUp() {
    const current = drag.current;
    drag.current = null;
    if (!current || current.axis !== "x") return;
    // The tap that ends a swipe neither checks nor opens.
    swallowClick.current = true;
    const offset = current.from + current.dx;
    const next = offset < -width() / 2;
    paint(next ? -width() : 0, true);
    revealing(false);
    if (next !== open) onOpenChange(next);
  }

  return (
    <div
      ref={rootRef}
      className={cn(
        "group/swipe relative overflow-hidden bg-inherit",
        className,
      )}
      data-swipe-open={open || undefined}
    >
      <button
        ref={actionRef}
        type="button"
        aria-label={removeName}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={onRemove}
        className={cn(
          "absolute inset-y-0 end-0 flex w-24 min-w-(--target) items-center justify-center",
          "invisible group-data-[revealing=true]/swipe:visible group-data-swipe-open/swipe:visible",
          "bg-primary text-primary-foreground text-(length:--fs-body) font-semibold",
          "focus-visible:ring-ring focus-visible:ring-2 focus-visible:ring-inset focus-visible:outline-none",
        )}
      >
        {removeLabel}
      </button>
      <div
        ref={contentRef}
        // The row's own ground (the lifted row's surface), over Remove.
        className="relative touch-pan-y bg-inherit"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          drag.current = null;
          revealing(false);
          paint(open ? -width() : 0, true);
        }}
        onClickCapture={(event) => {
          if (swallowClick.current) {
            swallowClick.current = false;
            event.preventDefault();
            event.stopPropagation();
            return;
          }
          // A tap on an open row closes it (swipe back, or tap elsewhere).
          if (open) {
            event.preventDefault();
            event.stopPropagation();
            onOpenChange(false);
          }
        }}
      >
        {children}
      </div>
    </div>
  );
}
