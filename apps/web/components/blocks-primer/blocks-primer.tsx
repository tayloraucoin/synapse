import { EXAMPLE_DAY } from "@syn/constants";
import { BlockBand, ScheduleAxis, SleepBand, Text } from "@syn/ui";
import { formatClockFromMinutes } from "@syn/utils";

import { BlockLegend } from "./block-legend";
import { BLOCKS_PRIMER_COPY as COPY } from "./copy";

/**
 * The blocks primer — UX v1.3 §4.2 (R47, G2; DAY-8): Taylor's example day
 * drawn as hued bands on the compact axis, and the nine-row legend.
 *
 * READ-ONLY AND STILL. It asks nothing and nothing in it moves; it renders
 * from constants, so it needs no query, no skeleton, and works offline. The
 * caption *An example.* sits above the axis so the day never reads as the
 * person's own. Hues here are a planning surface's (TD-29) — never on the
 * execution tabs.
 *
 * THE AXIS RUNS 7:00 TO 22:30 at 28px an hour, and the sleep is a shortened
 * band beneath it (`SleepBand`), because v1.3 draws "the whole day … on one
 * phone screen with the sleep band shortened": 7:00 to 7:00 at 28px is 672px
 * and does not fit under the frame at 375 × 812.
 *
 * ONE LABEL LANE. At 28px an hour Orient's five minutes are 2px and the first
 * break's fifteen are 7px, so labels 8px down from each band's top would sit
 * on top of each other. Each band's label takes its usual place, or the band's
 * own top when the band is shorter than a label, and is pushed below the
 * label above it when they would touch; the band gets that offset. A pushed
 * label may run a few pixels past its band's foot, so the bands are painted
 * last-first — each band's label stays above the next band's wash.
 */

const PX_PER_HOUR = 28;
/** The caption's 12px at a 1.2 line height, rounded up. */
const LABEL_PX = 15;
const LABEL_GAP_PX = 1;
/** §10.3's 8px from the band's top, where the band is tall enough to hold it. */
const LABEL_TOP_PX = 8;

const SLEEP = EXAMPLE_DAY.find((span) => span.kind === "sleep");
const START_MIN = EXAMPLE_DAY[0]?.startMin ?? 7 * 60;
const END_MIN = SLEEP?.startMin ?? EXAMPLE_DAY[EXAMPLE_DAY.length - 1]?.endMin ?? START_MIN;

const toPx = (minutes: number): number => (minutes / 60) * PX_PER_HOUR;
const clockSpan = (startMin: number, endMin: number): string =>
  `${formatClockFromMinutes(startMin)}–${formatClockFromMinutes(endMin)}`;

type PrimerBand = {
  kind: Exclude<(typeof EXAMPLE_DAY)[number]["kind"], "sleep">;
  name: string;
  span: string;
  topPx: number;
  heightPx: number;
  labelOffsetPx: number;
};

/** The eleven bands of a real kind, laid out once — the example never changes. */
const BANDS: readonly PrimerBand[] = (() => {
  const out: PrimerBand[] = [];
  let laneBottom = Number.NEGATIVE_INFINITY;
  for (const entry of EXAMPLE_DAY) {
    if (entry.kind === "sleep") continue;
    const kind = entry.kind;
    const topPx = toPx(entry.startMin - START_MIN);
    const heightPx = toPx(entry.endMin - entry.startMin);
    const preferred = topPx + (heightPx >= LABEL_TOP_PX + LABEL_PX + LABEL_GAP_PX ? LABEL_TOP_PX : 0);
    const labelTop = Math.max(preferred, laneBottom + LABEL_GAP_PX);
    laneBottom = labelTop + LABEL_PX;
    out.push({
      kind,
      name: entry.name ?? COPY.legend.find((row) => row.kind === kind)?.word ?? kind,
      span: clockSpan(entry.startMin, entry.endMin),
      topPx,
      heightPx,
      labelOffsetPx: labelTop - topPx,
    });
  }
  return out;
})();

export function BlocksPrimer() {
  return (
    <figure className="m-0 flex flex-col gap-(--space-3)">
      <Text as="figcaption" variant="caption" tone="secondary">
        {COPY.caption}
      </Text>

      <div className="flex flex-col gap-(--space-5) wide:flex-row wide:items-start">
        <div className="min-w-0 wide:flex-1">
          {/* `pt`: room for the 7 AM label, which centres on the axis's top edge. */}
          <ScheduleAxis
            startMin={START_MIN}
            endMin={END_MIN}
            pxPerHour={PX_PER_HOUR}
            timeZone="UTC"
            ariaLabel={COPY.axisLabel}
            className="pt-(--space-2)"
          >
            {[...BANDS].reverse().map((band) => (
              <BlockBand
                key={band.topPx}
                kind={band.kind}
                name={band.name}
                span={band.span}
                topPx={band.topPx}
                heightPx={band.heightPx}
                labelPlacement="inside"
                labelOffsetPx={band.labelOffsetPx}
                hue
              />
            ))}
          </ScheduleAxis>
          <SleepBand label={COPY.sleep} heightPx={PX_PER_HOUR} />

          {/* The bands' labels are decoration to assistive tech; the day, read in order. */}
          <ol className="sr-only">
            {BANDS.map((band) => (
              <li key={band.topPx}>{`${band.name} · ${band.span}`}</li>
            ))}
            <li>{COPY.sleep}</li>
          </ol>
        </div>

        <BlockLegend className="wide:w-64 wide:shrink-0" />
      </div>
    </figure>
  );
}
