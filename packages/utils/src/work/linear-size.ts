import type { WORK_SIZES } from "@syn/constants";

type WorkSize = (typeof WORK_SIZES)[number];

/**
 * An issue's size and length from Linear's estimate (USE-52; shared with
 * `@syn/api` since USE-101, which places issues live; the size dev
 * note, add/index.md › Rules): the points give the word, the word gives the
 * range. A scale other than 1, 2, 3, 5, 8 takes the nearest word, the
 * smaller on a tie [ASSUMPTION, the dev note's]. No estimate (or 0) is
 * unsized, at 30 min [ASSUMPTION, add/index.md].
 */

const POINTS: readonly [number, WorkSize][] = [
  [1, "quick"],
  [2, "small"],
  [3, "medium"],
  [5, "large"],
  [8, "huge"],
];

/** The size dev note's default ranges; Huge has no top. */
const RANGE: Record<WorkSize, { min: number; max: number | null }> = {
  quick: { min: 15, max: 30 },
  small: { min: 30, max: 60 },
  medium: { min: 60, max: 120 },
  large: { min: 120, max: 240 },
  huge: { min: 240, max: null },
};

/** With no estimate: 30 min, exact. */
export const UNSIZED_MIN = 30;

export function sizeOfEstimate(estimate: number | null): WorkSize | null {
  if (estimate === null || !Number.isFinite(estimate) || estimate <= 0) {
    return null;
  }
  let best = POINTS[0]!;
  for (const point of POINTS) {
    if (Math.abs(point[0] - estimate) < Math.abs(best[0] - estimate)) {
      best = point;
    }
  }
  return best[1];
}

export interface IssueLength {
  size: WorkSize | null;
  lengthMinMin: number;
  lengthMaxMin: number | null;
}

export function issueLength(estimate: number | null): IssueLength {
  const size = sizeOfEstimate(estimate);
  if (size === null) {
    return { size, lengthMinMin: UNSIZED_MIN, lengthMaxMin: UNSIZED_MIN };
  }
  const range = RANGE[size];
  return { size, lengthMinMin: range.min, lengthMaxMin: range.max };
}
