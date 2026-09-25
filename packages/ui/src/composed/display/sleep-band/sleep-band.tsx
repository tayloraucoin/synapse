/**
 * SleepBand — the night drawn beneath a day's axis (UX v1.3 §4.2, §4.4 B17;
 * DAY-8, DAY-11).
 *
 * NOT A BAND ON THE AXIS. Sleep is not a block kind (v1.3 §3.1), and eight
 * hours at the axis's scale would push the day off the screen, so it is drawn
 * beneath it, shortened, with its times in words — *Sleep · 22:45 to 7:00* —
 * so the shortening is said, not hidden. The wash is `bg-block-sleep`, the
 * quiet neutral the tokens give it (TD-29); the label is its secondary pair.
 *
 * In flow, past the axis's hour-label gutter so its edge lines up with the
 * bands above it. The primer (screen 2) and the builder's review (B17) draw
 * it; nothing on `/today` or the Schedule does.
 */
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";
import { SCHEDULE_GUTTER_PX } from "../schedule-axis";

export interface SleepBandProps {
  /** *Sleep · 22:45 to 7:00* — the caller's words. */
  label: string;
  /** The shortened height — an hour of the axis's scale reads well. */
  heightPx: number;
  /** The axis's hour-label column, so the band starts where the bands do. */
  gutterPx?: number;
  className?: string;
}

export function SleepBand({ label, heightPx, gutterPx = SCHEDULE_GUTTER_PX, className }: SleepBandProps) {
  return (
    <div data-sleep-band style={{ paddingInlineStart: `${gutterPx}px` }} className={className}>
      <div
        style={{ height: `${heightPx}px` }}
        className={cn("bg-block-sleep flex items-start rounded-(--radius) px-(--space-2) pt-1")}
      >
        <Text as="span" variant="caption" tone="secondary" className="text-block-sleep-label tabular-nums">
          {label}
        </Text>
      </div>
    </div>
  );
}
