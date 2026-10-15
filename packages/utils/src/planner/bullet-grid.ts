/**
 * The bullet grid's maths (USE-31; D-USE-7, D-USE-23): a block on Review the
 * day is as tall as its time, never taller, so its items are laid into fixed
 * cells, a set number a line, as many lines as the block's height holds.
 * When they do not all fit, the last cell is "+n more" and n is exactly what
 * did not fit; when they do, there is no "+n more" at all.
 *
 * Lines fill left to right, then down: the order of the block's items reads
 * across each line.
 */

export interface BulletGridOptions {
  /** The room for lines: the block's height less its padding and head. */
  heightPx: number;
  /** Fixed cells a line: two at the phone, more as the column widens. */
  cellsPerLine: number;
  lineHeightPx: number;
  /** The gap between two lines. */
  rowGapPx?: number;
}

export interface BulletGrid<T> {
  /** The items drawn, in order. */
  shown: T[];
  /** How many did not fit; 0 means no "+n more". */
  more: number;
  /** How many lines the height holds. */
  lines: number;
}

/** How many lines of `lineHeightPx`, `rowGapPx` apart, fit in `heightPx`. */
export function bulletLines(
  heightPx: number,
  lineHeightPx: number,
  rowGapPx = 0,
): number {
  if (heightPx < lineHeightPx || lineHeightPx <= 0) return 0;
  return Math.floor((heightPx + rowGapPx) / (lineHeightPx + rowGapPx));
}

/** How many fixed cells of `cellPx`, `gapPx` apart, fit a line `widthPx` wide; at least one. */
export function bulletCellsPerLine(
  widthPx: number,
  cellPx: number,
  gapPx = 0,
): number {
  return Math.max(1, Math.floor((widthPx + gapPx) / (cellPx + gapPx)));
}

export function bulletGrid<T>(
  items: readonly T[],
  { heightPx, cellsPerLine, lineHeightPx, rowGapPx = 0 }: BulletGridOptions,
): BulletGrid<T> {
  const lines = bulletLines(heightPx, lineHeightPx, rowGapPx);
  const cells = lines * Math.max(1, Math.floor(cellsPerLine));
  if (items.length <= cells) {
    return { shown: [...items], more: 0, lines };
  }
  // The last cell holds "+n more", so one fewer item shows.
  const shown = items.slice(0, Math.max(0, cells - 1));
  return { shown, more: items.length - shown.length, lines };
}
