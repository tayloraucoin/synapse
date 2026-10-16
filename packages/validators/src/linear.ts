import { z } from "zod";
import { LINEAR_WRITE_KINDS, LINEAR_WRITE_STATES } from "@syn/constants";
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
