/**
 * ArchivedSection's strings — v2 handoff §5.5, Epic 1 LB-01 / TP-01 / ST-06.
 *
 * The count is in the label because a collapsed section that says only
 * "Archived" makes a person open it to find out whether it is empty.
 */
export const ARCHIVED_SECTION_COPY = {
  show: (count: number) => `Show archived (${count})`,
  hide: (count: number) => `Hide archived (${count})`,
} as const;
