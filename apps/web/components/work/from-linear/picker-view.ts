import type { WorkSize, WorkTier } from "@syn/types";
import {
  fitInBlock,
  instantToWallClockMinutes,
  statusFill,
  tierRank,
} from "@syn/utils";
import type { LinearIssue } from "@syn/validators";
import {
  clientOf,
  type ConnectionsRecords,
  type LinearRecords,
} from "@/lib/data/integration-records";
import { issueLength } from "@/lib/data/linear-size";
import {
  lineOf,
  type PoolLineView,
  type StatusShapeType,
} from "@/lib/data/pool-view";
import type { SetUpDay } from "@/lib/data/use-set-up-day";
import {
  clockWords,
  listWords,
  shortDate,
  type FitDay,
} from "../add/new-task/form";
import type { ClientHue } from "../view";
import { FROM_LINEAR_COPY as COPY } from "./copy";

/**
 * From Linear's picker, pure (USE-52; add/states/from-linear-by-size.md,
 * D-USE-57, D-USE-77): the snapshot's issues filtered (Assigned to <name>,
 * Not done, Size, search), grouped by client in the one order with team and
 * project lines (the pool's `lineOf`), each row with its points word and
 * length range; an issue already on the date faded, naming its day and
 * tier; and the line above Add from USE-8's `fitInBlock`, in words. Nothing
 * here reads a hook or the clock.
 */

export interface PickerFilters {
  assigned: boolean;
  notDone: boolean;
  /** None picked shows every size. */
  sizes: WorkSize[];
  query: string;
}

export const DEFAULT_FILTERS: PickerFilters = {
  assigned: true,
  notDone: true,
  sizes: [],
  query: "",
};

export interface PickerRow {
  issueId: string;
  identifier: string;
  title: string;
  /** The project's emoji, else Linear's status shape (D-USE-35). */
  icon:
    | { kind: "emoji"; emoji: string }
    | {
        kind: "status";
        type: StatusShapeType;
        label: string;
        progress: number;
        color: string;
      };
  /** "Sync engine · ENG-151 · 30 min to 1 h", or "ENG-123 · already on Mon 12, in Primary". */
  meta: string;
  /** "2 Small", or "unsized". */
  sizeWord: string;
  /** Already on the date: faded, no checkbox. */
  placed: boolean;
  ticked: boolean;
  /** The top of its range in minutes; null for Huge. */
  topMin: number | null;
}

export interface PickerLine extends Omit<PoolLineView, "rows"> {
  /** "Lighthouse [placeholder]" with more than one workspace connected. */
  workspace: string | null;
  rows: PickerRow[];
}

export interface PickerGroup {
  key: string;
  /** Null with clients off: the lines stand alone. */
  head: { letter: string; name: string; hue: ClientHue | null } | null;
  lines: PickerLine[];
}

export interface PickerView {
  groups: PickerGroup[];
  /** The line above Add; null with nothing ticked. */
  line: string | null;
  action: string;
  context: string;
  /** Ticked rows that are still addable, in the order shown. */
  ticked: string[];
}

/**
 * A row's range as the board draws it: hours from an hour, so "15 to 30
 * min", "30 min to 1 h", "1 to 2 h", "4 h or more" [ASSUMPTION: the board's
 * words over the dev note's switch at 90 min, which New task keeps].
 */
export function rangeWords(min: number, max: number | null): string {
  const unit = (n: number) => (n >= 60 ? "h" : "min");
  const amount = (n: number) => String(n >= 60 ? n / 60 : n);
  if (max === null) return `${amount(min)} ${unit(min)} or more`;
  if (min === max) return `${amount(max)} ${unit(max)}`;
  return unit(min) === unit(max)
    ? `${amount(min)} to ${amount(max)} ${unit(max)}`
    : `${amount(min)} ${unit(min)} to ${amount(max)} ${unit(max)}`;
}

const CLOSED = new Set(["completed", "canceled", "duplicate"]);

function matches(issue: LinearIssue, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (q === "") return true;
  return (
    issue.title.toLowerCase().includes(q) ||
    issue.identifier.toLowerCase().includes(q)
  );
}

/** Where each linked issue already sits on the date: its tier, or null. */
function placedOn(day: SetUpDay | undefined): Map<string, WorkTier | null> {
  const placed = new Map<string, WorkTier | null>();
  if (!day) return placed;
  const items = new Map(day.records.workItems.map((i) => [i.id, i]));
  for (const block of day.blocks) {
    for (const slot of block.slots) {
      const item =
        slot.workItemId === null ? undefined : items.get(slot.workItemId);
      if (!item || item.linearIssueId === null || item.archivedAt !== null) {
        continue;
      }
      placed.set(`${item.linearConnectionId}:${item.linearIssueId}`, slot.tier);
    }
  }
  return placed;
}

export function derivePicker(input: {
  linear: LinearRecords;
  connections: ConnectionsRecords;
  /** The date's set-up day, for what is already on it. */
  day: SetUpDay | undefined;
  /** The Work block's fit inputs on the date. */
  fit: FitDay | undefined;
  blockName: string;
  dateKey: string;
  tier: WorkTier;
  timeZone: string;
  filters: PickerFilters;
  ticked: readonly string[];
  personName: string;
}): PickerView {
  const { linear, connections, filters } = input;
  const tierWord = COPY.tiers[input.tier];
  const day = shortDate(input.dateKey);
  const placed = placedOn(input.day);
  const manyWorkspaces = linear.connections.length > 1;
  const clientsById = new Map(connections.clients.map((c) => [c.id, c]));

  const groups = new Map<string, PickerGroup>();
  const tickedTops: (number | null)[] = [];
  const tickedShown: string[] = [];

  for (const workspace of linear.workspaces) {
    const { payload, connectionId } = workspace;
    const connection = linear.connections.find((c) => c.id === connectionId);
    for (const issue of [...payload.issues, ...payload.subIssues]) {
      const state = payload.states.find((s) => s.id === issue.stateId);
      if (!state) continue;
      const length = issueLength(issue.estimate);
      const where = placed.get(`${connectionId}:${issue.id}`);
      const isPlaced = where !== undefined;
      const ticked = !isPlaced && input.ticked.includes(issue.id);
      // A ticked row counts whether the filters show it or not.
      if (ticked) tickedTops.push(length.lengthMaxMin);

      if (filters.assigned && !issue.assignedToMe) continue;
      if (filters.notDone && CLOSED.has(state.type)) continue;
      if (
        filters.sizes.length > 0 &&
        (length.size === null || !filters.sizes.includes(length.size))
      ) {
        continue;
      }
      if (!matches(issue, filters.query)) continue;
      if (ticked) tickedShown.push(issue.id);

      const project =
        payload.projects.find((p) => p.id === issue.projectId) ?? null;
      const range = rangeWords(length.lengthMinMin, length.lengthMaxMin);
      const row: PickerRow = {
        issueId: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        icon: project?.icon
          ? { kind: "emoji", emoji: project.icon }
          : {
              kind: "status",
              type:
                state.type === "duplicate"
                  ? "canceled"
                  : (state.type as StatusShapeType),
              label: state.name,
              progress: statusFill(state, payload.states),
              color: state.color,
            },
        meta: isPlaced
          ? [
              issue.identifier,
              COPY.alreadyOn(day, where === null ? null : COPY.tiers[where]),
            ].join(" · ")
          : [project?.name ?? null, issue.identifier, range]
              .filter((part) => part !== null)
              .join(" · "),
        sizeWord: length.size === null ? COPY.unsized : COPY.sizes[length.size],
        placed: isPlaced,
        ticked,
        topMin: length.lengthMaxMin,
      };

      const client = clientOf(connections, linear, {
        id: "",
        clientId: null,
        linearConnectionId: connectionId,
        linearIssueId: issue.id,
      });
      const groupKey = !connections.clientsEnabled
        ? "all"
        : (client?.id ?? "none");
      let group = groups.get(groupKey);
      if (!group) {
        group = {
          key: groupKey,
          head: !connections.clientsEnabled
            ? null
            : client
              ? {
                  letter: client.name.charAt(0).toUpperCase(),
                  name: client.name,
                  hue: client.colorKey as ClientHue,
                }
              : { letter: "", name: COPY.noClient, hue: null },
          lines: [],
        };
        groups.set(groupKey, group);
      }
      const { line } = lineOf(linear, connectionId, issue, input.personName);
      let pickerLine = group.lines.find((l) => l.key === line.key);
      if (!pickerLine) {
        const workspaceName =
          manyWorkspaces && connection ? connection.organizationName : null;
        pickerLine = {
          ...line,
          // A named own workspace says it once, not "In Taylor's workspace" too.
          team:
            workspaceName !== null && connection?.perProject ? null : line.team,
          workspace: workspaceName,
          rows: [],
        };
        group.lines.push(pickerLine);
      }
      pickerLine.rows.push(row);
    }
  }

  // Clients in the one order (D-USE-96), no client last.
  const order = (key: string) =>
    clientsById.get(key)?.sortOrder ?? Number.MAX_SAFE_INTEGER;
  const sorted = [...groups.values()].sort(
    (a, b) => order(a.key) - order(b.key),
  );

  return {
    groups: sorted,
    line: consequence({ ...input, tierWord, tops: tickedTops }),
    action: COPY.addTo(tierWord),
    context: COPY.context(day, input.blockName, tierWord),
    ticked: tickedShown,
  };
}

/**
 * The line above Add [PROPOSED, D-USE-77]: where the tier ends at the top of
 * its ranges with the ticked rows, and, past the block's end, which lower
 * tiers holding work wait. Words, never red or a count; null with none
 * ticked.
 */
function consequence(input: {
  fit: FitDay | undefined;
  blockName: string;
  tier: WorkTier;
  tierWord: string;
  timeZone: string;
  tops: (number | null)[];
}): string | null {
  if (input.tops.length === 0 || !input.fit) return null;
  if (input.tops.includes(null)) return COPY.noTop(input.tierWord);
  const topMin = input.tops.reduce<number>((sum, top) => sum + (top ?? 0), 0);
  const { fit } = input;
  const result = fitInBlock({
    block: fit.block,
    slots: fit.slots,
    busy: fit.busy,
    tier: input.tier,
    topMin,
  });
  if (result.runsTo === null) return COPY.noTop(input.tierWord);
  const minutes = instantToWallClockMinutes(result.runsTo, input.timeZone);
  const at = clockWords(
    `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
  );
  const runs = COPY.runsTo(input.tierWord, at);
  if (result.fits) return `${runs}.`;

  const rank = tierRank(input.tier);
  const below = (["urgent", "primary", "secondary", "stretch"] as const).filter(
    (tier) =>
      tierRank(tier) > rank && fit.slots.some((slot) => slot.tier === tier),
  );
  const past = COPY.pastEnd(input.blockName, clockWords(fit.block.endsAt));
  if (below.length === 0) return `${runs}${past}`;
  return `${runs}${past} ${COPY.wait(
    listWords(below.map((tier) => COPY.tiers[tier])),
    below.length > 1,
  )}`;
}
