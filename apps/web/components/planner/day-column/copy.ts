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
  /**
   * A block's button: "Wellness, 7:05 to 8:00"; on Schedule its state after
   * (USE-27 [PROPOSED]): "Work, 9:30 to 12:00, now", "Wellness, …, done".
   */
  block: (
    name: string,
    startsAt: string,
    endsAt: string,
    state: "done" | "now" | null = null,
  ) =>
    `${name}, ${spanLabel(startsAt, endsAt)}${state === null ? "" : `, ${state}`}`,
  /** Schedule's marks in words (never colour alone). */
  mark: { done: "done", running: "· running", firing: "· firing" },
  /** An event inside a block: "10:30 to 11:00 · Meeting". */
  meeting: (startsAt: string, endsAt: string) =>
    `${spanLabel(startsAt, endsAt)} · Meeting`,
  /** An event on its own: "13:00 to 14:30 · Personal". */
  eventMeta: (startsAt: string, endsAt: string, tag: "work" | "personal") =>
    `${spanLabel(startsAt, endsAt)} · ${tag === "work" ? "Work" : "Personal"}`,
  /** The All day strip (D-USE-28). */
  allDay: "All day",
  checklist: "Checklist",
  /** The strip's button: "Sunday, all day, now". */
  strip: (name: string, underWay: boolean) =>
    `${name}, all day${underWay ? ", now" : ""}`,
  /** A day with nothing set (D-USE-68): the ask under the title. */
  empty: {
    title: (weekday: string) => `Nothing set for ${weekday}.`,
    line: "A loose day can be one list, done in any order.",
    checklist: "Make a checklist",
    checklistLine: "Things to get through today. No times.",
    blocks: "Plan with blocks",
    blocksLine: "Times on the rail, like a weekday.",
    copy: "Copy another day",
  },
  /** The tapped slot's mark (USE-39; tap-a-time.md). */
  newBlock: "+ New block",
  /** A bullet's button: "Water, in Wellness". */
  bullet: (item: string, block: string) => `${item}, in ${block}`,
  tier: {
    urgent: "Urgent",
    primary: "Primary",
    secondary: "Secondary",
    stretch: "Stretch",
  } satisfies Record<WorkTier, string>,
} as const;
