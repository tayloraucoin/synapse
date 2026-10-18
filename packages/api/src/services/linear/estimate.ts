/**
 * A size card's estimate on the team's own scale (USE-102, D-USE-113; the
 * size dev note's "both ways"). The Item sheet sends Synapse's points
 * (1, 2, 3, 5, 8 for Quick to Huge); the issue gets the same step on its
 * team's scale. Pure.
 *
 * The scales are Linear's estimate types [NOT VERIFIED live: C5's check on
 * Taylor's workspace]. T-shirt sizes are taken to store Fibonacci's values
 * [ASSUMPTION]. A team with estimates off, or a snapshot from before USE-102
 * with no scale, gets Synapse's points: Linear refuses or keeps them, and a
 * refusal reads "Not updated in Linear." like any other.
 */
import { WORK_SIZES } from "@syn/constants";
import { sizeOfEstimate } from "@syn/utils";

const FIBONACCI = [1, 2, 3, 5, 8] as const;

const SCALES: Record<string, readonly number[]> = {
  exponential: [1, 2, 4, 8, 16],
  fibonacci: FIBONACCI,
  linear: [1, 2, 3, 4, 5],
  tShirt: FIBONACCI,
};

export function estimateForTeam(
  points: number | null,
  estimationType: string | null | undefined,
): number | null {
  const size = sizeOfEstimate(points);
  if (size === null) return null;
  const scale = SCALES[estimationType ?? ""] ?? FIBONACCI;
  return scale[WORK_SIZES.indexOf(size)] ?? null;
}
