/**
 * TimeText — a scheduled or actual time, in the day's zone (v2 handoff §5.1).
 *
 * Adapted from CC's `Timestamp`: a `<time dateTime>` with an sr-only exact
 * form and `suppressHydrationWarning`. Synapse's change is the one that
 * matters — the zone is the *day's*, passed in, never the viewer's. A person
 * who flies to Berlin still reads Tuesday in the zone Tuesday happened in
 * (cross-cutting §7.3).
 *
 * WHY suppressHydrationWarning: `Intl.DateTimeFormat` is resolved against the
 * runtime's ICU data, and a server on a different Node build can format the
 * same instant with a different space before the meridiem (U+202F vs U+0020).
 * The value is right in both; only the byte differs. Suppressing here is
 * narrower than rendering client-only, which would leave the time blank on
 * first paint for every row on the list.
 *
 * A11y: `dateTime` carries the ISO instant so assistive tech and copy-paste
 * get the unambiguous value. The visible short form is `aria-hidden` when it
 * is lossy — a window drops the shared meridiem, elapsed has no date at all —
 * and an sr-only full form follows it (CC's rule).
 */
import { formatClock, formatElapsed, formatWindow } from "@syn/utils";
import * as React from "react";

import { cn } from "../../../lib/cn";
import { Text } from "../../../primitives/typography/text";

export type TimeTextMode = "at" | "window" | "anytime" | "actual" | "elapsed";

export interface TimeTextProps {
  mode: TimeTextMode;
  start?: Date | null;
  end?: Date | null;
  /** Renders "7:20 → 4:32" with mode "actual". */
  actual?: Date | null;
  /** mode "elapsed": mm:ss under an hour, h:mm:ss after (§12 call 8). */
  elapsedSec?: number;
  /** The day's zone, never the viewer's (cross-cutting §7.3). */
  timeZone: string;
  locale?: string;
  tone?: "body" | "violet" | "secondary";
  size?: "secondary" | "caption";
  className?: string;
}

const ANYTIME_LABEL = "Anytime";

/** The exact, unabbreviated reading for screen readers. */
function longForm(
  date: Date,
  timeZone: string,
  locale: string | undefined,
): string {
  return new Intl.DateTimeFormat(locale, {
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
    timeZone,
  }).format(date);
}

export function TimeText({
  mode,
  start = null,
  end = null,
  actual = null,
  elapsedSec,
  timeZone,
  locale,
  tone = "body",
  size = "secondary",
  className,
}: TimeTextProps) {
  const shared = {
    variant: size,
    tone: tone === "violet" ? ("violet" as const) : tone,
    className: cn("tabular-nums", className),
  };

  if (mode === "anytime") {
    return (
      <Text as="span" {...shared}>
        {ANYTIME_LABEL}
      </Text>
    );
  }

  if (mode === "elapsed") {
    const seconds = Math.max(0, Math.floor(elapsedSec ?? 0));
    return (
      <Text as="span" {...shared}>
        <span aria-hidden="true">{formatElapsed(seconds)}</span>
        <span className="sr-only">{`${Math.floor(seconds / 60)} minutes ${seconds % 60} seconds`}</span>
      </Text>
    );
  }

  if (mode === "window") {
    if (start === null || end === null) return null;
    return (
      <Text as="span" {...shared}>
        <time
          dateTime={start.toISOString()}
          suppressHydrationWarning
          aria-hidden="true"
        >
          {formatWindow(start, end, timeZone, locale)}
        </time>
        <span className="sr-only" suppressHydrationWarning>
          {`${longForm(start, timeZone, locale)} to ${longForm(end, timeZone, locale)}`}
        </span>
      </Text>
    );
  }

  if (mode === "actual") {
    if (start === null || actual === null) return null;
    return (
      <Text as="span" {...shared}>
        <span aria-hidden="true" suppressHydrationWarning>
          {`${formatClock(start, timeZone, locale)} → ${formatClock(actual, timeZone, locale)}`}
        </span>
        <span className="sr-only" suppressHydrationWarning>
          {`planned ${longForm(start, timeZone, locale)}, done ${longForm(actual, timeZone, locale)}`}
        </span>
      </Text>
    );
  }

  if (start === null) return null;
  return (
    <Text as="span" {...shared}>
      <time dateTime={start.toISOString()} suppressHydrationWarning>
        {formatClock(start, timeZone, locale)}
      </time>
    </Text>
  );
}
