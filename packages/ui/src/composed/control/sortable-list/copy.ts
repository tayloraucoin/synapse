/**
 * The sortable's sentences — UX v1.2 §10.4 (RUN-7). The live region reads
 * these; the handle's label is the third. Nothing here is drawn.
 */
export const SORTABLE_LIST_COPY = {
  lifted: (title: string) => `Lifted ${title}`,
  movedTo: (title: string, position: number) => `${title} moved to position ${position}`,
  dropped: (title: string) => `${title} dropped`,
  cancelled: (title: string) => `${title} back where it was`,
  handle: (title: string) => `Reorder ${title}`,
} as const;
