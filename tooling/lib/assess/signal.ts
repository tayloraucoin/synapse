/**
 * The signal interface every assess detector implements (MIG T1, assess.md).
 *
 * A signal is one row of assess.md's table: an id, its group, the layer it
 * informs, and a detector that reads the target through `Repo` and returns a
 * value, a score of 0 (matches the practice), 1 (partial) or 2 (absent or
 * conflicting), and the evidence in words. A score of null means the detector
 * is not built yet: the signal is reported, and left out of the total.
 */

import type { Repo } from "./repo.ts";

export type Group = "shape" | "checks" | "conventions" | "process";
export type Score = 0 | 1 | 2;

export type Measure = {
  value: unknown;
  score: Score | null;
  evidence: string;
};

export type Signal = {
  id: string;
  group: Group;
  /** The migration layer the signal informs (1, 2 or 3). */
  layer: 1 | 2 | 3;
  title: string;
  measure(repo: Repo): Measure;
};

export type SignalResult = { id: string } & Measure;

/** The detector of a signal whose ticket has not landed: reported, never scored. */
export const notYetMeasured = (): Measure => ({
  value: null,
  score: null,
  evidence: "not yet measured",
});
