import { formatClock } from "../time";
import { wallClockToInstant } from "./wall-clock";

/**
 * Morning, Afternoon, Evening — official spec §6.4.
 *
 * The day is divided from when the person actually got up (`woke_at`), or the
 * day's anchor until that is known, in eight-hour blocks. NOT from midnight:
 * a person who wakes at 05:00 and one who wakes at 10:00 do not share an
 * afternoon, and the headers recompute the moment `woke_at` is captured while
 * the items keep their times.
 */

export const DAY_PART_HOURS = 8;

export type DayPart = "morning" | "afternoon" | "evening" | "anytime";

export type DayPartAnchors = {
  /** The day's own zone, snapshotted on the row. */
  timeZone: string;
  dateKey: string;
  /** `woke_at` if captured, else the day's `anchor_time`. */
  startInstant: Date;
};

export function dayPartBoundaries(anchors: DayPartAnchors): {
  morningStart: Date;
  afternoonStart: Date;
  eveningStart: Date;
} {
  const start = anchors.startInstant.getTime();
  const block = DAY_PART_HOURS * 3600_000;
  return {
    morningStart: new Date(start),
    afternoonStart: new Date(start + block),
    eveningStart: new Date(start + 2 * block),
  };
}

/**
 * Which part an item belongs to.
 *
 * An unscheduled item has no time, so it cannot be placed by one. It takes the
 * part of the item before it — which is what the document's "sit at the bottom
 * of the day part they were slotted in" means once a slot's offset has become
 * a `sort_order` (SET-6 writes that). With nothing before it, *Anytime*.
 */
export function dayPartOf(
  item: { scheduledStart: Date | null },
  anchors: DayPartAnchors,
  precedingPart: DayPart | null = null,
): DayPart {
  if (item.scheduledStart === null) return precedingPart ?? "anytime";

  const { afternoonStart, eveningStart } = dayPartBoundaries(anchors);
  const at = item.scheduledStart.getTime();

  if (at < afternoonStart.getTime()) return "morning";
  if (at < eveningStart.getTime()) return "afternoon";
  return "evening";
}

/**
 * The labels a section header shows — "7:04 – 15:04".
 *
 * Evening's span ends at the last scheduled item rather than at a clock,
 * because a day ends when the person's day ends and not eight hours after the
 * afternoon started (§6.4).
 */
export function dayPartSpans(
  anchors: DayPartAnchors,
  lastScheduled: Date | null,
): Record<DayPart, { startLabel: string; endLabel: string } | null> {
  const { morningStart, afternoonStart, eveningStart } =
    dayPartBoundaries(anchors);
  const zone = anchors.timeZone;

  return {
    morning: {
      startLabel: formatClock(morningStart, zone),
      endLabel: formatClock(afternoonStart, zone),
    },
    afternoon: {
      startLabel: formatClock(afternoonStart, zone),
      endLabel: formatClock(eveningStart, zone),
    },
    evening: {
      startLabel: formatClock(eveningStart, zone),
      endLabel:
        lastScheduled === null
          ? formatClock(eveningStart, zone)
          : formatClock(lastScheduled, zone),
    },
    anytime: null,
  };
}

/** The day's start instant: `woke_at`, else the anchor on the day's date. */
export function dayStartInstant(day: {
  dateKey: string;
  timezone: string;
  anchorTime: string;
  wokeAt: Date | null;
}): Date {
  return (
    day.wokeAt ?? wallClockToInstant(day.dateKey, day.anchorTime, day.timezone)
  );
}
