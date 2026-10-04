/**
 * LaneHeader's default words — Workflow UX v0.1 §7 (*Lane words*, *Lane*),
 * verbatim. Overridable through `copy`.
 */
export const LANE_HEADER_COPY = {
  firstToday: "first today",
  next: "next",
  noGroup: "No group",
  collapse: (name: string) => `Collapse ${name}`,
  expand: (name: string) => `Expand ${name}`,
} as const;

export type LaneHeaderCopy = typeof LANE_HEADER_COPY;
