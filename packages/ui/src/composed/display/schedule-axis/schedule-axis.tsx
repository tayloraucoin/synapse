/**
 * ScheduleAxis — the vertical time grid (v2 handoff §5.7, Phase 2).
 *
 * A positioned layer inside a native scroll container. No `scroll-area`
 * (§2.6): the day is long, the scroll must be the platform's own, and a custom
 * scroller on a touch device is a worse scroller.
 *
 * `role="grid"` WITH A ROW PER 15-MINUTE BAND. This is the accessibility
 * decision that makes the Schedule usable without sight: a screen-reader user
 * moves through the day in order, band by band, instead of meeting an
 * unordered pile of absolutely positioned buttons. The bands are empty
 * gridcells; the blocks are the children, focusable in time order.
 *
 * `pxPerHour` goes to 96 at ≥150% text scale so the 30-minute hairlines stay
 * apart — at 64px an hour, enlarged labels collide.
 *
 * Children are absolutely positioned by their own `topPx`/`heightPx`; the axis
 * owns the geometry constants and hands them out through `pxPerHour`.
 */
"use client";

import * as React from "react";

import { cn } from "../../../lib/cn";
import { Button } from "../../../primitives/control/button";

const MIN_PER_BAND = 15;
const GUTTER_PX = 48;

export interface ScheduleAxisProps {
  /** Minutes from day start. */
  startMin: number;
  endMin: number;
  pxPerHour?: 64 | 96;
  timeZone: string;
  locale?: string;
  onExtend?: (direction: "earlier" | "later") => void;
  /** Absolutely positioned blocks, spans, ghosts and bands. */
  children: React.ReactNode;
  className?: string;
}

/** "7 AM" from minutes-from-midnight, in the day's zone. */
function hourLabel(
  minutes: number,
  timeZone: string,
  locale: string | undefined,
): string {
  const date = new Date(Date.UTC(2000, 0, 1, 0, 0, 0));
  date.setUTCMinutes(minutes);
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function ScheduleAxis({
  startMin,
  endMin,
  pxPerHour = 64,
  timeZone,
  locale,
  onExtend,
  children,
  className,
}: ScheduleAxisProps) {
  const spanMin = Math.max(0, endMin - startMin);
  const bandCount = Math.ceil(spanMin / MIN_PER_BAND);
  const heightPx = (spanMin / 60) * pxPerHour;

  const hours = React.useMemo(() => {
    const first = Math.ceil(startMin / 60) * 60;
    const out: number[] = [];
    for (let m = first; m <= endMin; m += 60) out.push(m);
    return out;
  }, [endMin, startMin]);

  return (
    <div className={cn("relative overflow-y-auto", className)}>
      {onExtend === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExtend("earlier")}
          className="w-full"
        >
          Earlier
        </Button>
      )}

      <div
        role="grid"
        aria-rowcount={bandCount}
        aria-label="Schedule"
        style={{ height: `${heightPx}px`, paddingInlineStart: `${GUTTER_PX}px` }}
        className="relative"
      >
        {/* One gridcell per 15 minutes — the order a screen reader walks. */}
        {Array.from({ length: bandCount }, (_, index) => {
          const bandMin = startMin + index * MIN_PER_BAND;
          const isHour = bandMin % 60 === 0;
          const isHalf = bandMin % 30 === 0;

          return (
            <div
              key={bandMin}
              role="row"
              aria-rowindex={index + 1}
              style={{
                top: `${((bandMin - startMin) / 60) * pxPerHour}px`,
                height: `${(MIN_PER_BAND / 60) * pxPerHour}px`,
              }}
              className="absolute inset-x-0"
            >
              <div
                role="gridcell"
                className={cn(
                  "h-full border-t",
                  isHour
                    ? "border-neutral-300 dark:border-neutral-600"
                    : isHalf || pxPerHour === 96
                      ? "border-neutral-200 dark:border-neutral-700"
                      : "border-transparent",
                )}
              />
            </div>
          );
        })}

        {/* Hour labels live in the gutter, outside the padded content box. */}
        {hours.map((minute) => (
          <span
            key={minute}
            aria-hidden="true"
            style={{
              top: `${((minute - startMin) / 60) * pxPerHour}px`,
              width: `${GUTTER_PX}px`,
            }}
            // Absolute positioning resolves against the padding box, so
            // `start-0` lands inside the 48px gutter the padding reserves.
            className="text-text-secondary absolute start-0 -translate-y-1/2 pe-(--space-2) text-end text-(length:--fs-caption) tabular-nums"
          >
            {hourLabel(minute, timeZone, locale)}
          </span>
        ))}

        {children}
      </div>

      {onExtend === undefined ? null : (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onExtend("later")}
          className="w-full"
        >
          Later
        </Button>
      )}
    </div>
  );
}
