/**
 * The drag layer's sentences — UX v1.1 §6.5, §10.4. The live region reads
 * these; nothing here is drawn. The refusal line is the caller's (§6.5: *Fixed
 * things don't move by drag*), passed in, because the service says it too.
 */
export const DRAG_LAYER_COPY = {
  lifted: (title: string) => `Lifted ${title}`,
  movedTo: (title: string, time: string) => `${title} moved to ${time}`,
  resized: (title: string, minutes: number) => `${title} is now ${minutes} min`,
  blockMoved: (name: string, time: string) => `${name} moved to ${time}`,
  reordered: (title: string, position: number) => `${title} is now ${position}`,
  /** The `m`-then-time entry (§10.4). */
  timeEntryLabel: (title: string) => `Move ${title} to`,
  timeEntryPlaceholder: "08:30",
  /** The `g`-then-number entry and the seam (§3.11, §10.4 — DYN-9). */
  gapSet: (title: string, minutes: number) => `Gap before ${title} is now ${minutes} min`,
  gapEntryLabel: (title: string) => `Gap before ${title}, minutes`,
  gapEntryPlaceholder: "10",
  cancelled: "",
} as const;
