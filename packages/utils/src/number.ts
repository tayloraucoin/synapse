/** Pure numeric helpers used by steppers, capacity fields, and duration inputs. */

/** Constrain a value to an inclusive range. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * A byte count as a person reads it — *412 KB*, *2.1 MB* (Epic 1 ST-10).
 *
 * DECIMAL UNITS, NOT BINARY. The number sits beside a download link, and every
 * file manager the person will see that download in reports decimal MB. Being
 * right about 1024 and wrong about what their own computer will say afterwards
 * is the worse kind of correct.
 *
 * One decimal place from MB up, none below: *412 KB* is precise enough for a
 * file you are about to fetch, and *412.3 KB* is noise.
 */
export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 bytes";
  if (bytes < 1000) return `${Math.round(bytes)} bytes`;

  const units = ["KB", "MB", "GB"] as const;
  let value = bytes / 1000;
  let unit = 0;

  while (value >= 1000 && unit < units.length - 1) {
    value /= 1000;
    unit += 1;
  }

  const rounded = unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
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
