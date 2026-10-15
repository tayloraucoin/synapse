"use client";

import * as React from "react";
import { AddIcon, cn, CollapseIcon, ExpandIcon, Text } from "@syn/ui";
import { clockFromMinutes } from "@syn/utils";
import {
  DAY_COLUMN_GUTTER_PX,
  DAY_COLUMN_PX_PER_HOUR,
} from "@/components/planner/day-column";
import { RailAddDrag, railTimeAt } from "@/components/planner/rail-add";
import type { RailHintAction } from "@/lib/data/review-first-times";
import { REVIEW_EDITS_COPY as COPY } from "./edits-copy";

/**
 * The rail + (USE-37; D-USE-15, D-USE-18): one + in the time gutter, 40 by
 * `--row-min` with a 1 px ink border and its up and down marks, centred on
 * the next free time. Laid over the axis as the day column's child; when
 * that time is off the screen it rests at the visible edge of the column
 * (the Monday's 15:00 shows beside Lunch, at the foot over the fade).
 *
 * A tap opens the add sheet at its time. A hold that moves is the drag
 * (USE-54; add-from-the-rail/states/rail-drag.md): the + becomes the time,
 * in 15-minute steps stopped at the day's edges, with `RailAddDrag`'s tag,
 * rail line and guide; release opens the add sheet there, and letting go
 * back on the +'s own time cancels. The first drag dismisses the hint. On the first mornings the hint sits to its right,
 * an ink callout with a pointer at the +: "Tap to add. Hold and drag up or
 * down to pick the time." and Got it.
 */

/** Moved this far while held, it is a drag, not a tap. */
const DRAG_SLOP_PX = 8;
/** The breath kept from the scroller's edges when the + rests there. */
const EDGE_PX = 8;

export interface RailPlusProps {
  /** Minutes from midnight: the next free time. */
  atMin: number;
  /** The column's first hour, minutes from midnight. */
  startMin: number;
  /** The column's last minute: the drag stops there. */
  endMin: number;
  /** The column's height, px, so the + stays on it. */
  heightPx: number;
  showHint: boolean;
  onTap: (at: string) => void;
  /** Released after a drag, at a time other than its own. */
  onRelease: (at: string) => void;
  onHint: (action: RailHintAction) => void;
  /** A capture's drag, held at this minute (`?state=rail-drag`). */
  heldAtMin?: number;
}

export function RailPlus({
  atMin,
  startMin,
  endMin,
  heightPx,
  showHint,
  onTap,
  onRelease,
  onHint,
  heldAtMin,
}: RailPlusProps) {
  const groupRef = React.useRef<HTMLDivElement>(null);
  const at = clockFromMinutes(atMin);
  const centre = ((atMin - startMin) / 60) * DAY_COLUMN_PX_PER_HOUR;
  const [top, setTop] = React.useState<number | null>(null);
  const press = React.useRef<{ y: number; dragged: boolean } | null>(null);
  const [dragMin, setDragMin] = React.useState<number | null>(
    heldAtMin ?? null,
  );
  const howId = React.useId();

  // Rest at the scroller's visible edge when the time is off it.
  React.useLayoutEffect(() => {
    const group = groupRef.current;
    const axis = group?.offsetParent as HTMLElement | null;
    const scroller = group?.closest<HTMLElement>("[data-day-scroller]");
    if (!group || !axis || !scroller) return;
    const place = () => {
      const axisTop = axis.getBoundingClientRect().top;
      const view = scroller.getBoundingClientRect();
      const height = group.offsetHeight;
      const plusHalf = (group.firstElementChild as HTMLElement | null)
        ?.offsetHeight;
      const wanted = centre - (plusHalf ?? height) / 2;
      const min = view.top - axisTop + EDGE_PX;
      const max = Math.min(
        view.bottom - axisTop - height - EDGE_PX,
        heightPx - height,
      );
      setTop(Math.max(min, Math.min(max, wanted)));
    };
    place();
    scroller.addEventListener("scroll", place, { passive: true });
    window.addEventListener("resize", place);
    return () => {
      scroller.removeEventListener("scroll", place);
      window.removeEventListener("resize", place);
    };
  }, [centre, heightPx, showHint]);

  return (
    <>
      <div
        ref={groupRef}
        data-rail-plus
        style={{ top: `${top ?? centre}px` }}
        className={cn(
          "absolute start-0 z-10 flex items-start gap-(--space-2)",
          top === null && "invisible",
        )}
      >
        <button
          type="button"
          aria-label={COPY.plus(at)}
          aria-describedby={howId}
          onPointerDown={(event) => {
            if (event.pointerType === "mouse" && event.button !== 0) return;
            press.current = { y: event.clientY, dragged: false };
            event.currentTarget.setPointerCapture?.(event.pointerId);
          }}
          onPointerMove={(event) => {
            const held = press.current;
            if (!held) return;
            const dy = event.clientY - held.y;
            if (!held.dragged) {
              if (Math.abs(dy) < DRAG_SLOP_PX) return;
              held.dragged = true;
              onHint("drag");
            }
            const next = railTimeAt({
              fromMin: atMin,
              dyPx: dy,
              pxPerHour: DAY_COLUMN_PX_PER_HOUR,
              window: { startMin, endMin },
            });
            setDragMin((now) => {
              // A light tick per step, where the platform has one.
              if (now !== null && now !== next) navigator.vibrate?.(5);
              return next;
            });
          }}
          onPointerUp={() => {
            const held = press.current;
            if (!held?.dragged) return;
            const released = dragMin;
            setDragMin(null);
            // Back on its own time is a cancel.
            if (released !== null && released !== atMin) {
              onRelease(clockFromMinutes(released));
            }
          }}
          onPointerCancel={() => {
            press.current = null;
            setDragMin(null);
          }}
          onClick={() => {
            const dragged = press.current?.dragged ?? false;
            press.current = null;
            if (dragged) return;
            onHint("tap");
            onTap(at);
          }}
          aria-live={dragMin === null ? undefined : "polite"}
          className={cn(
            dragMin !== null && "opacity-0",
            "flex h-(--row-min) w-10 shrink-0 touch-none flex-col items-center justify-center rounded-(--radius-control) border border-foreground bg-background text-foreground transition-colors duration-(--dur-state) ease-(--ease-settle) hover:bg-surface focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        >
          <CollapseIcon
            aria-hidden="true"
            className="size-3 text-muted-foreground"
          />
          <AddIcon aria-hidden="true" className="size-4" />
          <ExpandIcon
            aria-hidden="true"
            className="size-3 text-muted-foreground"
          />
          <span id={howId} className="sr-only">
            {dragMin === null
              ? COPY.plusHow
              : clockFromMinutes(dragMin).replace(/^0/, "")}
          </span>
        </button>
        {showHint ? <RailHint onGotIt={() => onHint("got-it")} /> : null}
      </div>
      {dragMin !== null ? (
        <RailAddDrag
          atMin={dragMin}
          startMin={startMin}
          pxPerHour={DAY_COLUMN_PX_PER_HOUR}
          gutterPx={DAY_COLUMN_GUTTER_PX}
        />
      ) : null}
    </>
  );
}

/** The one-time callout beside the + (first-mornings.md). */
function RailHint({ onGotIt }: { onGotIt: () => void }) {
  return (
    <div
      data-rail-hint
      className="relative flex w-59 flex-col items-start gap-(--space-2) rounded-(--radius-control) bg-foreground p-(--space-3)"
    >
      <span
        aria-hidden="true"
        className="absolute top-(--space-4) -start-1.5 size-0 border-y-6 border-e-6 border-y-transparent border-e-foreground"
      />
      <Text as="p" variant="secondary" className="text-background">
        {COPY.hint}
      </Text>
      <button
        type="button"
        onClick={onGotIt}
        className="-m-(--space-1) rounded-(--radius-control) p-(--space-1) text-(length:--fs-secondary) font-semibold text-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {COPY.gotIt}
      </button>
    </div>
  );
}
