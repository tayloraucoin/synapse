import { formatClockFromMinutes, clockToMinutes } from "@syn/utils";
import type { IconValue, SlotView, TemplateSummaryView } from "@syn/types";

/**
 * Rows → the two view models TP-01 and TP-02 render.
 *
 * THE CLOCK IS COMPUTED HERE, not in the component. `SlotView` carries
 * `startClock` and `endClock` as strings because a template has no time zone —
 * a slot is an offset from an anchor, and the anchor is a wall-clock time, so
 * the display string is plain arithmetic on minutes. Passing a `Date` and a
 * zone into the row would be inventing a zone the template does not have.
 */

export type SlotRow = {
  id: string;
  habitId: string;
  timeMode: SlotView["timeMode"];
  offsetStartMin: number | null;
  offsetEndMin: number | null;
  durationMin: number;
  priorityOverride: number | null;
  scheduling: SlotView["scheduling"];
  multitaskGroup: string | null;
  sortOrder: number;
  habitTitle: string;
  habitIcon: IconValue;
  habitLifePriority: number;
};

/** A slot's position in its multitask bracket — `MultitaskPosition`. */
function multitaskPosition(
  slot: SlotRow,
  group: readonly SlotRow[],
): SlotView["multitask"] {
  if (slot.multitaskGroup === null) return "none";
  if (group.length < 2) return "none";
  const index = group.findIndex((member) => member.id === slot.id);
  if (index === 0) return "first";
  if (index === group.length - 1) return "last";
  return "middle";
}

export function toSlotViews(
  rows: readonly SlotRow[],
  anchorTime: string,
): SlotView[] {
  const anchorMinutes = clockToMinutes(anchorTime);

  const byGroup = new Map<string, SlotRow[]>();
  for (const row of rows) {
    if (row.multitaskGroup === null) continue;
    const members = byGroup.get(row.multitaskGroup) ?? [];
    members.push(row);
    byGroup.set(row.multitaskGroup, members);
  }
  for (const members of byGroup.values()) {
    members.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return rows.map((row) => ({
    id: row.id,
    habitId: row.habitId,
    title: row.habitTitle,
    icon: row.habitIcon,
    timeMode: row.timeMode,
    startClock:
      row.offsetStartMin === null
        ? null
        : formatClockFromMinutes(anchorMinutes + row.offsetStartMin),
    endClock:
      row.offsetEndMin === null
        ? null
        : formatClockFromMinutes(anchorMinutes + row.offsetEndMin),
    durationMin: row.durationMin,
    priority: row.priorityOverride ?? row.habitLifePriority,
    overridden: row.priorityOverride !== null,
    scheduling: row.scheduling,
    multitask:
      row.multitaskGroup === null
        ? "none"
        : multitaskPosition(row, byGroup.get(row.multitaskGroup) ?? []),
    // UX v1.1 fields — neutral until DYN-4 reads them from the slot and
    // derives the clock with `stackBlock` (TD-4).
    gapBeforeMin: 0,
    pinnedClock: null,
    role: "stack",
    alternates: null,
  }));
}

/**
 * Time order, with a shared start broken by `sort_order` — which is the only
 * place `sort_order` means anything (Epic 1 TP-02: reorder is "only within a
 * shared start; otherwise order is time order").
 *
 * `unscheduled` slots sort last: they have no time, so they cannot sit between
 * two that do.
 */
export function compareSlots(a: SlotRow, b: SlotRow): number {
  const aStart = a.offsetStartMin;
  const bStart = b.offsetStartMin;

  if (aStart === null && bStart === null) return a.sortOrder - b.sortOrder;
  if (aStart === null) return 1;
  if (bStart === null) return -1;
  if (aStart !== bStart) return aStart - bStart;
  return a.sortOrder - b.sortOrder;
}

export type TemplateRow = {
  id: string;
  name: string;
  /** Nullable since 0004 (v1.1 §11.4); the summary does not read it. */
  anchorTime: string | null;
  weeklyTarget: number | null;
  typicalDays: number[] | null;
  archivedAt: Date | null;
};

export function toTemplateSummaryView(
  row: TemplateRow,
  itemCount: number,
  totalMin: number,
  usedThisWeek: number,
): TemplateSummaryView {
  return {
    id: row.id,
    name: row.name,
    itemCount,
    totalMin,
    typicalDays: (row.typicalDays ?? []) as TemplateSummaryView["typicalDays"],
    weeklyTarget: row.weeklyTarget,
    usedThisWeek,
    archived: row.archivedAt !== null,
    // UX v1.1: every v1.0 template lays out as a morning block until DYN-2
    // backfills `kind` and DYN-4 reads the three columns (TD-1).
    kind: "morning",
    flow: "forward",
    structure: "stack",
  };
}
