import { WORK_SIZES } from "@syn/constants";

type WorkSize = (typeof WORK_SIZES)[number];

/**
 * An issue's size and length from Linear's estimate (USE-52; shared with
 * `@syn/api` since USE-101, which places issues live; the size dev
 * note, add/index.md › Rules): the points give the word, the word gives the
 * range. The points are read on the issue's team's scale (USE-112), the
 * inverse of `estimateForTeam` (`@syn/api`, USE-102), so a size written on
 * an exponential or linear team reads back as the same size. A value off
 * the scale takes the nearest word, the smaller on a tie [ASSUMPTION, the
 * dev note's]. No estimate (or 0) is unsized, at 30 min [ASSUMPTION,
 * add/index.md].
 */

const FIBONACCI = [1, 2, 3, 5, 8] as const;

/**
 * Linear's estimate scales, Quick to Huge (`issueEstimationType`)
 * [NOT VERIFIED live: USE-102 C5]. T-shirt sizes are taken to store
 * Fibonacci's values [ASSUMPTION]. Estimates off, or no scale (a snapshot
 * from before USE-102), read as Synapse's own points, Fibonacci.
 */
const SCALES: Record<string, readonly number[]> = {
  exponential: [1, 2, 4, 8, 16],
  fibonacci: FIBONACCI,
  linear: [1, 2, 3, 4, 5],
  tShirt: FIBONACCI,
};

/** A team's scale, Quick to Huge; Fibonacci for none or one unknown. */
export function estimateScale(
  estimationType: string | null | undefined,
): readonly number[] {
  return SCALES[estimationType ?? ""] ?? FIBONACCI;
}

/** An issue's team's scale name, from the snapshot's teams. */
export function estimationTypeOf(
  teams: readonly { id: string; estimationType?: string | null }[],
  teamId: string,
): string | null {
  return teams.find((team) => team.id === teamId)?.estimationType ?? null;
}

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

export function sizeOfEstimate(
  estimate: number | null,
  estimationType?: string | null,
): WorkSize | null {
  if (estimate === null || !Number.isFinite(estimate) || estimate <= 0) {
    return null;
  }
  const scale = estimateScale(estimationType);
  let best = 0;
  scale.forEach((point, index) => {
    if (Math.abs(point - estimate) < Math.abs(scale[best]! - estimate)) {
      best = index;
    }
  });
  return WORK_SIZES[best]!;
}

export interface IssueLength {
  size: WorkSize | null;
  lengthMinMin: number;
  lengthMaxMin: number | null;
}

export function issueLength(
  estimate: number | null,
  estimationType?: string | null,
): IssueLength {
  const size = sizeOfEstimate(estimate, estimationType);
  if (size === null) {
    return { size, lengthMinMin: UNSIZED_MIN, lengthMaxMin: UNSIZED_MIN };
  }
  const range = RANGE[size];
  return { size, lengthMinMin: range.min, lengthMaxMin: range.max };
}
