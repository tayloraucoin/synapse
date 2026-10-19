import { clockLabel } from "@/components/planner/day-column/copy";

/**
 * A late wake's words on Review the day (USE-38; late.md,
 * late-passed-open.md). Nothing says missed, late, behind or skipped, and
 * never the second person: the passed blocks are named, with their times.
 */
export const REVIEW_LATE_COPY = {
  /** "Planned before 8:10 · Wellness", several "Wellness, Training". */
  passed: (wokeAt: string, names: readonly string[]) =>
    `Planned before ${clockLabel(wokeAt)} · ${names.join(", ")}`,
  moveLater: "Move later",
  /** The way back into A later start (USE-41) [ASSUMPTION: not drawn]. */
  laterStart: "Cut some, or slide the day back",
  leave: "Leave",
  /** The card's buttons by name, so two cards never read alike. */
  moveLaterLabel: (name: string) => `Move ${name} later`,
  leaveLabel: (name: string) => `Leave ${name}`,
  /** Move later's Toaster [ASSUMPTION: no words drawn]. */
  movedLater: (name: string, startsAt: string) =>
    `${name} moved to ${clockLabel(startsAt)}.`,
} as const;
