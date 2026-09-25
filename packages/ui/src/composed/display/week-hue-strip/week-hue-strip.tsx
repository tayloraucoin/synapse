/**
 * WeekHueStrip — a plan's day as a thin strip of its blocks' hues (UX v1.3
 * §4.5, §13 #36, R47, TD-29; DAY-7).
 *
 * Screen 5's rows: a 12px-high row of segments, each a block's hue
 * (`bg-block-<kind>`, sleep's quiet `bg-block-sleep`), each as wide as its
 * minutes are of the whole. A PICTURE, `aria-hidden`: the row's summary line
 * beside it is the text. A planning surface — never `/today` or the Schedule.
 *
 * A very short block (a five-minute orient) keeps a 2px floor so it is not
 * lost; an empty list draws nothing (an unstructured day has no strip).
 */
import type { BlockKind } from "@syn/types";
import * as React from "react";

import { cn } from "../../../lib/cn";

export type WeekHueSegmentKind = BlockKind | "sleep";

export interface WeekHueStripProps {
  segments: ReadonlyArray<{ kind: WeekHueSegmentKind; minutes: number }>;
  className?: string;
}

/** Whole class names per kind, so Tailwind sees every one. */
const SEGMENT_HUE: Record<WeekHueSegmentKind, string> = {
  orient: "bg-block-orient",
  morning: "bg-block-morning",
  training: "bg-block-training",
  prep: "bg-block-prep",
  work: "bg-block-work",
  break: "bg-block-break",
  transition: "bg-block-transition",
  activity: "bg-block-activity",
  wind_down: "bg-block-wind-down",
  sleep: "bg-block-sleep",
};

export function WeekHueStrip({ segments, className }: WeekHueStripProps) {
  const drawn = segments.filter((segment) => segment.minutes > 0);
  if (drawn.length === 0) return null;

  return (
    <div
      aria-hidden="true"
      data-week-hue-strip
      className={cn("flex h-3 w-full gap-px overflow-hidden rounded-(--radius)", className)}
    >
      {drawn.map((segment, index) => (
        <span
          key={`${segment.kind}-${index}`}
          data-kind={segment.kind}
          // Grows by its minutes; a 2px floor keeps a five-minute block visible.
          style={{ flexGrow: segment.minutes, flexBasis: 0, minWidth: "2px" }}
          className={cn("h-full", SEGMENT_HUE[segment.kind])}
        />
      ))}
    </div>
  );
}
