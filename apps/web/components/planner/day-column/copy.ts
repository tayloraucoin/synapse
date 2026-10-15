import type { WorkTier } from "@syn/types";

/**
 * The day column's words (USE-31; review-the-day/words-and-access.md). No
 * second person; times and lengths are the only numbers, and "+n more" is
 * the bullet grid's own.
 */

/** "HH:MM" to the boards' clock: "7:05", "13:00". */
export function clockLabel(clock: string): string {
  const [hour = "0", minute = "00"] = clock.split(":");
  return `${Number(hour)}:${minute}`;
}

/** "7:05 to 8:00" */
export function spanLabel(startsAt: string, endsAt: string): string {
  return `${clockLabel(startsAt)} to ${clockLabel(endsAt)}`;
}

/** The axis's bare 24-hour labels: "7", "13". */
export function hourLabel(minutes: number): string {
  return String(Math.floor(minutes / 60));
}

export const DAY_COLUMN_COPY = {
  /** "Orient · 5 min" */
  orient: (lengthMin: number) => `Orient · ${lengthMin} min`,
  axis: "The day",
  /** A block's button: "Wellness, 7:05 to 8:00". */
  block: (name: string, startsAt: string, endsAt: string) =>
    `${name}, ${spanLabel(startsAt, endsAt)}`,
  /** A bullet's button: "Water, in Wellness". */
  bullet: (item: string, block: string) => `${item}, in ${block}`,
  tier: {
    urgent: "Urgent",
    primary: "Primary",
    secondary: "Secondary",
    stretch: "Stretch",
  } satisfies Record<WorkTier, string>,
} as const;
