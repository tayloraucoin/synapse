import { clockLabel } from "./copy";

/**
 * Running's words (USE-23; day/running/words-and-access.md). "Over" is the
 * one word past the plan; never late, behind or overdue (N5).
 */
export const RUNNING_COPY = {
  started: (at: string) => `Started ${clockLabel(at)}`,
  paused: (at: string) => `Paused · started ${clockLabel(at)}`,
  ofPlan: (min: number) => `of ${min} min`,
  pause: "Pause",
  resume: "Resume",
  runningName: (title: string) => `${title}, running`,
  /** Several running (USE-24): the group's heading over the card and rows. */
  group: "Running",
  /** A row's count: "12:04 of 30 min", or past the plan "4 min over". */
  row: (count: string) => `Running · ${count}`,
  /** A paused row: its count held [ASSUMPTION: the card's "Paused ·"]. */
  rowPaused: (count: string) => `Paused · ${count}`,
  /** A settled row: "Done · 34 min", from warning up "Done · 34 min of 30". */
  rowDone: (min: number, plan: number | null) =>
    plan === null ? `Done · ${min} min` : `Done · ${min} min of ${plan}`,
  /** A row is a button that lifts it [PROPOSED]. */
  rowName: (title: string, count: string) =>
    `${title}, running, ${count}, lift to the card`,
  pauseName: (title: string) => `Pause ${title}`,
  resumeName: (title: string) => `Resume ${title}`,
  rowDoneName: (title: string) => `Done, ${title}`,
  /** Announced politely after a lift [PROPOSED]. */
  inFocus: (title: string) => `${title} in focus`,
  /** A timed Done's row: "12 min", and from warning up "12 min of 10". */
  took: (min: number, plan: number | null) =>
    plan === null ? `${min} min` : `${min} min of ${plan}`,
} as const;
