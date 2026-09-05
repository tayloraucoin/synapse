/**
 * DayHeader's second line — v2 handoff §5.6, Epic 2 LS-01.
 *
 * The line is a list of facts about the day, joined by a middle dot: which
 * template, when the person woke, whether the day was shifted, and — in plan
 * mode — how far off it is. Never a count of what is done (official spec
 * §2.4).
 */
export const DAY_HEADER_COPY = {
  noTemplate: "No template",
  woke: (timeLabel: string) => `Woke ${timeLabel}`,
  shifted: (minutes: number) => `Shifted +${minutes} min`,
  notUntil: (weekday: string) => `Not until ${weekday}`,
  openOptions: "Day options",
  separator: " · ",
} as const;
