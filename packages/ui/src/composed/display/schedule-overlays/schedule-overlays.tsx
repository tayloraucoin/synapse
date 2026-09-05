/**
 * WindowSpan · GhostBlock · ShiftBand — the schedule's three overlays
 * (v2 handoff §5.7, Phase 2).
 *
 * One folder, three exports, for the same reason as `BigNumber`: they are
 * layers on one surface and are never imported apart.
 *
 * WindowSpan is the flexible range an item may happen in — a dashed outline
 * with no fill and no focus, because it is not a thing, it is room.
 *
 * GhostBlock is where an item was *planned* before the day moved it. It stays
 * on the schedule so a person can see what the day originally was, and it
 * opens the live item rather than the ghost — the past is readable, not
 * editable.
 *
 * ShiftBand marks the moment the day moved, with the delta and the reason in
 * violet — the product's one "this moved" colour (official spec §9.3).
 */
"use client";

import type { DayItemView } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export interface WindowSpanProps {
  topPx: number;
  heightPx: number;
  className?: string;
}

export function WindowSpan({ topPx, heightPx, className }: WindowSpanProps) {
  return (
    <div
      aria-hidden="true"
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      className={cn(
        "pointer-events-none absolute inset-x-0 rounded-(--radius)",
        "border border-dashed border-edge bg-paper",
        className,
      )}
    />
  );
}

export interface GhostBlockProps {
  item: DayItemView;
  topPx: number;
  heightPx: number;
  onOpen: (item: DayItemView) => void;
  className?: string;
}

export function GhostBlock({
  item,
  topPx,
  heightPx,
  onOpen,
  className,
}: GhostBlockProps) {
  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      aria-label={`${item.title}, planned`}
      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
      className={cn(
        "absolute inset-x-0 overflow-hidden rounded-(--radius) px-(--space-2) text-left",
        "border border-edge",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <Text
        as="span"
        variant="caption"
        tone="muted"
        truncate
        className="line-through"
      >
        {item.title}
      </Text>
      <Text as="span" variant="caption" tone="muted" className="block">
        planned
      </Text>
    </button>
  );
}

export interface ShiftBandProps {
  topPx: number;
  deltaMin: number;
  reasonLabel: string;
  onOpen: () => void;
  className?: string;
}

export function ShiftBand({
  topPx,
  deltaMin,
  reasonLabel,
  onOpen,
  className,
}: ShiftBandProps) {
  const label = `shifted +${deltaMin} min, ${reasonLabel}`;

  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label={label}
      style={{ top: `${topPx}px` }}
      className={cn(
        "absolute inset-x-0 flex h-5 items-center rounded-(--radius) px-(--space-2)",
        "bg-violet-band text-violet-band-text",
        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        className,
      )}
    >
      <span className="truncate text-(length:--fs-caption) tabular-nums">
        {label}
      </span>
    </button>
  );
}
