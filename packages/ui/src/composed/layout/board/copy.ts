/**
 * The board drag's sentences (FLO-9) — the live region reads these, as
 * `SortableList`'s copy is read; nothing here is drawn. The position is the
 * ordinal the person asked for by lifting, never a tally on the board.
 *
 * [COPY — needs Vesper sign-off: §7 names *Reorder {name}* for a lane's grip
 * and nothing for a row's handle or the announcements; these follow the
 * sortable's existing sentences.]
 */
export const BOARD_COPY = {
  /** A row's keyboard handle — visually hidden until it has focus. */
  rowHandle: (title: string) => `Move ${title}`,
  lifted: (title: string) => `Lifted ${title}`,
  /** *Northwind, Finish later, position 2* — or, over a folded lane, no position. */
  over: (group: string, column: string, position: number | null) =>
    position === null ? `${group}, ${column}` : `${group}, ${column}, position ${position}`,
  laneOver: (name: string, position: number) => `${name}, position ${position}`,
  dropped: (title: string) => `${title} dropped`,
  cancelled: (title: string) => `${title} back where it was`,
} as const;

export type BoardCopy = typeof BOARD_COPY;
