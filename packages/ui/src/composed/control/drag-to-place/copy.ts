/**
 * DragToPlace's sentences (USE-75): the live region reads them while a row is
 * carried. What a drop did is the caller's to say. Nothing here is drawn.
 */
export const DRAG_TO_PLACE_COPY = {
  lifted: (title: string) => `Lifted ${title}`,
  cancelled: (title: string) => `${title} back where it was`,
} as const;
