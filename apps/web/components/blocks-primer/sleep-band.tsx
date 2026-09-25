import { SCHEDULE_GUTTER_PX, Text } from "@syn/ui";

import { BLOCKS_PRIMER_COPY as COPY } from "./copy";

/**
 * The example day's sleep — UX v1.3 §4.2: the whole day fits "one phone
 * screen with the sleep band shortened".
 *
 * NOT A BAND ON THE AXIS. Sleep is not a block kind (v1.3 §3.1), and eight
 * and a half hours at 28px an hour would push the day off the screen, so it
 * is drawn beneath the axis at one hour's height with its times in words —
 * the shortening is said, not hidden. `bg-block-sleep` is the quiet neutral
 * the tokens give it; the label is secondary text.
 */
export function SleepBand({ heightPx }: { heightPx: number }) {
  return (
    <div style={{ paddingInlineStart: `${SCHEDULE_GUTTER_PX}px` }}>
      <div
        style={{ height: `${heightPx}px` }}
        className="bg-block-sleep flex items-start rounded-(--radius) px-(--space-2) pt-1"
      >
        <Text as="span" variant="caption" tone="secondary" className="text-block-sleep-label tabular-nums">
          {COPY.sleep}
        </Text>
      </div>
    </div>
  );
}
