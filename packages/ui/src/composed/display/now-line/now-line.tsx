/**
 * NowLine — where the day is (v2 handoff §5.7, Phase 2).
 *
 * A 1px accent rule across the schedule with a 6px dot in the gutter and the
 * time at the right. This is one of the three places accent-500 is permitted
 * (official spec §9.3: the now line, the now/soon dot, the active-timer
 * border) — and the reason no other component in this package fills with it.
 *
 * ABSENT IN RECORD AND PLAN MODES. A "now" line on a past Tuesday would be a
 * lie; the caller simply does not render it.
 *
 * THE RAIL TAG (USE-27; D-USE-30): `tag="rail"` draws Schedule's line: the
 * time in a now tag on the hour rail (the control radius, since nothing is
 * a pill, D-P03), and a 2 px line at 55 % across the content from
 * `lineStartPx`, faint over the blocks (the board's 1.5 px is off the
 * spacing scale). Unset, the line above is unchanged.
 *
 * `aria-hidden`, and `aria-live="off"` by omission: the line moves every
 * minute, and announcing it would talk over everything else.
 */
import * as React from "react";
import { cn } from "../../../lib/cn";

export interface NowLineProps {
  /** Minutes from day start — the caller converts to px with the axis scale. */
  atMin: number;
  topPx: number;
  /** "10:42" — or the closed-day word. */
  label: string;
  closed?: boolean;
  /** `end`, the time at the line's end (the default); `rail`, a pill on the hour rail. */
  tag?: "end" | "rail";
  /** With `tag="rail"`: where the line starts, past the rail (px). */
  lineStartPx?: number;
  className?: string;
}

export function NowLine({
  atMin,
  topPx,
  label,
  closed = false,
  tag = "end",
  lineStartPx = 0,
  className,
}: NowLineProps) {
  if (tag === "rail") {
    return (
      <div
        aria-hidden="true"
        data-at-min={atMin}
        data-now-line
        style={{ top: `${topPx}px` }}
        className={cn("pointer-events-none absolute inset-x-0", className)}
      >
        <span
          style={{ insetInlineStart: `${lineStartPx}px` }}
          className="absolute end-0 top-1/2 h-0.5 -translate-y-1/2 bg-now opacity-55"
        />
        <span className="absolute -start-0.5 top-1/2 flex h-5 w-11 -translate-y-1/2 items-center justify-center rounded-(--radius-control) bg-now text-(length:--fs-caption) font-semibold text-primary-foreground tabular-nums">
          {label}
        </span>
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      data-at-min={atMin}
      style={{ top: `${topPx}px` }}
      className={cn("pointer-events-none absolute inset-x-0", className)}
    >
      <span
        className={cn(
          "absolute -start-3 top-1/2 size-1.5 -translate-y-1/2 rounded-full",
          closed ? "bg-muted-foreground" : "bg-now",
        )}
      />
      <span
        className={cn(
          "block h-px w-full",
          closed ? "bg-edge" : "bg-accent-mark",
        )}
      />
      <span
        className={cn(
          "absolute end-0 top-1/2 -translate-y-1/2 ps-(--space-2)",
          "text-(length:--fs-caption) tabular-nums",
          closed ? "text-text-secondary" : "text-accent-text",
        )}
      >
        {closed ? "closed" : label}
      </span>
    </div>
  );
}
