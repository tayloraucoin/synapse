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
  /** A timed Done's row: "12 min", and from warning up "12 min of 10". */
  took: (min: number, plan: number | null) =>
    plan === null ? `${min} min` : `${min} min of ${plan}`,
} as const;
