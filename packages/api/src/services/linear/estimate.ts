/**
 * A size card's estimate on the team's own scale (USE-102, D-USE-113; the
 * size dev note's "both ways"). The Item sheet sends Synapse's points
 * (1, 2, 3, 5, 8 for Quick to Huge); the issue gets the same step on its
 * team's scale. Pure.
 *
 * The scales live beside their inverse, `sizeOfEstimate` in `@syn/utils`
 * (USE-112), so the web app reads a size on the same scale this writes it
 * on. A team with estimates off, or a snapshot from before USE-102 with no
 * scale, gets Synapse's points: Linear refuses or keeps them, and a refusal
 * reads "Not updated in Linear." like any other.
 */
import { WORK_SIZES } from "@syn/constants";
import { estimateScale, sizeOfEstimate } from "@syn/utils";

export function estimateForTeam(
  points: number | null,
  estimationType: string | null | undefined,
): number | null {
  const size = sizeOfEstimate(points);
  if (size === null) return null;
  return estimateScale(estimationType)[WORK_SIZES.indexOf(size)] ?? null;
}
