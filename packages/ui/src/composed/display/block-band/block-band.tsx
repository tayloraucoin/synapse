/**
 * BlockBand — a block kind drawn behind its items on the Schedule and in the
 * block editor (UX v1.1 §6.5, §3.11, §10.1 *Slack*, §10.3).
 *
 * "Each block kind renders as a **band** behind its items, a very light fill
 * (`bg-surface`) with the block's name in the gutter at the band's top, so
 * the day reads as *morning · prep · work · wind-down* at a glance and the
 * empty spans between bands are visibly *open*."
 *
 * A SIBLING OF THE BLOCKS, DRAWN FIRST. The band is absolutely positioned in
 * the axis's column like a `ScheduleBlock`, at a lower `z-index`; the blocks
 * are the caller's children and keep their own geometry, so a band can be
 * added to a Schedule that already positions its items without moving one.
 *
 * THE HEADER IS THE HANDLE. When `draggable`, the gutter label becomes a
 * button — *Move Morning* — that the `DragLayer` listens on to move the whole
 * block (§6.5: "Drag a block band's header to move the whole block"). The
 * fill itself is decorative and hidden from assistive tech; the name is read
 * from the `BlockHeader` above the list, or from this button when it is one.
 *
 * A POOLED BLOCK is the band with nothing in it and the caption *decide in
 * the morning* (§3.11, §4.13) — a dashed hairline, not a tint, so "nothing
 * here yet" is a shape, not a colour (§10.3).
 */
"use client";

import type { BlockKind } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { BLOCK_HEADER_COPY, BLOCK_KIND_WORDS } from "../block-header/copy";
import { SCHEDULE_GUTTER_PX } from "../schedule-axis";
import { bandVariants } from "./band.variants";

/** §10.3: "the block band's gutter label sits at 8px from the band's top." */
const LABEL_TOP_PX = 8;

export interface BlockBandProps {
  blockId?: string;
  kind: BlockKind;
  /** The template's name; the kind's own word when null. */
  name: string | null;
  topPx: number;
  heightPx: number;
  /** The axis's hour-label column; the fill starts after it, the label sits in it. */
  gutterPx?: number;
  /** Nothing in it yet — the pick decides (§3.11). */
  pooled?: boolean;
  /** The header becomes the whole-block drag handle (§6.5). */
  draggable?: boolean;
  /** Forwarded to the header button; the `DragLayer` owns the gesture. */
  onHeaderPointerDown?: (event: React.PointerEvent<HTMLButtonElement>) => void;
  onHeaderKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  /** The `ScheduleBlock`s, positioned by the caller. */
  children?: React.ReactNode;
  className?: string;
}

export function BlockBand({
  blockId,
  kind,
  name,
  topPx,
  heightPx,
  gutterPx = SCHEDULE_GUTTER_PX,
  pooled = false,
  draggable = false,
  onHeaderPointerDown,
  onHeaderKeyDown,
  children,
  className,
}: BlockBandProps) {
  const label = name ?? BLOCK_KIND_WORDS[kind];

  return (
    <div
      data-block-band
      data-block-id={blockId}
      data-block-kind={kind}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      className={cn("absolute inset-x-0 z-0", className)}
    >
      <div
        aria-hidden="true"
        style={{ insetInlineStart: `${gutterPx}px` }}
        className={cn(bandVariants({ tone: pooled ? "pooled" : "block" }), "inset-y-0 end-0")}
      />

      {draggable ? (
        <button
          type="button"
          data-block-handle
          data-block-id={blockId}
          aria-label={`Move ${label}`}
          onPointerDown={onHeaderPointerDown}
          onKeyDown={onHeaderKeyDown}
          style={{ top: `${LABEL_TOP_PX}px`, width: `${gutterPx}px` }}
          className={cn(
            "absolute start-0 z-10 cursor-grab touch-none pe-(--space-2) text-end",
            "min-h-(--target)",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
          )}
        >
          <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
            {label}
          </Text>
        </button>
      ) : (
        <span
          aria-hidden="true"
          style={{ top: `${LABEL_TOP_PX}px`, width: `${gutterPx}px` }}
          className="absolute start-0 pe-(--space-2) text-end"
        >
          <Text as="span" variant="caption" tone="secondary" className="tabular-nums">
            {label}
          </Text>
        </span>
      )}

      {pooled && children === undefined ? (
        <span className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-center px-(--space-2)">
          <Text as="span" variant="caption" tone="secondary">
            {BLOCK_HEADER_COPY.decideInTheMorning}
          </Text>
        </span>
      ) : null}

      {children}
    </div>
  );
}
