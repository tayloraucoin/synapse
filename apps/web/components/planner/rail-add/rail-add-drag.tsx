"use client";

import { clockFromMinutes } from "@syn/utils";
import { clockLabel } from "../day-column/copy";

/**
 * RailAddDrag (USE-54; add-from-the-rail/states/rail-drag.md; D-USE-18):
 * while the rail + is held and dragged, the + becomes the time. A filled
 * ink tag in the gutter reads "10:15"; from it a solid ink line runs to the
 * rail's edge only, then a faint dashed guide crosses the column, never a
 * solid line over content. Laid on the day column's axis, as the +.
 *
 * Decorative: the + itself carries the name and the live time for
 * assistive tech.
 */
export interface RailAddDragProps {
  /** Minutes from midnight: where the drag reads now. */
  atMin: number;
  /** The column's first hour, minutes from midnight. */
  startMin: number;
  pxPerHour: number;
  /** The rail's width, px: the solid line stops there. */
  gutterPx: number;
}

export function RailAddDrag({
  atMin,
  startMin,
  pxPerHour,
  gutterPx,
}: RailAddDragProps) {
  const top = ((atMin - startMin) / 60) * pxPerHour;
  return (
    <div
      aria-hidden="true"
      data-rail-drag
      style={{ top: `${top}px` }}
      className="pointer-events-none absolute inset-x-0 z-20"
    >
      <span
        style={{ width: `${gutterPx}px` }}
        className="absolute start-0 top-1/2 h-px -translate-y-1/2 bg-foreground"
      />
      <span
        style={{ insetInlineStart: `${gutterPx}px` }}
        className="absolute end-0 top-1/2 -translate-y-1/2 border-t border-dashed border-muted-foreground opacity-60"
      />
      <span className="absolute -start-(--space-3) top-1/2 flex h-(--space-6) -translate-y-1/2 items-center rounded-(--radius-control) bg-foreground px-(--space-2) text-(length:--fs-label) font-semibold text-background tabular-nums">
        {clockLabel(clockFromMinutes(atMin))}
      </span>
    </div>
  );
}
