import type { WorkSize, WorkTier } from "@syn/types";
import type { SlotRecord, WorkItemRecord } from "@syn/validators";
import { rangeWords } from "@/components/work/from-linear/picker-view";
import type { PlannerWrite } from "@/lib/fixtures/planner";
import type { FixtureServer } from "@/lib/fixtures/server";
import { joinNotes } from "@/lib/fixtures/work";
import type { LinearRecords } from "./integration-records";
import type { WorkSheetView } from "./item-sheet-work";
import { issueLength } from "./linear-size";

/**
 * Link a Linear issue (USE-68; day/item-sheet/states/linear-search.md,
 * D-USE-36): the step's list and the link's write, pure over the server so
 * the test drives it.
 *
 * THE LIST. Open issues from the snapshot on the device, "Assigned to
 * Taylor" then "Other open issues", one tab per workspace after All; search
 * matches title and ID, case-insensitive, and never asks Linear. An issue
 * whose item is on today is greyed with where it sits and cannot be picked.
 * [ASSUMPTION] An issue already an item off today is left out: linking it
 * again would copy the work (the server refuses it).
 *
 * THE LINK. One write on the item (title, size, project emoji, ids, the
 * notes joined to the end of the description); with notes, the joined text
 * also goes to Linear's description through the outbox, as an edit there
 * would. Undo puts the item back exactly and, when the description was
 * sent, sends the old one back [ASSUMPTION: a Linear write is retried, not
 * undone, so its Undo is the old text sent again].
 */

const CLOSED = new Set(["completed", "canceled", "duplicate"]);

export const ALL_TAB = "all";

export interface LinkRow {
  key: string;
  connectionId: string;
  issueId: string;
  identifier: string;
  title: string;
  /** The project's emoji; null leaves the slot empty. */
  emoji: string | null;
  /** "Sync engine · ENG-151 · 30 min to 1 h". */
  meta: string;
  /** Points and the size word ("2 Small"); null unsized. */
  size: { points: number; size: WorkSize } | null;
  /** On today already: its tier (greyed, inert); undefined when free. */
  onToday?: WorkTier | null;
  /** The item's own icon on today, for a greyed row. */
  itemIcon?: WorkItemRecord["icon"];
}

export interface LinkListView {
  /** The tabs after All, one per workspace; one workspace has no tabs. */
  workspaces: { value: string; label: string }[];
  assigned: LinkRow[];
  other: LinkRow[];
}

export function deriveLinkList(input: {
  linear: LinearRecords;
  workItems: readonly WorkItemRecord[];
  /** The date's slots: what is on today. */
  slots: readonly Pick<SlotRecord, "workItemId" | "tier" | "onDate">[];
  dateKey: string;
  tab: string;
  query: string;
  words: { onToday: (identifier: string, tier: WorkTier | null) => string };
}): LinkListView {
  const { linear, workItems, dateKey, words } = input;
  const q = input.query.trim().toLowerCase();
  const tierOn = new Map<string, WorkTier | null>();
  for (const slot of input.slots) {
    if (slot.onDate !== dateKey || slot.workItemId === null) continue;
    tierOn.set(slot.workItemId, slot.tier);
  }
  const linked = new Map<string, WorkItemRecord>();
  for (const item of workItems) {
    if (item.archivedAt !== null || item.linearIssueId === null) continue;
    linked.set(`${item.linearConnectionId}:${item.linearIssueId}`, item);
  }

  const assigned: LinkRow[] = [];
  const other: LinkRow[] = [];
  for (const { connectionId, payload } of linear.workspaces) {
    if (input.tab !== ALL_TAB && input.tab !== connectionId) continue;
    const open = new Set(
      payload.states.filter((s) => !CLOSED.has(s.type)).map((s) => s.id),
    );
    for (const issue of payload.issues) {
      if (!open.has(issue.stateId)) continue;
      if (
        q !== "" &&
        !issue.title.toLowerCase().includes(q) &&
        !issue.identifier.toLowerCase().includes(q)
      ) {
        continue;
      }
      const item = linked.get(`${connectionId}:${issue.id}`);
      if (item !== undefined && !tierOn.has(item.id)) continue;
      const project = payload.projects.find((p) => p.id === issue.projectId);
      const length = issueLength(issue.estimate);
      const base = {
        key: `${connectionId}:${issue.id}`,
        connectionId,
        issueId: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        emoji: project?.icon ?? null,
      };
      const row: LinkRow =
        item !== undefined
          ? {
              ...base,
              meta: words.onToday(issue.identifier, tierOn.get(item.id)!),
              size: null,
              onToday: tierOn.get(item.id)!,
              itemIcon: item.icon,
            }
          : {
              ...base,
              meta: [
                project?.name ?? null,
                issue.identifier,
                rangeWords(length.lengthMinMin, length.lengthMaxMin),
              ]
                .filter((part) => part !== null)
                .join(" · "),
              size:
                length.size === null || issue.estimate === null
                  ? null
                  : { points: issue.estimate, size: length.size },
            };
      (issue.assignedToMe ? assigned : other).push(row);
    }
  }

  return {
    workspaces:
      linear.connections.length < 2
        ? []
        : linear.connections.map((c) => ({
            value: c.id,
            label: c.organizationName,
          })),
    assigned,
    other,
  };
}

/* -------------------------------------------------------------- write -- */

export type LinkServer = Pick<
  FixtureServer,
  "linkToLinear" | "writeLinearIssue" | "undo"
>;

export interface LinkWrite {
  workItemId: string;
  undo: PlannerWrite["undo"];
  /** The description before the link, when the joined text was sent. */
  description?: { before: string | null };
  /** The notes went to the end of the description. */
  joined: boolean;
}

export async function writeLink(
  server: LinkServer,
  view: WorkSheetView,
  pick: { connectionId: string; issueId: string },
  linear: LinearRecords,
): Promise<LinkWrite> {
  const workItemId = view.item.id;
  const issue = linear.workspaces
    .find((w) => w.connectionId === pick.connectionId)
    ?.payload.issues.find((row) => row.id === pick.issueId);
  const before = issue?.description ?? null;
  const notes = view.item.notes.trim() === "" ? null : view.item.notes;
  const written = await server.linkToLinear({ workItemId, ...pick });
  if (notes === null) return { workItemId, undo: written.undo, joined: false };
  await server.writeLinearIssue({
    workItemId,
    description: joinNotes(before, notes),
  });
  return {
    workItemId,
    undo: written.undo,
    description: { before },
    joined: true,
  };
}

/** Undo: the old description sent back while still linked, then the item. */
export async function undoLink(
  server: LinkServer,
  written: LinkWrite,
): Promise<void> {
  if (written.description !== undefined) {
    await server.writeLinearIssue({
      workItemId: written.workItemId,
      description: written.description.before,
    });
  }
  await server.undo(written.undo);
}
