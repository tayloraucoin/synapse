"use client";

import { cn, Text } from "@syn/ui";
import { overBand } from "@syn/utils";
import { RUNNING_COPY as COPY } from "./running-copy";

const BAND_TONE = {
  ink: undefined,
  warning: "text-warning-text",
  danger: "text-destructive-text",
} as const;

/**
 * A timed Done's row text (N4, D-USE-13, D-USE-29): the time taken in figure
 * weight with no Change, coloured by Done's percent bands; from warning up
 * "of <plan>" sits beside it, so the colour always has its reason.
 */
export function TimedTook({
  tookMin,
  planMin,
}: {
  tookMin: number;
  planMin: number;
}) {
  const band = overBand(planMin, tookMin);
  return (
    <Text
      as="span"
      variant="caption"
      weight={600}
      data-took-band={band}
      className={cn("shrink-0 ps-(--space-2) tabular-nums", BAND_TONE[band])}
    >
      {COPY.took(tookMin, band === "ink" ? null : planMin)}
    </Text>
  );
}
