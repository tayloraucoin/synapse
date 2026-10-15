"use client";

import * as React from "react";
import { cn, Text } from "@syn/ui";
import { HUE_CHIP, type BlockHue } from "../block-hue";

/**
 * DayBar — the day as one bar (USE-43; ready-go/states/welcome.md): a block
 * per segment in its kind's chip, each named, or initialled where the name
 * does not fit, so colour is never alone (P-A03); the now-tick a verdigris
 * rule, the only verdigris on it (D-P02). A block before now is faded, never
 * marked (P-A07). An empty tail is the surface. Props only; nothing on it is
 * live and nothing moves.
 *
 * Times are minutes from the date's midnight. Ticks read the bar's start,
 * its middle and its end ("7:00", "12:00", "17:00").
 */
export interface DayBarSegment {
  id: string;
  /** "Wellness", "Work", "Sunday's list". */
  label: string;
  /** "W": shown when the label does not fit. */
  initial: string;
  kindColor: BlockHue;
  startMin: number;
  endMin: number;
  faded: boolean;
}

export interface DayBarProps {
  segments: readonly DayBarSegment[];
  /** The now-tick, minutes from midnight. */
  nowAt: number;
  from: number;
  to: number;
  /** The bar's accessible name, read before its blocks ("The day"). */
  label: string;
  className?: string;
}

/** 7:05 for 425. */
function clock(minutes: number): string {
  return `${Math.floor(minutes / 60)}:${String(minutes % 60).padStart(2, "0")}`;
}

/** The label's room: the segment less its 8 px either side (--space-2). */
const LABEL_PAD_PX = 16;

export function DayBar({
  segments,
  nowAt,
  from,
  to,
  label,
  className,
}: DayBarProps) {
  const span = Math.max(1, to - from);
  const at = (minutes: number) =>
    `${((Math.min(to, Math.max(from, minutes)) - from) / span) * 100}%`;
  const shown = segments.filter((segment) => segment.endMin > segment.startMin);

  const barRef = React.useRef<HTMLDivElement>(null);
  // Ids whose name fits; until measured, every segment shows its initial.
  const [fits, setFits] = React.useState<ReadonlySet<string>>(new Set());

  React.useLayoutEffect(() => {
    const bar = barRef.current;
    if (bar === null) return;
    const measure = () => {
      const next = new Set<string>();
      for (const node of bar.querySelectorAll<HTMLElement>("[data-segment]")) {
        const name = node.querySelector<HTMLElement>("[data-measure]");
        if (name && name.offsetWidth + LABEL_PAD_PX <= node.clientWidth) {
          next.add(node.dataset.segment ?? "");
        }
      }
      setFits((current) =>
        current.size === next.size && [...next].every((id) => current.has(id))
          ? current
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(bar);
    return () => observer.disconnect();
  }, [segments]);

  const spoken = [
    `${label}, ${clock(from)} to ${clock(to)}`,
    ...shown.map(
      (segment) =>
        `${segment.label}, ${clock(segment.startMin)} to ${clock(segment.endMin)}`,
    ),
    `now ${clock(nowAt)}`,
  ].join("; ");

  return (
    <div className={cn("flex flex-col gap-(--space-1)", className)}>
      <div
        ref={barRef}
        role="img"
        aria-label={spoken}
        className="relative h-8 rounded-(--radius-control) bg-surface"
      >
        {shown.map((segment) => {
          const named = fits.has(segment.id);
          return (
            <div
              key={segment.id}
              data-segment={segment.id}
              data-faded={segment.faded || undefined}
              style={{
                left: at(segment.startMin),
                width: `calc(${at(segment.endMin)} - ${at(segment.startMin)})`,
              }}
              className={cn(
                "absolute inset-y-0 flex items-center overflow-hidden border-s-2 border-background",
                HUE_CHIP[segment.kindColor],
                named ? "justify-start ps-(--space-2)" : "justify-center",
                segment.faded && "opacity-50",
              )}
            >
              <span
                data-measure
                aria-hidden="true"
                className="invisible absolute text-(length:--fs-caption) font-medium whitespace-nowrap"
              >
                {segment.label}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  "truncate text-(length:--fs-caption) leading-(--lh-caption) font-medium",
                  segment.faded ? "text-muted-foreground" : "text-foreground",
                )}
              >
                {named ? segment.label : segment.initial}
              </span>
            </div>
          );
        })}
        <span
          aria-hidden="true"
          data-now-tick
          style={{ left: at(nowAt) }}
          className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-now"
        />
      </div>
      <div aria-hidden="true" className="relative flex justify-between">
        <Text as="span" variant="caption" tone="muted" tabular>
          {clock(from)}
        </Text>
        <Text
          as="span"
          variant="caption"
          tone="muted"
          tabular
          className="absolute left-1/2 -translate-x-1/2"
        >
          {clock(from + Math.round(span / 2))}
        </Text>
        <Text as="span" variant="caption" tone="muted" tabular>
          {clock(to)}
        </Text>
      </div>
    </div>
  );
}
