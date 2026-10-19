import {
  linearIssueSchema,
  slotRecord,
  workItemRecord,
  type LinearIssue,
} from "@syn/validators";
import { fixtureId } from "../ids";
import {
  INTEGRATION_IDS,
  issueId,
  PROJECTS,
  stateId,
  teamId,
} from "../integrations/workspaces";
import type { FixtureRecords } from "../records";
import type { Scenario } from "./index";
import {
  ITEM_SHEET_LINEAR_IDS,
  itemSheetLinearRecords,
} from "./item-sheet-linear";

/**
 * Link a Linear issue (USE-68; day/item-sheet/states/linear-search.md,
 * linear-off.md, linear-item-from-now.md), on USE-66's Monday.
 *
 * - search, off: 6:58, before the day begins. [Draft the onboarding email]
 *   sits in Primary after [Fix the sync retry] (ENG-123), unlinked, with
 *   notes. Lighthouse holds ENG-151 (2 Small) and ENG-142 (3 Medium) in Sync
 *   engine, assigned to Taylor; Studio holds STU-14 (1 Quick, Website),
 *   assigned to someone else. Monday's other work is Synapse-only here, so
 *   ENG-123 is the one issue already on today, as drawn. `off` has no
 *   workspace connected.
 * - from-now: 9:40 in Work, the day begun. [Answer the review comments] in
 *   Secondary keeps its own title, linked to ENG-131 "[Address review on the
 *   sync PR]" in Synapse, Todo, 20 min.
 *
 * `?sheet=item&id=<ITEM_SHEET_LINK_IDS.draft | .review>&state=item-linear-<state>`.
 * Bracketed names are placeholders.
 */

export const ITEM_SHEET_LINK_IDS = {
  draft: fixtureId(4, 676),
  draftSlot: fixtureId(3, 676),
  review: fixtureId(4, 677),
  reviewSlot: fixtureId(3, 677),
} as const;

const IDS = ITEM_SHEET_LINK_IDS;
const SYNC_ENGINE = "project-sync-engine";
const WEBSITE = "project-studio-website";
const MONDAY = "2026-10-12";
const STAMP = "2026-10-11T12:00:00.000Z";
const EARLY = "2026-10-12T06:58:00-04:00";
const IN_WORK = "2026-10-12T09:40:00-04:00";

export const DRAFT_NOTES = "[Keep it to three short paragraphs.]";

function seed(
  urlKey: string,
  team: string,
  identifier: string,
  fields: Partial<LinearIssue>,
): LinearIssue {
  return linearIssueSchema.parse({
    id: issueId(identifier),
    identifier,
    title: identifier,
    description: null,
    url: `https://linear.app/${urlKey}/issue/${identifier}`,
    stateId: stateId(team, "Todo"),
    priority: 3,
    estimate: null,
    dueDate: null,
    labels: [],
    projectId: null,
    teamId: teamId(team),
    parentId: null,
    assignedToMe: true,
    ...fields,
  });
}

/** A work item in Monday's Work block, after the block's own slots. */
function addWork(
  records: FixtureRecords,
  ids: { item: string; slot: string },
  fields: Record<string, unknown>,
  slot: { tier: "primary" | "secondary"; lengthMin: number | null },
) {
  records.workItems.push(
    workItemRecord.parse({
      id: ids.item,
      createdAt: STAMP,
      updatedAt: STAMP,
      notes: null,
      icon: null,
      size: null,
      lengthMinMin: null,
      lengthMaxMin: null,
      dueOn: null,
      clientId: null,
      parentWorkItemId: null,
      doneAt: null,
      doneSource: null,
      archivedAt: null,
      linearIdentifier: null,
      linearConnectionId: null,
      linearIssueId: null,
      ...fields,
    }),
  );
  const anchor = records.slots.find(
    (row) => row.id === ITEM_SHEET_LINEAR_IDS.slot,
  )!;
  const top = records.slots
    .filter((row) => row.blockId === anchor.blockId && row.onDate === MONDAY)
    .reduce((max, row) => Math.max(max, row.sortOrder), 0);
  records.slots.push(
    slotRecord.parse({
      ...anchor,
      id: ids.slot,
      workItemId: ids.item,
      tier: slot.tier,
      sortOrder: top + 1,
      lengthMin: slot.lengthMin,
    }),
  );
}

/** Lighthouse first, then Kestrel as "Studio"; only ENG-123 on today. */
export function itemSheetLinkRecords(): FixtureRecords {
  const records = itemSheetLinearRecords({ ready: false });
  const integrations = records.integrations!;
  const CONN = INTEGRATION_IDS.connections;

  // Monday's other work is Synapse-only here: ENG-123 is the one on today.
  const onMonday = new Set(
    records.slots
      .filter((row) => row.onDate === MONDAY && row.workItemId !== null)
      .map((row) => row.workItemId),
  );
  records.workItems = records.workItems.map((row) =>
    onMonday.has(row.id) && row.id !== ITEM_SHEET_LINEAR_IDS.item
      ? {
          ...row,
          linearIdentifier: null,
          linearConnectionId: null,
          linearIssueId: null,
        }
      : row,
  );
  const linked = new Set(
    records.workItems
      .filter((row) => row.linearIssueId !== null)
      .map((row) => row.linearIssueId),
  );

  const lighthouse = integrations.linear.find(
    (w) => w.connection.id === CONN.lighthouse,
  )!;
  const studio = integrations.linear.find(
    (w) => w.connection.id === CONN.kestrel,
  )!;
  lighthouse.snapshot.issues = [
    seed("lighthouse", "ENG", "ENG-151", {
      title: "[Add retry queue metrics]",
      projectId: SYNC_ENGINE,
      estimate: 2,
      description: "[Count retries per mutation and chart the queue depth.]",
    }),
    seed("lighthouse", "ENG", "ENG-142", {
      title: "[Flaky test in the sync suite]",
      projectId: SYNC_ENGINE,
      estimate: 3,
    }),
    ...lighthouse.snapshot.issues.filter((row) => linked.has(row.id)),
  ];
  studio.connection = {
    ...studio.connection,
    organizationName: "Studio",
    urlKey: "studio",
  };
  studio.snapshot.projects.push({
    id: WEBSITE,
    name: "Website",
    icon: "🌐",
    color: "#4cb782",
  });
  studio.snapshot.issues = [
    ...studio.snapshot.issues.filter((row) => linked.has(row.id)),
    seed("studio", "KES", "STU-14", {
      title: "[Lay out the booking page]",
      projectId: WEBSITE,
      estimate: 1,
      assignedToMe: false,
    }),
  ];
  integrations.linear = [lighthouse, studio];

  addWork(
    records,
    { item: IDS.draft, slot: IDS.draftSlot },
    {
      title: "[Draft the onboarding email]",
      notes: DRAFT_NOTES,
      lengthMinMin: 45,
      lengthMaxMin: 45,
    },
    { tier: "primary", lengthMin: null },
  );
  return records;
}

/** No workspace connected: the row reads Connect Linear. */
export function itemSheetLinkOffRecords(): FixtureRecords {
  const records = itemSheetLinkRecords();
  records.integrations = { ...records.integrations!, linear: [], outbox: [] };
  return records;
}

/** 9:40 in Work: a linked item with its own title, from Now. */
export function itemSheetFromNowRecords(): FixtureRecords {
  const records = itemSheetLinearRecords({ ready: true });
  const lighthouse = records.integrations!.linear.find(
    (w) => w.connection.id === INTEGRATION_IDS.connections.lighthouse,
  )!;
  lighthouse.snapshot.issues.push(
    seed("lighthouse", "ENG", "ENG-131", {
      title: "[Address review on the sync PR]",
      projectId: PROJECTS.synapse,
      estimate: 1,
    }),
  );
  addWork(
    records,
    { item: IDS.review, slot: IDS.reviewSlot },
    {
      title: "[Answer the review comments]",
      icon: { kind: "emoji", value: "📄" },
      size: "quick",
      lengthMinMin: 20,
      lengthMaxMin: 20,
      linearIdentifier: "ENG-131",
      linearConnectionId: INTEGRATION_IDS.connections.lighthouse,
      linearIssueId: issueId("ENG-131"),
    },
    { tier: "secondary", lengthMin: 20 },
  );
  return records;
}

function scenario(
  name: string,
  now: string,
  records: () => FixtureRecords,
  open?: string,
): () => Scenario {
  return () => ({
    name,
    now,
    records: records(),
    mode: "ready",
    ...(open === undefined ? {} : { view: { open } }),
  });
}

export const ITEM_SHEET_LINK_SCENARIOS: Record<string, () => Scenario> = {
  /** The step open on [Draft the onboarding email]. */
  "item-linear-search": scenario(
    "item-linear-search",
    EARLY,
    itemSheetLinkRecords,
    "item:link",
  ),
  /** The same item, its row before the step. */
  "item-linear-unlinked": scenario(
    "item-linear-unlinked",
    EARLY,
    itemSheetLinkRecords,
  ),
  "item-linear-off": scenario(
    "item-linear-off",
    EARLY,
    itemSheetLinkOffRecords,
  ),
  "item-linear-from-now": scenario(
    "item-linear-from-now",
    IN_WORK,
    itemSheetFromNowRecords,
  ),
};
