/**
 * GapBand — the empty band between two stacked things (UX v1.1 §3.11, §10.1
 * *Slack*).
 *
 * In the block editor: "the gaps render as thin empty bands with the minutes
 * written in the gutter (*+5*); a gap of zero is a hairline." On the
 * Schedule: "Empty band between two block bands, labelled in the gutter
 * (*12 min*) … Never coloured."
 *
 * THE SEAM IS THE HANDLE. When `resizable`, the band's edge is a
 * `separator` a person drags "exactly like resizing a textarea" (§3.11); the
 * minutes are its value, so a screen reader hears *gap, 5 minutes*, and the
 * keyboard path (`g` then a number) is the `DragLayer`'s. The band itself
 * never emits a change — it reports the pointer-down and the layer does the
 * rest.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { bandVariants } from "../block-band/band.variants";
import { SCHEDULE_GUTTER_PX } from "../schedule-axis";

export interface GapBandProps {
  /** Below zero is a validator's failure upstream; here it is a hairline. */
  minutes: number;
  topPx: number;
  heightPx: number;
  /** *+5* for a gap in a block; *12 min* for slack between blocks. */
  label?: "gap" | "slack";
  /** Which two things the seam sits between, for the separator's name. */
  between?: { before: string; after: string };
  /** The axis's hour-label column; the band starts after it, the minutes sit in it. */
  gutterPx?: number;
  resizable?: boolean;
  onSeamPointerDown?: (event: React.PointerEvent<HTMLDivElement>) => void;
  onSeamKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  className?: string;
}

export function GapBand({
  minutes,
  topPx,
  heightPx,
  label = "gap",
  between,
  gutterPx = SCHEDULE_GUTTER_PX,
  resizable = false,
  onSeamPointerDown,
  onSeamKeyDown,
  className,
}: GapBandProps) {
  const clamped = Math.max(0, minutes);
  const hairline = clamped === 0;
  const text = label === "gap" ? `+${clamped}` : `${clamped} min`;
  const name =
    between === undefined
      ? `${label}, ${clamped} minutes`
      : `${label} between ${between.before} and ${between.after}, ${clamped} minutes`;

  return (
    <div
      data-gap-band
      style={{ top: `${topPx}px`, height: hairline ? "0px" : `${heightPx}px` }}
      className={cn("absolute inset-x-0 z-0", className)}
    >
      <div
        aria-hidden="true"
        style={{ insetInlineStart: `${gutterPx}px` }}
        className={cn(bandVariants({ tone: hairline ? "hairline" : "gap" }), "inset-y-0 end-0")}
      />

      {hairline ? null : (
        <span
          aria-hidden="true"
          style={{ width: `${gutterPx}px` }}
          className="absolute start-0 top-1/2 -translate-y-1/2 pe-(--space-2) text-end"
        >
          <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
            {text}
          </Text>
        </span>
      )}

      {resizable ? (
        <div
          role="separator"
          aria-orientation="horizontal"
          aria-label={name}
          aria-valuenow={clamped}
          aria-valuemin={0}
          tabIndex={0}
          data-gap-seam
          onPointerDown={onSeamPointerDown}
          onKeyDown={onSeamKeyDown}
          style={{ insetInlineStart: `${gutterPx}px` }}
          className={cn(
            "absolute end-0 -top-1 h-2 cursor-row-resize touch-none",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
          )}
        />
      ) : null}
    </div>
  );
}
