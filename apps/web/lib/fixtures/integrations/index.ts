import { z } from "zod";
import {
  clientInput,
  clientRecord,
  clientsEnabledInput,
  googleCalendarToggleInput,
  googleCalendarView,
  linearConnectionView,
  linearIssueSchema,
  linearIssueWriteInput,
  linearProjectClientInput,
  linearSnapshotPayload,
  linearWriteView,
  slotRecord,
  workItemRecord,
  type ClientInput,
  type ClientRecord,
  type ClientsEnabledInput,
  type GoogleCalendarToggleInput,
  type LinearIssue,
  type LinearIssueWriteInput,
  type LinearProjectClientInput,
  type LinearWriteView,
  type WorkItemRecord,
} from "@syn/validators";
import type {
  ConnectionsRecords,
  LinearRecords,
} from "@/lib/data/integration-records";
import { parse, PlannerRefusal } from "../planner";
import type { FixtureRecords } from "../records";
import {
  noIntegrations,
  type IntegrationRecords,
  type LinearOutboxRow,
  type LinearWorkspaceRecords,
} from "./records";

/**
 * The integration side of the fixture server (USE-56): Linear's snapshot and
 * outbox, the Google calendars and the client mappings, an in-memory fake of
 * the Linear and connections routers. Synapse's value is written first and
 * stands; the outbox row beside it goes pending, then the fake sender marks
 * it sent or failed, and a failed row never reverts what Synapse shows. Only
 * status, done and reopen (and the Item sheet's priority, description and
 * estimate) reach the outbox; Settings, placing, filtering, clients and
 * tiers never do (D-USE-57, C-USE-settings-4). Not undoable: Settings saves
 * as made, and a Linear write is retried, not undone.
 */

/** How long the fake sender takes, so a capture can see pending. */
export const LINEAR_SEND_MS = 600;

/** The workspace's one client, or set per project (D-USE-91). */
export const workspaceClientInput = z.object({
  connectionId: z.string().uuid(),
  clientId: z.string().uuid().nullable(),
  perProject: z.boolean(),
});

export type WorkspaceClientInput = z.infer<typeof workspaceClientInput>;

/** Remove client, or its Undo (USE-86). */
export const clientArchivedInput = z.object({
  id: z.string().uuid(),
  archived: z.boolean(),
});

export type ClientArchivedInput = z.infer<typeof clientArchivedInput>;

export interface IntegrationOptions {
  /** `fail`: each outbox row's first send fails; Try again sends it. */
  linearSends?: "fail";
  /** Issue ids the next sync finds closed in Linear. */
  linearClosesOnSync?: string[];
}

export interface IntegrationServer {
  readConnections(): Promise<ConnectionsRecords>;
  readLinear(): Promise<LinearRecords>;
  /** Status, priority, description or estimate: Synapse first, then a pending row. */
  writeLinearIssue(raw: LinearIssueWriteInput): Promise<LinearWriteView>;
  /**
   * The check (data contract): done moves the issue to its team's first
   * completed state and keeps the one it left; undone moves it back there.
   */
  writeLinearDone(raw: {
    workItemId: string;
    done: boolean;
  }): Promise<LinearWriteView>;
  /** Try again: a failed row goes pending and is sent again. */
  retryLinearWrite(id: string): Promise<LinearWriteView>;
  /** Sync now, or the background sync: one workspace, or every one. */
  syncLinear(connectionId?: string): Promise<void>;
  /** The fake sender: every pending row is sent, unless offline. */
  sendLinearOutbox(): void;
  writeProjectClient(raw: LinearProjectClientInput): Promise<void>;
  writeWorkspaceClient(raw: WorkspaceClientInput): Promise<void>;
  writeCalendar(raw: GoogleCalendarToggleInput): Promise<void>;
  writeClientsEnabled(raw: ClientsEnabledInput): Promise<void>;
  /** A new client, or with `id` a change to one. */
  writeClient(raw: ClientInput & { id?: string }): Promise<ClientRecord>;
  /**
   * Remove client, or its Undo (USE-86): the row is archived, never deleted,
   * so its work resolves to no client (Personal) and Undo brings it back
   * with every mapping and its place in the order. Nothing reaches Linear.
   */
  writeClientArchived(raw: ClientArchivedInput): Promise<void>;
  disconnect(connectionId: string): Promise<void>;
}

export function createIntegrationServer({
  records,
  now,
  isOffline,
  offlineError,
  options,
}: {
  records: FixtureRecords;
  now: () => Date;
  isOffline: () => boolean;
  offlineError: () => Error;
  options: IntegrationOptions;
}): IntegrationServer {
  const data: IntegrationRecords = (records.integrations ??= noIntegrations());
  const closesOnSync = new Set(options.linearClosesOnSync ?? []);
  const stamp = () => now().toISOString();

  function run<T>(fn: () => T): Promise<T> {
    try {
      return Promise.resolve(fn());
    } catch (error) {
      return Promise.reject(error);
    }
  }

  function findWorkspace(connectionId: string): LinearWorkspaceRecords {
    const workspace = data.linear.find((w) => w.connection.id === connectionId);
    if (!workspace) {
      throw new PlannerRefusal("unknown", "No workspace with that id.");
    }
    return workspace;
  }

  function issuesOf(workspace: LinearWorkspaceRecords): LinearIssue[] {
    return [...workspace.snapshot.issues, ...workspace.snapshot.subIssues];
  }

  /** A linked, open-in-Synapse work item and the issue it links. */
  function findLinked(workItemId: string) {
    const item = records.workItems.find(
      (row) => row.id === workItemId && row.archivedAt === null,
    );
    if (!item) {
      throw new PlannerRefusal("unknown", "No work item with that id.");
    }
    if (item.linearConnectionId === null || item.linearIssueId === null) {
      // D-USE-57: Synapse-only work is never written to Linear.
      throw new PlannerRefusal("invalid", "That task is not in Linear.");
    }
    const workspace = findWorkspace(item.linearConnectionId);
    const issue = issuesOf(workspace).find((i) => i.id === item.linearIssueId);
    if (!issue) {
      throw new PlannerRefusal("unknown", "No issue with that id.");
    }
    return { item, workspace, issue };
  }

  function firstOfType(
    workspace: LinearWorkspaceRecords,
    teamId: string,
    type: string,
  ) {
    return workspace.snapshot.states
      .filter((s) => s.teamId === teamId && s.type === type)
      .sort((a, b) => a.position - b.position)[0];
  }

  function view(row: LinearOutboxRow): LinearWriteView {
    return linearWriteView.parse(row);
  }

  let timer: ReturnType<typeof setTimeout> | null = null;
  function scheduleSend() {
    if (timer !== null) return;
    timer = setTimeout(() => {
      timer = null;
      server.sendLinearOutbox();
    }, LINEAR_SEND_MS);
  }

  function enqueue(
    workItemId: string,
    workspace: LinearWorkspaceRecords,
    issue: LinearIssue,
    kind: LinearOutboxRow["kind"],
    change: LinearOutboxRow["change"],
  ): LinearWriteView {
    const row: LinearOutboxRow = {
      id: crypto.randomUUID(),
      workItemId,
      kind,
      state: "pending",
      createdAt: stamp(),
      connectionId: workspace.connection.id,
      issueId: issue.id,
      change,
      sends: 0,
    };
    data.outbox.push(row);
    scheduleSend();
    return view(row);
  }

  /** Synapse's copy of the issue changes first, and stands whatever the send does. */
  function apply(issue: LinearIssue, change: LinearOutboxRow["change"]) {
    for (const [key, value] of Object.entries(change)) {
      if (value !== undefined) Object.assign(issue, { [key]: value });
    }
    linearIssueSchema.parse(issue);
  }

  /** D-USE-97: closed in Linear closes the task and every open session. */
  function closeFromLinear(item: WorkItemRecord, at: string) {
    Object.assign(
      item,
      workItemRecord.parse({
        ...item,
        doneAt: at,
        doneSource: "linear",
        updatedAt: at,
      }),
    );
    for (const slot of records.slots) {
      if (slot.workItemId === item.id && slot.doneAt === null) {
        Object.assign(
          slot,
          slotRecord.parse({ ...slot, doneAt: at, updatedAt: at }),
        );
      }
    }
  }

  function syncOne(workspace: LinearWorkspaceRecords, at: string) {
    for (const issue of issuesOf(workspace)) {
      if (!closesOnSync.delete(issue.id)) continue;
      const done = firstOfType(workspace, issue.teamId, "completed");
      if (done) issue.stateId = done.id;
    }
    linearSnapshotPayload.parse(workspace.snapshot);
    const closed = new Set(
      workspace.snapshot.states
        .filter((s) => s.type === "completed")
        .map((s) => s.id),
    );
    for (const item of records.workItems) {
      if (
        item.linearConnectionId !== workspace.connection.id ||
        item.doneAt !== null ||
        item.archivedAt !== null
      ) {
        continue;
      }
      const issue = issuesOf(workspace).find(
        (i) => i.id === item.linearIssueId,
      );
      if (issue && closed.has(issue.stateId)) closeFromLinear(item, at);
    }
    workspace.connection = linearConnectionView.parse({
      ...workspace.connection,
      lastSyncedAt: at,
      lastSyncError: null,
    });
  }

  const server: IntegrationServer = {
    readConnections() {
      return run(() =>
        structuredClone({
          linear: data.linear.map((w) =>
            linearConnectionView.parse(w.connection),
          ),
          googleAccounts: data.googleAccounts,
          googleCalendars: data.googleCalendars.map((c) =>
            googleCalendarView.parse(c),
          ),
          clientsEnabled: records.clientsEnabled,
          clients: [...records.clients].sort(
            (a, b) => a.sortOrder - b.sortOrder,
          ),
          projectClients: data.projectClients.map((row) =>
            linearProjectClientInput.parse(row),
          ),
        }),
      );
    },

    readLinear() {
      return run(() => {
        const placed = new Set(
          records.workItems.map(
            (item) => `${item.linearConnectionId}:${item.linearIssueId}`,
          ),
        );
        const notInPool = data.linear.flatMap((w) => {
          const open = new Set(
            w.snapshot.states
              .filter(
                (s) => !["completed", "canceled", "duplicate"].includes(s.type),
              )
              .map((s) => s.id),
          );
          return issuesOf(w)
            .filter(
              (issue) =>
                issue.assignedToMe &&
                open.has(issue.stateId) &&
                !placed.has(`${w.connection.id}:${issue.id}`),
            )
            .map((issue) => ({
              ...linearIssueSchema.parse(issue),
              connectionId: w.connection.id,
            }));
        });
        // A copy through the view schemas: nothing past them leaves.
        return structuredClone({
          connections: data.linear.map((w) =>
            linearConnectionView.parse(w.connection),
          ),
          workspaces: data.linear.map((w) => ({
            connectionId: w.connection.id,
            payload: linearSnapshotPayload.parse(w.snapshot),
          })),
          outbox: data.outbox.map(view),
          notInPool,
        });
      });
    },

    writeLinearIssue(raw) {
      return run(() => {
        const { workItemId, ...change } = parse(linearIssueWriteInput, raw);
        const { workspace, issue } = findLinked(workItemId);
        if (
          change.stateId !== undefined &&
          !workspace.snapshot.states.some(
            (s) => s.id === change.stateId && s.teamId === issue.teamId,
          )
        ) {
          throw new PlannerRefusal("unknown", "No status with that id.");
        }
        apply(issue, change);
        const kind =
          change.stateId !== undefined
            ? "status"
            : change.priority !== undefined
              ? "priority"
              : change.description !== undefined
                ? "description"
                : "estimate";
        return enqueue(workItemId, workspace, issue, kind, change);
      });
    },

    writeLinearDone({ workItemId, done }) {
      return run(() => {
        const { workspace, issue } = findLinked(workItemId);
        let target: string | undefined;
        if (done) {
          data.prevStateIds[workItemId] = issue.stateId;
          target = firstOfType(workspace, issue.teamId, "completed")?.id;
        } else {
          target =
            data.prevStateIds[workItemId] ??
            firstOfType(workspace, issue.teamId, "unstarted")?.id;
          delete data.prevStateIds[workItemId];
        }
        if (target === undefined) {
          throw new PlannerRefusal("unknown", "No status to move to.");
        }
        apply(issue, { stateId: target });
        return enqueue(workItemId, workspace, issue, done ? "done" : "reopen", {
          stateId: target,
        });
      });
    },

    retryLinearWrite(id) {
      return run(() => {
        const row = data.outbox.find((r) => r.id === id);
        if (!row) {
          throw new PlannerRefusal("unknown", "No Linear write with that id.");
        }
        if (row.state !== "failed") return view(row);
        row.state = "pending";
        scheduleSend();
        return view(row);
      });
    },

    syncLinear(connectionId) {
      if (isOffline()) return Promise.reject(offlineError());
      return run(() => {
        const at = stamp();
        const targets =
          connectionId === undefined
            ? data.linear
            : [findWorkspace(connectionId)];
        for (const workspace of targets) syncOne(workspace, at);
      });
    },

    sendLinearOutbox() {
      // Offline holds every write as pending; the persister replays it (wave 3).
      if (isOffline()) return;
      for (const row of data.outbox) {
        if (row.state !== "pending") continue;
        row.state =
          options.linearSends === "fail" && row.sends === 0 ? "failed" : "sent";
        row.sends += 1;
      }
    },

    writeProjectClient(raw) {
      return run(() => {
        const input = parse(linearProjectClientInput, raw);
        const workspace = findWorkspace(input.connectionId);
        if (
          !workspace.snapshot.projects.some((p) => p.id === input.projectId)
        ) {
          throw new PlannerRefusal("unknown", "No project with that id.");
        }
        requireClient(input.clientId);
        data.projectClients = data.projectClients.filter(
          (row) =>
            !(
              row.connectionId === input.connectionId &&
              row.projectId === input.projectId
            ),
        );
        data.projectClients.push(input);
      });
    },

    writeWorkspaceClient(raw) {
      return run(() => {
        const input = parse(workspaceClientInput, raw);
        const workspace = findWorkspace(input.connectionId);
        requireClient(input.clientId);
        workspace.connection = linearConnectionView.parse({
          ...workspace.connection,
          clientId: input.perProject ? null : input.clientId,
          perProject: input.perProject,
        });
      });
    },

    writeCalendar(raw) {
      return run(() => {
        const input = parse(googleCalendarToggleInput, raw);
        const calendar = data.googleCalendars.find(
          (c) => c.id === input.calendarId,
        );
        if (!calendar) {
          throw new PlannerRefusal("unknown", "No calendar with that id.");
        }
        calendar.enabled = input.enabled;
      });
    },

    writeClientsEnabled(raw) {
      return run(() => {
        records.clientsEnabled = parse(clientsEnabledInput, raw).enabled;
      });
    },

    writeClient(raw) {
      return run(() => {
        const input = parse(clientInput, raw);
        const at = stamp();
        if (raw.id !== undefined) {
          const row = records.clients.find((c) => c.id === raw.id);
          if (!row) {
            throw new PlannerRefusal("unknown", "No client with that id.");
          }
          Object.assign(
            row,
            clientRecord.parse({
              ...row,
              ...input,
              logoPath: input.logoPath ?? null,
              updatedAt: at,
            }),
          );
          return structuredClone(row);
        }
        const record = clientRecord.parse({
          id: crypto.randomUUID(),
          createdAt: at,
          updatedAt: at,
          name: input.name,
          colorKey: input.colorKey,
          logoPath: input.logoPath ?? null,
          sortOrder: input.sortOrder,
          archivedAt: null,
        });
        records.clients.push(record);
        return structuredClone(record);
      });
    },

    writeClientArchived(raw) {
      return run(() => {
        const input = parse(clientArchivedInput, raw);
        const row = records.clients.find((c) => c.id === input.id);
        if (!row) {
          throw new PlannerRefusal("unknown", "No client with that id.");
        }
        const at = stamp();
        Object.assign(
          row,
          clientRecord.parse({
            ...row,
            archivedAt: input.archived ? at : null,
            updatedAt: at,
          }),
        );
      });
    },

    disconnect(connectionId) {
      return run(() => {
        findWorkspace(connectionId);
        // [ASSUMPTION] Its work items stay, identifiers and all; they read as Synapse-only until it reconnects.
        data.linear = data.linear.filter(
          (w) => w.connection.id !== connectionId,
        );
        data.projectClients = data.projectClients.filter(
          (row) => row.connectionId !== connectionId,
        );
        data.outbox = data.outbox.filter(
          (row) => row.connectionId !== connectionId,
        );
      });
    },
  };

  function requireClient(id: string | null) {
    if (
      id !== null &&
      !records.clients.some((c) => c.id === id && c.archivedAt === null)
    ) {
      throw new PlannerRefusal("unknown", "No client with that id.");
    }
  }

  return server;
}
