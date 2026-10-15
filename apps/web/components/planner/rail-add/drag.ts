/**
 * The rail +'s drag (USE-54; add-from-the-rail/states/rail-drag.md;
 * D-USE-15, D-USE-18): a finger's travel read as a time in 15-minute steps,
 * stopped at the day's edges. Pure, so the gesture and its tests share it.
 */

/** The drag's step and Starts' (D-USE-19). */
export const RAIL_STEP_MIN = 15;

export interface DayWindow {
  /** The column's first and last minute, from midnight. */
  startMin: number;
  endMin: number;
}

/** The day's first and last step a new item can start on. */
function edgesOf(window: DayWindow, step: number) {
  const first = Math.ceil(window.startMin / step) * step;
  const last = Math.floor((window.endMin - step) / step) * step;
  return { first, last: Math.max(first, last) };
}

/** A minute to its nearest step, held inside the day. */
export function snapToStep(
  minutes: number,
  window: DayWindow,
  step = RAIL_STEP_MIN,
): number {
  const { first, last } = edgesOf(window, step);
  const snapped = Math.round(minutes / step) * step;
  return Math.min(last, Math.max(first, snapped));
}

/**
 * Where a drag that began on the + at `fromMin` reads after `dyPx` of
 * travel: `pxPerHour` maps pixels to minutes, the step snaps it, the day's
 * edges stop it.
 */
export function railTimeAt({
  fromMin,
  dyPx,
  pxPerHour,
  window,
  step = RAIL_STEP_MIN,
}: {
  fromMin: number;
  dyPx: number;
  pxPerHour: number;
  window: DayWindow;
  step?: number;
}): number {
  return snapToStep(fromMin + (dyPx / pxPerHour) * 60, window, step);
}

/** Starts' −15 and +15, held inside the day. */
export function stepTime(
  minutes: number,
  by: number,
  window: DayWindow,
  step = RAIL_STEP_MIN,
): number {
  return snapToStep(minutes + by, window, step);
}

/**
 * A typed Starts ("10:15", "1015", "9:05", "9") to minutes, kept as typed
 * and held inside the day; null when it reads as no time.
 */
export function typedTime(text: string, window: DayWindow): number | null {
  const match = /^\s*(\d{1,2})(?::?(\d{2}))?\s*$/.exec(text);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2] ?? "0");
  if (hour > 23 || minute > 59) return null;
  const minutes = hour * 60 + minute;
  return Math.min(
    window.endMin - RAIL_STEP_MIN,
    Math.max(window.startMin, minutes),
  );
}
