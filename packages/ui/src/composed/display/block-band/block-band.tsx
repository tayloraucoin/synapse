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
 *
 * UX v1.2 §4.13i, S12.1 (RUN-7): `labelPlacement="inside"` draws the name
 * and span inside the band's top edge — caption size, `text-text-secondary`,
 * 8px from the band's top-left — for the day builder's short axis, where the
 * gutter labels would collide. Left unset, the band takes the axis's word
 * (`BandLabelPlacementContext`): *inside* under three hours, the gutter
 * otherwise. `span` is the *7:00–9:00* the inside label carries.
 */
"use client";

import type { BlockKind } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { BLOCK_HEADER_COPY, BLOCK_KIND_WORDS } from "../block-header/copy";
import { BandLabelPlacementContext, SCHEDULE_GUTTER_PX, type BandLabelPlacement } from "../schedule-axis";
import { BLOCK_LABEL_HUE, bandVariants } from "./band.variants";

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
  /** Where the name goes; the axis decides when unset (v1.2 §4.13i). */
  labelPlacement?: BandLabelPlacement;
  /** *7:00–9:00* — read beside the name when the label is inside the band. */
  span?: string;
  /**
   * The inside label's distance from the band's top — 8px by default (§10.3).
   * UX v1.3 §4.2 (DAY-8): at the primer's 28px an hour a five-minute band is
   * 2px tall, so the primer lays the labels in one lane down the axis and
   * hands each band its offset; a label may then run past its band's foot.
   */
  labelOffsetPx?: number;
  /**
   * UX v1.2 §4.13i (RUN-12) — a read-only strip where the band is the way
   * to its screen: the label becomes a button named `editLabel`
   * (*Morning, 7:45–8:40, edit*). Ignored when `draggable`.
   */
  onEdit?: () => void;
  editLabel?: string;
  /**
   * UX v1.3 R47, TD-29 (DAY-7): the kind's hue — the wash and the label's
   * pairing, decided by the kind. PLANNING SURFACES ONLY: the primer, the
   * builder's progress and review, the week. Never `/today` or the Schedule.
   */
  hue?: boolean;
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
  labelPlacement,
  span,
  labelOffsetPx = LABEL_TOP_PX,
  onEdit,
  editLabel,
  hue = false,
  className,
}: BlockBandProps) {
  // Hued: the label takes the kind's 700 (200 in dark) instead of the secondary tone.
  const labelTone = hue ? BLOCK_LABEL_HUE[kind] : undefined;
  const label = name ?? BLOCK_KIND_WORDS[kind];
  const axisPlacement = React.useContext(BandLabelPlacementContext);
  const inside = (labelPlacement ?? axisPlacement) === "inside";
  const labelText = inside && span !== undefined ? `${label} · ${span}` : label;

  // Inside: the label sits in the band, 8px from its top-left, past the gutter.
  const labelStyle: React.CSSProperties = inside
    ? { top: `${labelOffsetPx}px`, insetInlineStart: `${gutterPx + LABEL_TOP_PX}px` }
    : { top: `${LABEL_TOP_PX}px`, width: `${gutterPx}px` };
  const labelClass = inside ? "absolute z-10 text-start" : "absolute start-0 pe-(--space-2) text-end";

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
        className={cn(bandVariants({ tone: pooled ? "pooled" : "block", kind, hue }), "inset-y-0 end-0")}
      />

      {draggable ? (
        <button
          type="button"
          data-block-handle
          data-block-id={blockId}
          aria-label={`Move ${label}`}
          onPointerDown={onHeaderPointerDown}
          onKeyDown={onHeaderKeyDown}
          style={labelStyle}
          className={cn(
            labelClass,
            "z-10 cursor-grab touch-none",
            "min-h-(--target)",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
          )}
        >
          <Text as="span" variant="caption" tone="secondary" className={cn("tabular-nums", labelTone)}>
            {labelText}
          </Text>
        </button>
      ) : onEdit !== undefined ? (
        <button
          type="button"
          aria-label={editLabel ?? labelText}
          onClick={onEdit}
          style={labelStyle}
          className={cn(
            labelClass,
            "z-10 min-h-(--target) cursor-pointer",
            "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:outline-none",
          )}
        >
          <Text as="span" variant="caption" tone="secondary" className={cn("tabular-nums", labelTone)}>
            {labelText}
          </Text>
        </button>
      ) : (
        <span aria-hidden="true" style={labelStyle} className={labelClass}>
          <Text as="span" variant="caption" tone="secondary" className={cn("tabular-nums", labelTone)}>
            {labelText}
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
