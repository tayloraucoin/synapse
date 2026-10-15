/**
 * Over, by how much (USE-23; dev note `over-by-how-much.md`, D-USE-29,
 * D-USE-72). Running and Done share one rule: the band is set by percent
 * over the plan, never by "a minute over", so a 45-min item is not red at 46.
 *
 * Up to 10% over, ink; over 10% to 25%, warning; over 25%, danger. Each edge
 * is whole minutes and at least 1 min, so a 2-min item is not warned at 2:10.
 * Under the plan is always ink. The colour never stands alone: the caller
 * puts "over" or "of <plan>" beside it.
 */

export type OverBand = "ink" | "warning" | "danger";

const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;

/** The last whole minute over that a band still holds, at least 1. */
function edge(planMin: number, share: number): number {
  return Math.max(1, Math.floor(planMin * share));
}

/** The band for `elapsedMin` whole minutes against a plan of `planMin`. */
export function overBand(planMin: number, elapsedMin: number): OverBand {
  const over = elapsedMin - planMin;
  if (over <= edge(planMin, 0.1)) return "ink";
  if (over <= Math.max(edge(planMin, 0.25), edge(planMin, 0.1))) {
    return "warning";
  }
  return "danger";
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** "7:42", "1:24:10": hours only when there are any. */
function clockText(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${pad(minutes)}:${pad(seconds)}`
    : `${minutes}:${pad(seconds)}`;
}

export interface CountdownText {
  /** The whole run of words: "7:42", "0:40 over", "3 min over". */
  text: string;
  /** The figure alone, without "over": "7:42", "0:40", "3 min". */
  figure: string;
  over: boolean;
}

/**
 * The running card's figure (N4, D-USE-72): it counts down from the plan;
 * past it, "m:ss over" under a minute, then "n min over" in whole minutes.
 * The seconds left round up, so a timer just started reads its whole plan.
 *
 * Named apart from `time.ts`'s `formatClock`, the wall clock.
 */
export function formatCountdown(planMs: number, workMs: number): CountdownText {
  const leftMs = planMs - workMs;
  if (leftMs > 0) {
    const figure = clockText(Math.ceil(leftMs / MS_PER_SECOND));
    return { text: figure, figure, over: false };
  }
  const overMs = -leftMs;
  const figure =
    overMs < MS_PER_MINUTE
      ? clockText(Math.floor(overMs / MS_PER_SECOND))
      : `${Math.floor(overMs / MS_PER_MINUTE)} min`;
  return { text: `${figure} over`, figure, over: true };
}

/** A running band: whole minutes worked, against the plan. */
export function runningBand(planMin: number, workMs: number): OverBand {
  return overBand(planMin, Math.floor(workMs / MS_PER_MINUTE));
}

/**
 * The time a timed Done records (USE-23 gotcha): work time to the nearest
 * minute, at least 1.
 */
export function tookMinutes(workMs: number): number {
  return Math.max(1, Math.round(workMs / MS_PER_MINUTE));
}
