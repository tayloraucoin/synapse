import { z } from "zod";
import { WORK_TIERS } from "@syn/constants";
import {
  dateKeySchema,
  placeSlotInput,
  slotRecord,
  workItemInput,
  workItemRecord,
  type LinearIssue,
  type WorkItemRecord,
} from "@syn/validators";
import { issueLength } from "@/lib/data/linear-size";
import { ALREADY_PLACED, parse, PlannerRefusal, slotClash } from "../planner";
import type { Journal } from "../planner/journal";
import type { FixtureRecords } from "../records";
import { NO_WORK_BLOCK, runsOn } from "./create-task";

/**
 * From Linear's write (USE-52; add/states/from-linear-by-size.md, D-USE-57):
 * each ticked issue becomes its work item (or reuses the one already linked
 * to it) and a slot in the tier on that date, after the block's own slots,
 * all in one journal so one Undo takes back every row. The length comes from
 * the size, the size from Linear's estimate; with none, 30 min. An issue
 * already on the date is refused (one item, one block a day), and nothing is
 * written to Linear: no outbox row, the snapshot untouched.
 */

export const placeIssuesInput = z.object({
  issueIds: z.array(z.string().min(1)).min(1),
  dateKey: dateKeySchema,
  blockId: z.string().uuid(),
  tier: z.enum(WORK_TIERS),
  /** A sub-issue placed on a day by itself (USE-67): its issue's work item. */
  parentWorkItemId: z.string().uuid().optional(),
});

export type PlaceIssuesInput = z.input<typeof placeIssuesInput>;

export const NO_ISSUE = "No Linear issue with that id.";
export const TICK_EACH_ONCE = "Tick each issue once.";

interface FoundIssue {
  connectionId: string;
  issue: LinearIssue;
}

function findIssue(records: FixtureRecords, issueId: string): FoundIssue {
  for (const { connection, snapshot } of records.integrations?.linear ?? []) {
    const issue = [...snapshot.issues, ...snapshot.subIssues].find(
      (row) => row.id === issueId,
    );
    if (issue) return { connectionId: connection.id, issue };
  }
  throw new PlannerRefusal("unknown", NO_ISSUE);
}

export function writeIssues(
  journal: Journal,
  records: FixtureRecords,
  raw: PlaceIssuesInput,
  at: string,
): { id: string } {
  const input = parse(placeIssuesInput, raw);
  if (new Set(input.issueIds).size !== input.issueIds.length) {
    throw new PlannerRefusal("invalid", TICK_EACH_ONCE);
  }
  const block = records.blocks.find((b) => b.id === input.blockId);
  if (!block) throw new PlannerRefusal("unknown", "No block with that id.");
  if (block.kind !== "work" || !runsOn(block, input.dateKey)) {
    throw new PlannerRefusal("not-on-date", NO_WORK_BLOCK);
  }
  const stamps = () => ({
    id: crypto.randomUUID(),
    createdAt: at,
    updatedAt: at,
  });

  let sortOrder =
    records.slots
      .filter((s) => s.blockId === block.id && s.onDate === input.dateKey)
      .reduce((top, s) => Math.max(top, s.sortOrder), -1) + 1;
  let first: string | null = null;

  for (const issueId of input.issueIds) {
    const { connectionId, issue } = findIssue(records, issueId);
    const linked = records.workItems.find(
      (row) =>
        row.linearConnectionId === connectionId &&
        row.linearIssueId === issue.id &&
        row.archivedAt === null,
    );
    // Placed already: a second day is a session; the same date is refused.
    if (
      linked &&
      slotClash(records.slots, {
        onDate: input.dateKey,
        workItemId: linked.id,
      })
    ) {
      throw new PlannerRefusal("duplicate", ALREADY_PLACED);
    }
    const item =
      linked ??
      createItem(
        journal,
        connectionId,
        issue,
        stamps,
        input.parentWorkItemId ?? null,
      );

    const slot = parse(placeSlotInput, {
      blockId: block.id,
      onDate: input.dateKey,
      sortOrder: sortOrder++,
      workItemId: item.id,
      tier: input.tier,
    });
    journal.put(
      "slots",
      slotRecord.parse({
        ...stamps(),
        blockId: slot.blockId,
        onDate: slot.onDate,
        skipped: false,
        sortOrder: slot.sortOrder,
        blockItemId: null,
        todoId: null,
        workItemId: item.id,
        tier: slot.tier ?? null,
        lengthMin: null,
        tookMin: null,
        doneAt: null,
      }),
    );
    first ??= item.id;
  }

  return { id: first! };
}

function createItem(
  journal: Journal,
  connectionId: string,
  issue: LinearIssue,
  stamps: () => { id: string; createdAt: string; updatedAt: string },
  parentWorkItemId: string | null,
): WorkItemRecord {
  const length = issueLength(issue.estimate);
  const fields = parse(workItemInput, {
    title: issue.title,
    size: length.size,
    lengthMinMin: length.lengthMinMin,
    lengthMaxMin: length.lengthMaxMin,
  });
  return journal.put(
    "workItems",
    workItemRecord.parse({
      ...stamps(),
      title: fields.title,
      notes: null,
      icon: null,
      size: fields.size ?? null,
      lengthMinMin: fields.lengthMinMin ?? null,
      lengthMaxMin: fields.lengthMaxMin ?? null,
      // Synapse's own date; Linear's due shows from the snapshot.
      dueOn: null,
      // Whose work it is resolves through the workspace (USE-9).
      clientId: null,
      parentWorkItemId,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: issue.identifier,
      linearConnectionId: connectionId,
      linearIssueId: issue.id,
    }),
  );
}
