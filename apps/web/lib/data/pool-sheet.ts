import type { WorkTier } from "@syn/types";
import { weekdayIndex } from "@syn/utils";
import type { SlotRecord } from "@syn/validators";
import type {
  PoolClientChoice,
  PoolGroupView,
  PoolHeadView,
  PoolLineView,
  PoolPanelView,
  PoolRowView,
  PoolTab,
} from "./pool-view";
import { SIZE_WORDS } from "./week-view";

/**
 * The phone's pool sheet, worked out (USE-79; ux/work/this-week/
 * pool-sheet-anatomy.md and its states): `poolView`'s groups, read the way
 * the sheet draws them. The Pool tab holds the work not yet on a day
 * (D-USE-31); From Linear the issues not in the pool, with the placed ones
 * faded and naming where they sit (D-USE-57); search one list across both
 * tabs, each meta saying where the row lives. Every word is printed here.
 */

export const POOL_SHEET_WORDS = {
  pool: "Pool",
  linear: "Linear",
  noLinear: "No Linear",
  unsized: "unsized",
  spread: "Spread across the week",
  alreadyOn: (where: string) => `already on ${where}`,
  synced: (ago: string) => `Synced ${ago}`,
  tiers: {
    urgent: "Urgent",
    primary: "Primary",
    secondary: "Secondary",
    stretch: "Stretch",
  } satisfies Record<WorkTier, string>,
} as const;

const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export type PoolSheetLead =
  | { kind: "emoji"; emoji: string | null }
  | { kind: "status"; status: NonNullable<PoolRowView["status"]> };

export interface PoolSheetRow {
  key: string;
  /** The row opens this item's sheet; null on an issue not in the pool. */
  workItemId: string | null;
  issue: PoolRowView["issue"];
  title: string;
  lead: PoolSheetLead;
  /** "KES-58 · 3 Medium · due Wed". */
  meta: string;
  /** Place shows; a row already on a day has none. */
  placeable: boolean;
  faded: boolean;
  /** The row's accessible name: its title and meta. */
  label: string;
}

export interface PoolSheetLine extends Omit<PoolLineView, "rows"> {
  rows: PoolSheetRow[];
}

export interface PoolSheetGroup {
  key: string;
  head: PoolHeadView;
  lines: PoolSheetLine[];
}

export interface PoolSheetView {
  /** The second tab reads From Linear, else Connect Linear (D-USE-56). */
  linearConnected: boolean;
  groups: PoolSheetGroup[];
  /** Searching: one list across both tabs; `noMatch` when it is empty. */
  search: { rows: PoolSheetRow[]; noMatch: boolean } | null;
  /** Nothing waits in the pool (pool-empty.md). */
  empty: boolean;
  /** Filters on and nothing passes them. */
  filteredOut: boolean;
  /** "Synced 2 min ago", From Linear only. */
  sync: string | null;
  clientChoices: PoolClientChoice[];
}

export interface PoolSheetInput {
  panel: PoolPanelView;
  tab: PoolTab;
  /** The open items' sessions: where each placed one sits. */
  slots: readonly SlotRecord[];
  /** Any of the sheet's filters is set. */
  filtered: boolean;
}

/** "Mon 12, Primary": the item's first session on a day. */
export function placedWhere(
  workItemId: string,
  slots: readonly SlotRecord[],
): string | null {
  const first = slots
    .filter((slot) => slot.workItemId === workItemId)
    .sort((a, b) => (a.onDate < b.onDate ? -1 : a.onDate > b.onDate ? 1 : 0))
    .at(0);
  if (!first) return null;
  const day = WEEKDAY_SHORT[weekdayIndex(first.onDate)]!;
  const date = `${day} ${Number(first.onDate.slice(8, 10))}`;
  // [ASSUMPTION] Sessions on several days name the first, as the board's one.
  return first.tier ? `${date}, ${POOL_SHEET_WORDS.tiers[first.tier]}` : date;
}

/** "Kestrel": a client's first word, in a search meta (pool-search.md). */
function shortClient(name: string): string {
  return name.trim().split(/\s+/)[0] ?? name;
}

function sizeWord(row: PoolRowView): string {
  return row.sizeKey ? SIZE_WORDS[row.sizeKey] : POOL_SHEET_WORDS.unsized;
}

function dueWord(row: PoolRowView): string | null {
  if (!row.due) return null;
  return row.due.word.charAt(0).toLowerCase() + row.due.word.slice(1);
}

/** The ID and size, or on Synapse-only work the size and "No Linear". */
function idAndSize(row: PoolRowView): string[] {
  return row.identifier
    ? [row.identifier, sizeWord(row)]
    : [sizeWord(row), POOL_SHEET_WORDS.noLinear];
}

type Place = "pool" | "linear" | "search-pool" | "search-linear";

function sheetRow(
  row: PoolRowView,
  place: Place,
  slots: readonly SlotRecord[],
): PoolSheetRow {
  const where =
    row.placed !== null && row.workItemId
      ? placedWhere(row.workItemId, slots)
      : null;
  const placed = where !== null;
  const searching = place === "search-pool" || place === "search-linear";
  let parts: (string | null)[];
  if (searching) {
    parts = [
      place === "search-pool" ? POOL_SHEET_WORDS.pool : POOL_SHEET_WORDS.linear,
      row.clientName ? shortClient(row.clientName) : null,
      ...(placed
        ? [
            row.identifier ?? POOL_SHEET_WORDS.noLinear,
            POOL_SHEET_WORDS.alreadyOn(where),
          ]
        : idAndSize(row)),
    ];
  } else if (placed) {
    parts = [
      row.identifier ?? POOL_SHEET_WORDS.noLinear,
      POOL_SHEET_WORDS.alreadyOn(where),
    ];
  } else if (place === "linear") {
    parts = [
      row.identifier,
      row.status?.word ?? null,
      sizeWord(row),
      dueWord(row),
    ];
  } else {
    parts = [
      ...idAndSize(row),
      dueWord(row),
      // A hint, not a control: Place's doesn't-fit card offers Spread (pool-sheet.md).
      row.sizeKey === "huge" ? POOL_SHEET_WORDS.spread : null,
    ];
  }
  const meta = parts.filter(Boolean).join(" · ");
  const lead: PoolSheetLead =
    place === "linear" && row.status
      ? { kind: "status", status: row.status }
      : { kind: "emoji", emoji: row.emoji };
  return {
    key: row.key,
    workItemId: row.workItemId,
    issue: row.issue,
    title: row.title,
    lead,
    meta,
    placeable: !placed,
    faded: placed,
    label: `${row.title}, ${meta}`,
  };
}

function sheetGroups(
  groups: readonly PoolGroupView[],
  tab: PoolTab,
  slots: readonly SlotRecord[],
): PoolSheetGroup[] {
  return (
    groups
      .map((group) => ({
        key: group.key,
        head: group.head,
        lines: group.lines
          .map((line) => ({
            key: line.key,
            team: line.team,
            project: line.project,
            rows: line.rows
              // The Pool tab is the work not yet on a day (D-USE-31).
              .filter((row) => tab === "linear" || row.placed === null)
              .map((row) => sheetRow(row, tab, slots)),
          }))
          .filter((line) => line.rows.length > 0),
      }))
      // [ASSUMPTION] A client with nothing to show drops its head on the phone.
      .filter((group) => group.lines.length > 0)
  );
}

export function poolSheetView({
  panel,
  tab,
  slots,
  filtered,
}: PoolSheetInput): PoolSheetView {
  const shownTab: PoolTab = panel.linearConnected ? tab : "pool";
  const search = panel.search
    ? {
        rows: [
          ...panel.search.pool.map((row) =>
            sheetRow(row, "search-pool", slots),
          ),
          ...panel.search.linear.map((row) =>
            sheetRow(row, "search-linear", slots),
          ),
        ],
        noMatch: panel.search.pool.length + panel.search.linear.length === 0,
      }
    : null;
  const groups = panel.search ? [] : sheetGroups(panel.groups, shownTab, slots);
  const none = !panel.search && groups.length === 0;
  return {
    linearConnected: panel.linearConnected,
    groups,
    search,
    empty: tab === "pool" && none && !filtered,
    filteredOut: none && filtered,
    sync:
      panel.syncAgo === null ? null : POOL_SHEET_WORDS.synced(panel.syncAgo),
    clientChoices: panel.clientChoices,
  };
}
