import { z } from "zod";
import {
  LINEAR_WRITE_KINDS,
  LINEAR_WRITE_STATES,
  WORK_TIERS,
} from "@syn/constants";
import { googleAccountView, googleCalendarView } from "./google";
import { dateKeySchema } from "./keys";
import { instantSchema } from "./planner";
import { clientRecord } from "./work";

/**
 * Linear as Synapse reads it (USE-32): the snapshot's five lists, the
 * connection, the outbox and the writes the screens send. These shapes are
 * ours; the sync maps whatever Linear returns into them (the issue fields
 * stay unverified until the sync ticket's spike).
 *
 * PARSED, NEVER TRUSTED: every object strips a key it does not know (zod's
 * default), and a missing required field fails the parse, so the sync sets
 * `last_sync_error` instead of storing a half issue.
 *
 * NO CREDENTIALS: the connection's ciphertext columns are read only by
 * `services/linear/` and have no field on any view here; a test walks
 * every export's keys.
 */

/** A workflow state's group, as Linear types it. */
export const LINEAR_STATE_TYPES = [
  "triage",
  "backlog",
  "unstarted",
  "started",
  "completed",
  "canceled",
  "duplicate",
] as const;

export const linearStateTypeSchema = z.enum(LINEAR_STATE_TYPES);

/** Linear's priority: 0 none, 1 urgent, 2 high, 3 normal, 4 low. */
export const linearPrioritySchema = z.number().int().min(0).max(4);

export const linearOrganizationSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  urlKey: z.string().min(1),
  logoUrl: z.string().url().nullable(),
});

export type LinearOrganization = z.infer<typeof linearOrganizationSchema>;

export const linearTeamSchema = z.object({
  id: z.string().min(1),
  key: z.string().min(1),
  name: z.string(),
  icon: z.string().nullable(),
});

export type LinearTeam = z.infer<typeof linearTeamSchema>;

export const linearProjectSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string(),
});

export type LinearProject = z.infer<typeof linearProjectSchema>;

/** One status in a team's workflow; `position` orders it within its group. */
export const linearWorkflowStateSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  type: linearStateTypeSchema,
  position: z.number().finite(),
  color: z.string(),
  teamId: z.string().min(1),
});

export type LinearWorkflowState = z.infer<typeof linearWorkflowStateSchema>;

export const linearLabelSchema = z.object({
  name: z.string(),
  color: z.string(),
});

/**
 * An issue assigned to Taylor, or a sub-issue of one. Its description is the
 * item's Notes (D-USE-36).
 */
export const linearIssueSchema = z.object({
  id: z.string().min(1),
  identifier: z.string().min(1),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  stateId: z.string().min(1),
  priority: linearPrioritySchema,
  estimate: z.number().nonnegative().nullable(),
  dueDate: dateKeySchema.nullable(),
  labels: z.array(linearLabelSchema),
  projectId: z.string().nullable(),
  teamId: z.string().min(1),
  parentId: z.string().nullable(),
  assignedToMe: z.boolean(),
});

export type LinearIssue = z.infer<typeof linearIssueSchema>;

/** `linear_snapshots.payload`: the five lists one sync fetched. */
export const linearSnapshotPayload = z.object({
  issues: z.array(linearIssueSchema),
  subIssues: z.array(linearIssueSchema),
  teams: z.array(linearTeamSchema),
  projects: z.array(linearProjectSchema),
  states: z.array(linearWorkflowStateSchema),
});

export type LinearSnapshotPayload = z.infer<typeof linearSnapshotPayload>;

/** A connected workspace as Settings and the pool read it. */
export const linearConnectionView = z.object({
  id: z.string().uuid(),
  organizationName: z.string(),
  urlKey: z.string(),
  logoUrl: z.string().url().nullable(),
  /** Set when every project belongs to one client. */
  clientId: z.string().uuid().nullable(),
  perProject: z.boolean(),
  lastSyncedAt: instantSchema.nullable(),
  lastSyncError: z.string().nullable(),
});

export type LinearConnectionView = z.infer<typeof linearConnectionView>;

/** What the outbox writes (D-USE-113), spelled once in `@syn/constants` (USE-100). */
export { LINEAR_WRITE_KINDS, LINEAR_WRITE_STATES };

/** One `linear_writes` row; a `failed` one shows "Not updated in Linear." */
export const linearWriteView = z.object({
  id: z.string().uuid(),
  workItemId: z.string().uuid(),
  kind: z.enum(LINEAR_WRITE_KINDS),
  state: z.enum(LINEAR_WRITE_STATES),
  createdAt: instantSchema,
});

export type LinearWriteView = z.infer<typeof linearWriteView>;

const ISSUE_WRITE_FIELDS = [
  "stateId",
  "priority",
  "description",
  "estimate",
] as const;

/**
 * A change the Item sheet sends to a linked issue: exactly one of status,
 * priority, description or estimate. Done and reopen are the check's, not
 * this input's.
 */
export const linearIssueWriteInput = z
  .object({
    workItemId: z.string().uuid(),
    stateId: z.string().min(1).optional(),
    priority: linearPrioritySchema.optional(),
    description: z.string().max(100_000).nullable().optional(),
    estimate: z.number().nonnegative().nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const sent = ISSUE_WRITE_FIELDS.filter((key) => value[key] !== undefined);
    if (sent.length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["stateId"],
        message: "Change one thing at a time.",
      });
    }
  });

export type LinearIssueWriteInput = z.infer<typeof linearIssueWriteInput>;

/** `linear_project_clients`: a project's client, or none. */
export const linearProjectClientInput = z.object({
  connectionId: z.string().uuid(),
  projectId: z.string().min(1),
  clientId: z.string().uuid().nullable(),
});

export type LinearProjectClientInput = z.infer<typeof linearProjectClientInput>;

/** The workspace's one client, or set per project (D-USE-91). */
export const workspaceClientInput = z.object({
  connectionId: z.string().uuid(),
  clientId: z.string().uuid().nullable(),
  perProject: z.boolean(),
});

export type WorkspaceClientInput = z.infer<typeof workspaceClientInput>;

/** Settings' ··· › Disconnect on a workspace (USE-100). */
export const linearDisconnectInput = z.object({
  connectionId: z.string().uuid(),
});

export type LinearDisconnectInput = z.infer<typeof linearDisconnectInput>;

/**
 * `connections.list` (USE-100): what Settings › Connections reads, every
 * part a view. Strict, so a column added to a select by mistake fails the
 * output parse instead of reaching the browser.
 */
export const connectionsView = z
  .object({
    linear: z.array(linearConnectionView.strict()),
    googleAccounts: z.array(googleAccountView.strict()),
    googleCalendars: z.array(googleCalendarView.strict()),
    /** `users.clients_enabled` (D-USE-40: off by default). */
    clientsEnabled: z.boolean(),
    clients: z.array(clientRecord.strict()),
    projectClients: z.array(linearProjectClientInput.strict()),
  })
  .strict();

export type ConnectionsView = z.infer<typeof connectionsView>;

/*
 * ---- Linear's own responses (USE-101) ----
 *
 * What the sync's three GraphQL documents select, checked against Linear's
 * published SDK schema on 2026-10-17 (`Issue`, `WorkflowState`, `Team`,
 * `Project`, `IssueLabel`). Each response's `data` is parsed here before the
 * sync maps it into the snapshot: an unknown key is stripped, a missing
 * required one fails the parse and the sync records `last_sync_error`.
 */

const linearRef = z.object({ id: z.string().min(1) });

const linearPageInfo = z.object({
  hasNextPage: z.boolean(),
  endCursor: z.string().nullable(),
});

/** One issue node as the documents' `IssueFields` fragment selects it. */
export const linearApiIssue = z.object({
  id: z.string().min(1),
  identifier: z.string().min(1),
  title: z.string(),
  description: z.string().nullable(),
  url: z.string().url(),
  priority: linearPrioritySchema,
  estimate: z.number().nonnegative().nullable(),
  dueDate: dateKeySchema.nullable(),
  state: linearRef,
  team: linearRef,
  project: linearProjectSchema.nullable(),
  parent: linearRef.nullable(),
  assignee: linearRef.nullable(),
  labels: z.object({ nodes: z.array(linearLabelSchema) }),
});

export type LinearApiIssue = z.infer<typeof linearApiIssue>;

/** An assigned (or placed) issue with its first page of sub-issues. */
export const linearApiIssueWithChildren = linearApiIssue.extend({
  children: z.object({ nodes: z.array(linearApiIssue) }),
});

export type LinearApiIssueWithChildren = z.infer<
  typeof linearApiIssueWithChildren
>;

const linearIssuePage = z.object({
  nodes: z.array(linearApiIssueWithChildren),
  pageInfo: linearPageInfo,
});

/** `AssignedIssues`: the viewer's open assigned issues, one page. */
export const linearAssignedIssuesData = z.object({
  viewer: z.object({ id: z.string().min(1), assignedIssues: linearIssuePage }),
});

/** `IssuesById`: placed issues read by id, so a closed one is seen. */
export const linearIssuesByIdData = z.object({
  viewer: z.object({ id: z.string().min(1) }),
  issues: linearIssuePage,
});

/** `TeamStates`: every team's workflow, one page of teams. */
export const linearTeamStatesData = z.object({
  teams: z.object({
    nodes: z.array(
      z.object({
        id: z.string().min(1),
        key: z.string().min(1),
        name: z.string(),
        icon: z.string().nullable(),
        states: z.object({
          nodes: z.array(linearWorkflowStateSchema.omit({ teamId: true })),
        }),
      }),
    ),
    pageInfo: linearPageInfo,
  }),
});

/*
 * ---- The Linear router (USE-101) ----
 */

/** An assigned, open issue with no work item yet: placing it creates the row. */
export const linearLooseIssue = linearIssueSchema.extend({
  connectionId: z.string().uuid(),
});

export type LinearLooseIssue = z.infer<typeof linearLooseIssue>;

/**
 * `linear.read`: each workspace's latest snapshot, the outbox (USE-102 fills
 * it) and the pool's issues not yet placed. Views only.
 */
export const linearReadOutput = z
  .object({
    connections: z.array(linearConnectionView.strict()),
    workspaces: z.array(
      z.object({
        connectionId: z.string().uuid(),
        payload: linearSnapshotPayload,
      }),
    ),
    outbox: z.array(linearWriteView.strict()),
    notInPool: z.array(linearLooseIssue),
  })
  .strict();

export type LinearReadOutput = z.infer<typeof linearReadOutput>;

/** Sync now: one workspace, or every one. */
export const linearSyncInput = z
  .object({ connectionId: z.string().uuid().optional() })
  .optional();

export type LinearSyncInput = z.infer<typeof linearSyncInput>;

/**
 * From Linear (USE-52; moved from the fixtures in USE-101): each ticked
 * issue's work item (or the one already linked) and a session in the tier.
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

/** Link a Linear issue to a Synapse item (USE-68, D-USE-36). */
export const linkToLinearInput = z.object({
  workItemId: z.string().uuid(),
  connectionId: z.string().uuid(),
  issueId: z.string().min(1),
});

export type LinkToLinearInput = z.infer<typeof linkToLinearInput>;
