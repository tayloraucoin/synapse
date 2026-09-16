import type {
  BlockFlow,
  BlockKind,
  BlockStructure,
  IconValue,
  SlotRole,
  SlotView,
  TemplateSummaryView,
} from "@syn/types";
import { formatClockFromMinutes, stackBlock, type StackItem } from "@syn/utils";

/**
 * Rows → the view models the block editor renders (UX v1.1 §3.11, §11.5,
 * TD-4).
 *
 * THE CLOCK IS DERIVED HERE, ONCE PER TEMPLATE, BY `stackBlock`. A slot stores
 * a length and a gap; where it starts is the walk's answer, from the anchor
 * the profile supplies for the block's kind (`anchors.ts`). One walk per
 * template, indexed by slot id — never a walk per slot, never a stored start.
 *
 * A LEGACY WINDOW SLOT is read as an item as long as its span
 * (`offset_end − offset_start`) while the deprecated columns exist, and as
 * its `duration_min` after 0006 (DYN-21 converts the rows). A legacy
 * `unscheduled` slot is on the stack like any other.
 */

export type SlotRow = {
  id: string;
  habitId: string;
  timeMode: SlotView["timeMode"];
  durationMin: number;
  gapBeforeMin: number;
  pinnedAt: string | null;
  role: SlotRole;
  priorityOverride: number | null;
  scheduling: SlotView["scheduling"];
  multitaskGroup: string | null;
  alternatesGroup: string | null;
  alternatesDefault: boolean;
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

/** The length the walk counts — the slot's own since 0006 (a legacy window's span left with the offsets). */
export function walkDurationOf(slot: SlotRow): number {
  return slot.durationMin;
}

/** `HH:mm` or `HH:mm:ss` from the driver → minutes from midnight. */
function clockToMin(clock: string): number {
  const [hour = "0", minute = "0"] = clock.split(":");
  return Number(hour) * 60 + Number(minute);
}

export function toStackItems(rows: readonly SlotRow[]): StackItem[] {
  return rows.map((row) => ({
    id: row.id,
    durationMin: walkDurationOf(row),
    gapBeforeMin: row.gapBeforeMin,
    pinnedAtMin: row.pinnedAt === null ? null : clockToMin(row.pinnedAt),
    scheduling: row.scheduling,
    priority: row.priorityOverride ?? row.habitLifePriority,
    multitaskId: row.multitaskGroup,
    alternatesId: row.alternatesGroup,
    alternatesChosen: row.alternatesGroup === null ? undefined : row.alternatesDefault,
  }));
}

export type TemplateWalk = {
  startMinById: ReadonlyMap<string, number>;
  endMinById: ReadonlyMap<string, number>;
  totalMin: number;
  startMin: number;
  endMin: number;
};

/**
 * One walk for the whole template. `anchorMin` null (a placeable kind) yields
 * no clocks and a total only.
 */
export function walkTemplate(
  rows: readonly SlotRow[],
  flow: BlockFlow,
  anchorMin: number | null,
): TemplateWalk {
  const result = stackBlock({
    items: toStackItems(rows),
    flow,
    anchorMin: anchorMin ?? 0,
  });
  const startMinById = new Map<string, number>();
  const endMinById = new Map<string, number>();
  if (anchorMin !== null) {
    for (const placed of result.placed) {
      startMinById.set(placed.id, placed.startMin);
      endMinById.set(placed.id, placed.endMin);
    }
  }
  return {
    startMinById,
    endMinById,
    totalMin: result.totalMin,
    startMin: result.startMin,
    endMin: result.endMin,
  };
}

export function toSlotViews(
  rows: readonly SlotRow[],
  walk: TemplateWalk,
): SlotView[] {
  const byGroup = new Map<string, SlotRow[]>();
  const byAlternates = new Map<string, SlotRow[]>();
  for (const row of rows) {
    if (row.multitaskGroup !== null) {
      const members = byGroup.get(row.multitaskGroup) ?? [];
      members.push(row);
      byGroup.set(row.multitaskGroup, members);
    }
    if (row.alternatesGroup !== null) {
      const members = byAlternates.get(row.alternatesGroup) ?? [];
      members.push(row);
      byAlternates.set(row.alternatesGroup, members);
    }
  }
  for (const members of byGroup.values()) {
    members.sort((a, b) => a.sortOrder - b.sortOrder);
  }

  return rows.map((row) => {
    const start = walk.startMinById.get(row.id);
    const end = walk.endMinById.get(row.id);
    const other =
      row.alternatesGroup === null
        ? undefined
        : byAlternates
            .get(row.alternatesGroup)
            ?.find((member) => member.id !== row.id);

    return {
      id: row.id,
      habitId: row.habitId,
      title: row.habitTitle,
      icon: row.habitIcon,
      timeMode: row.timeMode,
      startClock: start === undefined ? null : formatClockFromMinutes(start),
      endClock: end === undefined ? null : formatClockFromMinutes(end),
      durationMin: row.durationMin,
      priority: row.priorityOverride ?? row.habitLifePriority,
      overridden: row.priorityOverride !== null,
      scheduling: row.scheduling,
      multitask:
        row.multitaskGroup === null
          ? "none"
          : multitaskPosition(row, byGroup.get(row.multitaskGroup) ?? []),
      gapBeforeMin: row.gapBeforeMin,
      pinnedClock:
        row.pinnedAt === null
          ? null
          : formatClockFromMinutes(clockToMin(row.pinnedAt)),
      role: row.role,
      alternates:
        row.alternatesGroup === null
          ? null
          : {
              group: row.alternatesGroup,
              isDefault: row.alternatesDefault,
              otherTitle: other?.habitTitle ?? "",
              otherDurationMin: other?.durationMin ?? 0,
            },
    };
  });
}

/**
 * Stack order — `sort_order`, dense and owned by the service (v1.1 §11.5).
 * Inside a bracket or a one-of group members share a position and the same
 * number breaks the tie by `created_at`, which the caller's query supplies.
 */
export function compareSlots(a: SlotRow, b: SlotRow): number {
  return a.sortOrder - b.sortOrder;
}

export type TemplateRow = {
  id: string;
  name: string;
  kind: BlockKind;
  flow: BlockFlow;
  structure: BlockStructure;
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
    kind: row.kind,
    flow: row.flow,
    structure: row.structure,
    // UX v1.2 (RUN-1): neutral until RUN-3 reads `0007`'s columns and `day_plans`.
    workDayType: null,
    usedBy: [],
  };
}
