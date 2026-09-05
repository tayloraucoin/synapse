/** Pure numeric helpers used by steppers, capacity fields, and duration inputs. */

/** Constrain a value to an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Snap a value to the nearest multiple of `step`, anchored at `origin`. Used by
 * the Schedule's 15-minute bands and the duration fields, which snap into the
 * habit's declared range (Epic 1 §9, *Bounded to the habit's range.*).
 */
export function roundToStep(value: number, step: number, origin = 0): number {
  if (step <= 0) return value;
  return origin + Math.round((value - origin) / step) * step;
}
