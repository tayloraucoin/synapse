import { clockMinutes } from "@syn/utils";

/**
 * Block view's geometry (USE-48; block-view/states/success.md): the span
 * stretched so every short item reads. A row is at least `--row-min`
 * (56 px) and grows with its length, a 10 min row about twice as tall
 * (96 px, as drawn). Pure, so the rows and their tests agree.
 */

/** `--row-min`, as a number for the arithmetic; the CSS uses the token. */
export const ROW_MIN_PX = 56;
/** A 10 min row at 96 px, as drawn. */
const PX_PER_MIN = 9.6;

export function rowHeightPx(lengthMin: number | null): number {
  return Math.max(ROW_MIN_PX, Math.round((lengthMin ?? 0) * PX_PER_MIN));
}

/**
 * The dashed free region: shorter per minute than a row, so free time never
 * pushes the end off the screen (30 min about 180 px, as drawn).
 */
const FREE_PX_PER_MIN = 6;

export function freeHeightPx(minutes: number): number {
  return Math.max(ROW_MIN_PX, Math.round(minutes * FREE_PX_PER_MIN));
}

/** "07:05" as the rail and the span say it: "7:05". */
export function clockLabel(hhmm: string): string {
  return hhmm.replace(/^0(\d)/, "$1");
}

/** "7:05 to 8:00". */
export function spanLabel(startsAt: string, endsAt: string): string {
  return `${clockLabel(startsAt)} to ${clockLabel(endsAt)}`;
}

/** The minute of the day as "HH:MM". */
export function minuteLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = String(min % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export interface NowMark {
  /** The row the line crosses. */
  rowId: string;
  /** How far down that row, 0 to 1. */
  fraction: number;
  /** "7:14". */
  label: string;
}

/**
 * Where the now-line crosses (D-USE-30): only while the block is current,
 * inside the row under way. Null before the block, after it, or in a gap
 * no row covers (free time).
 */
export function nowMark(
  block: { startsAt: string; endsAt: string },
  rows: readonly { id: string; startsAt: string; lengthMin: number | null }[],
  nowMin: number | null,
): NowMark | null {
  if (nowMin === null) return null;
  if (
    nowMin < clockMinutes(block.startsAt) ||
    nowMin >= clockMinutes(block.endsAt)
  ) {
    return null;
  }
  for (const row of rows) {
    const start = clockMinutes(row.startsAt);
    const length = Math.max(1, row.lengthMin ?? 0);
    if (nowMin >= start && nowMin < start + length) {
      return {
        rowId: row.id,
        fraction: (nowMin - start) / length,
        label: minuteLabel(nowMin),
      };
    }
  }
  return null;
}
